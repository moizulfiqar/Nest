import { toast } from '@heroui/react'

export const addToast = ({ title, description, color, ...props }: any) => {
  const message = description || title || 'Notification'
  const options = { ...props }
  if (color === 'danger') {
    toast.danger(message, options)
  } else if (color === 'success') {
    toast.success(message, options)
  } else if (color === 'warning') {
    toast.warning(message, options)
  } else {
    toast(message, options)
  }
}
