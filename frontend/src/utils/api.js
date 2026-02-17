import axios from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000')

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

export async function uploadFile(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })
  return res.data
}

export async function cleanData(payload) {
  const res = await api.post('/clean', payload)
  return res.data
}

export function getDownloadUrl(sessionId) {
  return `${BASE_URL}/download/${sessionId}`
}

export function getReportUrl(sessionId) {
  return `${BASE_URL}/report/${sessionId}`
}
