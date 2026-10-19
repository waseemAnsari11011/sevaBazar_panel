// axiosConfig.js

import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : 'https://server.sevabazar.com')

const axiosInstance = axios.create({
  baseURL: baseURL,
})

// Add a request interceptor to include token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default axiosInstance
export { baseURL }
