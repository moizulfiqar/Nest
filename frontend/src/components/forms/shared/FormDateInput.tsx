'use client'

import { TextField, Label, Input, FieldError } from '@heroui/react'

const COMMON_INPUT_CLASS_NAMES = {
  label: 'text-sm font-semibold text-gray-600 dark:text-gray-300',
  input: 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  errorMessage: 'break-words whitespace-normal max-w-full w-full',
}

interface FormDateInputProps {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  touched?: boolean
  required?: boolean
  min?: string
  max?: string
}

export const FormDateInput = ({
  id,
  label,
  value,
  onValueChange,
  error,
  touched,
  required = false,
  min,
  max,
}: FormDateInputProps) => {
  const isInvalid = touched && !!error
  return (
    <TextField
      id={id}
      isInvalid={isInvalid}
      isRequired={required}
      className="w-full min-w-0"
      style={{ maxWidth: '100%', overflow: 'hidden' }}
    >
      <Label className={COMMON_INPUT_CLASS_NAMES.label}>{label}</Label>
      <Input
        type="date"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        min={min}
        max={max}
        className={COMMON_INPUT_CLASS_NAMES.input}
      />
      {isInvalid && error && (
        <FieldError className={COMMON_INPUT_CLASS_NAMES.errorMessage}>{error}</FieldError>
      )}
    </TextField>
  )
}
