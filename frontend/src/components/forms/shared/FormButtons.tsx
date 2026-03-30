'use client'

import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'

interface FormButtonsProps {
  loading: boolean
  submitText?: string
  onCancel?: () => void
}

export const FormButtons = ({ loading, submitText = 'Save', onCancel }: FormButtonsProps) => {
  const router = useRouter()

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <div className="border-t border-gray-200 pt-8 text-gray-600 dark:border-gray-700 dark:text-gray-300">
      <div className="flex flex-col justify-end gap-4 sm:flex-row">
        <Button type="button" variant="outline" onPress={handleCancel} className="font-medium">
          Cancel
        </Button>
        <Button type="submit" isDisabled={loading} variant="primary" className="font-medium">
          {loading ? 'Saving...' : submitText}
        </Button>
      </div>
    </div>
  )
}
