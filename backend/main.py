from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import re
import io
import uuid
import os
import tempfile
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI(title="PhoneClean API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use system temp dir — works on Windows, Mac, and Linux
UPLOAD_DIR = os.path.join(tempfile.gettempdir(), "phoneclean_sessions")
os.makedirs(UPLOAD_DIR, exist_ok=True)

sessions = {}

PHONE_COLUMN_KEYWORDS = [
    "phone", "mobile", "cell", "contact", "number", "mob", "ph",
    "tel", "whatsapp", "num", "fone", "mobi", "mobile no",
    "alternate mobile", "alt mobile", "mobile number", "phone number",
    "contact no", "contact number", "alternate no", "alt no",
    "primary", "secondary", "emergenc"
]


def is_phone_column(series: pd.Series, col_name: str) -> bool:
    col_lower = col_name.lower().strip()
    for kw in PHONE_COLUMN_KEYWORDS:
        if kw in col_lower:
            return True
    sample = series.dropna().astype(str).head(50)
    if len(sample) == 0:
        return False
    digit_counts = sample.apply(lambda x: len(re.sub(r'\D', '', x)))
    if (digit_counts.between(7, 15)).mean() > 0.3:
        return True
    return False


def clean_phone_number(
    raw,
    keep_indian_only: bool = True,
    remove_country_code: bool = True,
    whatsapp_format: bool = False
) -> Optional[str]:
    if raw is None or (isinstance(raw, float) and pd.isna(raw)):
        return None
    s = str(raw).strip()
    if s == "" or s.lower() == "nan":
        return None

    # Handle scientific notation e.g. 9.8765E+09 or 9.876543210e9
    # Excel often stores large numbers this way
    try:
        f = float(s)
        if not pd.isna(f):
            s = str(int(round(f)))
    except (ValueError, OverflowError):
        pass

    # Remove ALL non-digit characters (+, -, spaces, brackets, dots, quotes etc.)
    digits = re.sub(r'\D', '', s)

    if not digits:
        return None

    # Strip country code — handle every known format
    # 0091XXXXXXXXXX (14 digits)
    if digits.startswith("0091") and len(digits) == 14:
        digits = digits[4:]
    # 0091XXXXXXXXXX (any length starting with 0091)
    elif digits.startswith("0091"):
        digits = digits[4:]
    # +91XXXXXXXXXX or 91XXXXXXXXXX (12 digits)
    elif digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    # 091XXXXXXXXXX (12 digits with leading 0)
    elif digits.startswith("091") and len(digits) == 12:
        digits = digits[3:]
    # 0XXXXXXXXXX (11 digits with leading 0)
    elif digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    # Already 10 digits — use as-is
    elif len(digits) == 10:
        pass
    # 91XXXXXXXXXX stored as float like 919876543210.0 → 12 digits
    elif len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    # 13 digits — could be 0 + 91 + 10
    elif len(digits) == 13 and digits.startswith("091"):
        digits = digits[3:]
    else:
        return None

    # After stripping, must be exactly 10 digits
    if len(digits) != 10:
        return None

    # Validate Indian mobile: must start with 6, 7, 8, or 9
    if keep_indian_only and not re.match(r'^[6-9]\d{9}$', digits):
        return None

    # Return in requested format
    if whatsapp_format:
        return f"+91{digits}"
    if not remove_country_code:
        return f"91{digits}"
    return digits  # plain 10-digit number



def clean_column_vectorised(
    series: pd.Series,
    keep_indian_only: bool = True,
    remove_country_code: bool = True,
    whatsapp_format: bool = False,
) -> pd.Series:
    """Fast vectorised phone cleaning using pandas string operations."""
    s = series.copy().astype(str).str.strip()

    # Replace nan/None/empty with NaN
    s = s.replace({"nan": None, "None": None, "": None, "<NA>": None})

    # Handle scientific notation (e.g. 9.88E+09) — convert to integer string
    def fix_sci(val):
        if val is None:
            return None
        try:
            f = float(val)
            if pd.isna(f):
                return None
            return str(int(round(f)))
        except (ValueError, TypeError):
            return val

    s = s.apply(fix_sci)

    # Strip all non-digit characters
    s = s.str.replace(r"\D", "", regex=True)

    # Replace empty string with None
    s = s.replace("", None)

    # Normalise country codes using vectorised where conditions
    # 0091 prefix (14 digits)
    mask = s.notna() & s.str.startswith("0091") & (s.str.len() == 14)
    s = s.where(~mask, s.str[4:])

    # 0091 prefix (any other length)
    mask = s.notna() & s.str.startswith("0091")
    s = s.where(~mask, s.str[4:])

    # 91 prefix (12 digits)
    mask = s.notna() & s.str.startswith("91") & (s.str.len() == 12)
    s = s.where(~mask, s.str[2:])

    # 091 prefix (12 digits)
    mask = s.notna() & s.str.startswith("091") & (s.str.len() == 12)
    s = s.where(~mask, s.str[3:])

    # 0 prefix (11 digits)
    mask = s.notna() & s.str.startswith("0") & (s.str.len() == 11)
    s = s.where(~mask, s.str[1:])

    # 091 prefix (13 digits)
    mask = s.notna() & s.str.startswith("091") & (s.str.len() == 13)
    s = s.where(~mask, s.str[3:])

    # Invalidate anything that is not exactly 10 digits
    s = s.where(s.isna() | (s.str.len() == 10), None)

    # Validate Indian mobile: must start with 6-9
    if keep_indian_only:
        valid_pattern = s.notna() & s.str.match(r"^[6-9]\d{9}$")
        s = s.where(valid_pattern, None)

    # Apply output format
    if whatsapp_format:
        s = s.where(s.isna(), "+91" + s)
    elif not remove_country_code:
        s = s.where(s.isna(), "91" + s)

    return s


def detect_phone_columns(df: pd.DataFrame) -> List[str]:
    detected = []
    for col in df.columns:
        if is_phone_column(df[col], col):
            detected.append(col)
    return detected


def dataframe_preview(df: pd.DataFrame, rows: int = 20) -> dict:
    preview_df = df.head(rows).copy()
    records = []
    for _, row in preview_df.iterrows():
        record = {}
        for col in preview_df.columns:
            val = row[col]
            if val is None or (isinstance(val, float) and pd.isna(val)):
                record[col] = None
            else:
                v = str(val).strip()
                record[col] = None if v == "" or v.lower() == "nan" else v
        records.append(record)
    return {
        "columns": list(preview_df.columns),
        "rows": records,
        "total_rows": len(df),
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "PhoneClean API", "upload_dir": UPLOAD_DIR}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Robust extension check — handles spaces in filename and mixed case
    fname = file.filename or ""
    ext = fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
    if ext not in ("xlsx", "csv"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Please upload a .xlsx or .csv file."
        )

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        if ext == "csv":
            # Try utf-8 first, fall back to latin-1 (common in Indian Excel exports)
            try:
                df = pd.read_csv(
                    io.BytesIO(content),
                    dtype=str,           # Force ALL columns as string - prevents scientific notation
                    encoding="utf-8",
                    on_bad_lines="skip",
                    keep_default_na=False,  # Don't convert empty strings to NaN yet
                )
            except UnicodeDecodeError:
                df = pd.read_csv(
                    io.BytesIO(content),
                    dtype=str,
                    encoding="latin-1",
                    on_bad_lines="skip",
                    keep_default_na=False,
                )
        else:
            df = pd.read_excel(
                io.BytesIO(content),
                dtype=str,           # Force ALL columns as string
                keep_default_na=False,
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The file has no data rows.")

    df = df.dropna(how="all").reset_index(drop=True)
    # Clean column names — strip whitespace
    df.columns = [str(c).strip() for c in df.columns]

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "df": df,
        "filename": fname,
        "cleaned_df": None,
        "metrics": None,
    }

    detected_cols = detect_phone_columns(df)
    preview = dataframe_preview(df)

    return {
        "session_id": session_id,
        "filename": fname,
        "file_size": len(content),
        "detected_phone_columns": detected_cols,
        "all_columns": list(df.columns),
        "preview": preview,
    }


class CleanRequest(BaseModel):
    session_id: str
    selected_columns: List[str]
    keep_indian_only: bool = True
    remove_country_code: bool = True
    merge_columns: bool = False
    remove_duplicates: bool = True
    drop_empty_rows: bool = False
    whatsapp_format: bool = False


@app.post("/clean")
def clean_data(req: CleanRequest):
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(404, "Session not found. Please re-upload your file.")

    df = session["df"].copy()

    if not req.selected_columns:
        raise HTTPException(400, "Please select at least one phone column.")

    for col in req.selected_columns:
        if col not in df.columns:
            raise HTTPException(400, f"Column '{col}' not found in file.")

    total_records = len(df)
    duplicate_count = 0
    cleaned_cols = []

    # Clean each selected column using vectorised operations (fast for large files)
    for col in req.selected_columns:
        cleaned_col_name = f"{col}_cleaned"
        df[cleaned_col_name] = clean_column_vectorised(
            df[col],
            keep_indian_only=req.keep_indian_only,
            remove_country_code=req.remove_country_code,
            whatsapp_format=req.whatsapp_format,
        )
        cleaned_cols.append(cleaned_col_name)

    # Rows where EVERY cleaned column is null = rows with no valid number at all
    # Using all(axis=1) avoids inflating count when multiple columns are selected
    invalid_count = int(df[cleaned_cols].isna().all(axis=1).sum())

    if req.merge_columns and len(cleaned_cols) > 1:
        def pick_first_valid(*vals):
            for v in vals:
                if v is not None and str(v).strip() not in ("", "None", "nan"):
                    return v
            return None
        df["merged_phone"] = df[cleaned_cols].apply(
            lambda row: pick_first_valid(*row.values), axis=1
        )
        df = df.drop(columns=cleaned_cols)
        cleaned_cols = ["merged_phone"]

    if req.remove_duplicates:
        for col in cleaned_cols:
            before = int(df[col].notna().sum())
            valid_mask = df[col].notna()
            dupes = df[valid_mask].duplicated(subset=[col], keep="first")
            df.loc[valid_mask & dupes, col] = None
            after = int(df[col].notna().sum())
            duplicate_count += before - after

    if req.drop_empty_rows:
        mask = df[cleaned_cols].notna().any(axis=1)
        df = df[mask].reset_index(drop=True)

    # Rows with at least one valid number = valid rows
    # Using any(axis=1) so multi-column selection doesn't inflate the count
    valid_count = int(df[cleaned_cols].notna().any(axis=1).sum())

    sessions[req.session_id]["cleaned_df"] = df
    sessions[req.session_id]["metrics"] = {
        "total_records": total_records,
        "valid_numbers": valid_count,
        "invalid_removed": invalid_count,
        "duplicates_removed": duplicate_count,
        "rows_after_cleaning": len(df),
    }

    # Save cleaned file to disk immediately so download works even after server sleep
    try:
        out_path = os.path.join(UPLOAD_DIR, f"{req.session_id}_cleaned.xlsx")
        # Clean the dataframe before writing — replace None/nan with empty string
        df_export = df.copy()
        df_export = df_export.fillna("")
        # Ensure all values are plain strings — no floats, no ints
        for col in df_export.columns:
            df_export[col] = df_export[col].astype(str).replace("nan", "")
        df_export.to_excel(out_path, index=False, engine="openpyxl")
    except Exception as e:
        print(f"Save error: {e}")
        pass  # Non-fatal — download endpoint will retry

    return {
        "metrics": sessions[req.session_id]["metrics"],
        "before_preview": dataframe_preview(session["df"]),
        "after_preview": dataframe_preview(df),
        "cleaned_columns": cleaned_cols,
    }


@app.get("/download/{session_id}")
def download_file(session_id: str):
    # First check if file already saved to disk (survives server sleep)
    out_path = os.path.join(UPLOAD_DIR, f"{session_id}_cleaned.xlsx")
    
    # Try to get filename from session or use default
    filename = "cleaned_contacts.xlsx"
    session = sessions.get(session_id)
    if session:
        original_name = os.path.splitext(session["filename"])[0]
        filename = f"{original_name}_cleaned.xlsx"
        # Save to disk if not already saved
        if not os.path.exists(out_path) and session.get("cleaned_df") is not None:
            session["cleaned_df"].to_excel(out_path, index=False, engine="openpyxl")

    # If file exists on disk, serve it
    if os.path.exists(out_path):
        # Re-export cleanly to avoid Excel corruption
        try:
            import openpyxl
            df_check = pd.read_excel(out_path, dtype=str)
        except Exception:
            # File is corrupted — try to rebuild from session
            session = sessions.get(session_id)
            if session and session.get("cleaned_df") is not None:
                df_export = session["cleaned_df"].copy().fillna("")
                for col in df_export.columns:
                    df_export[col] = df_export[col].astype(str).replace("nan", "")
                df_export.to_excel(out_path, index=False, engine="openpyxl")

        return FileResponse(
            out_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=filename,
        )

    raise HTTPException(
        404,
        "Session expired — the server restarted. Please re-upload and clean your file again, then download immediately."
    )


@app.get("/report/{session_id}")
def download_report(session_id: str):
    session = sessions.get(session_id)
    if not session or not session.get("metrics"):
        raise HTTPException(404, "No report data found.")

    metrics = session["metrics"]
    report_lines = [
        "PhoneClean - Cleaning Summary Report",
        "=" * 40,
        f"Original File     : {session['filename']}",
        f"Total Records     : {metrics['total_records']}",
        f"Valid Numbers     : {metrics['valid_numbers']}",
        f"Invalid Removed   : {metrics['invalid_removed']}",
        f"Duplicates Removed: {metrics['duplicates_removed']}",
        f"Rows After Clean  : {metrics['rows_after_cleaning']}",
        "=" * 40,
        "Generated by PhoneClean",
    ]
    report_path = os.path.join(UPLOAD_DIR, f"{session_id}_report.txt")
    with open(report_path, "w") as f:
        f.write("\n".join(report_lines))

    return FileResponse(report_path, media_type="text/plain", filename="cleaning_report.txt")