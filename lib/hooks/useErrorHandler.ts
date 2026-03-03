import { useToast } from '@/components/ui/Toast'

export function useErrorHandler() {
  const toast = useToast()

  const handleError = (error: any, customMessage?: string) => {
    console.error('Error:', error)

    let message = customMessage || '操作失败，请重试'

    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    } else if (error?.error) {
      message = error.error
    }

    toast.error(message)
  }

  const handleApiError = async (response: Response, defaultMessage = '请求失败') => {
    if (!response.ok) {
      try {
        const data = await response.json()
        toast.error(data.error || defaultMessage)
      } catch {
        toast.error(defaultMessage)
      }
      return false
    }
    return true
  }

  return { handleError, handleApiError }
}
