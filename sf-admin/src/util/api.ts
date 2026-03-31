import axios from 'axios'
import { toast } from 'vue3-toastify'

// In dev with no VITE_API_URL, use '' so requests go to same origin and get proxied to backend
const baseURL =
  import.meta.env.DEV && !import.meta.env.VITE_API_URL
    ? ''
    : (import.meta.env.VITE_API_URL as string) || ''

const api = axios.create({
  baseURL,
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
    let msgStr = message

    if (Array.isArray(message)) {
      msgStr = message[0]
    }

    // Normalize method to lowercase
    const method = error.config?.method?.toLowerCase()
    const url = error.config?.url || ''

    // Strip base URL if present to match only the path
    const path = url.replace(/^https?:\/\/[^\/]+/, '')

    // Don't show toast for 404 errors on GET /admin/organizations/{id}/codes
    const is404OrganizationCodesError =
      error.response?.status === 404 &&
      method === 'get' &&
      /\/admin\/organizations\/[^\/]+\/codes\/?$/.test(path)

    // Show toast for other errors
    if (
      msgStr &&
      (error.response.status !== 401 || method !== 'get') &&
      !is404OrganizationCodesError
    ) {
      toast.error(msgStr)
    }

    throw error
  }
)

export default api
