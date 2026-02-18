FROM python:3.11-slim

WORKDIR /app

# Install pre-built wheels only - no compilation needed
COPY requirements.txt .
RUN pip install --no-cache-dir --only-binary=:all: pandas numpy && \
    pip install --no-cache-dir fastapi uvicorn[standard] openpyxl python-multipart pydantic

COPY . .

EXPOSE 10000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]