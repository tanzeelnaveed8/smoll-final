import axios from 'axios'
import { toast } from 'vue3-toastify'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

    if (msgStr && error.response?.status !== 403 && error.config?.method !== 'get') {
      toast.error(msgStr)
    }

    throw error
  }
)

export default api
