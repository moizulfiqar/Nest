'use client'

import {
  TextField,
  Label,
  Input,
  FieldError,
  Select,
  ListBox,
  ListBoxItem,
  Autocomplete,
  AutocompleteTrigger,
  AutocompleteValue,
  AutocompleteIndicator,
  AutocompletePopover,
  Tooltip,
  Pagination,
} from '@heroui/react'
import React, { ReactNode } from 'react'

/** Compatibility Input */
export const InputCompat = ({
  label,
  errorMessage,
  isInvalid,
  isRequired,
  labelPlacement, // ignored in v3 for now
  classNames, // partial support
  ...props
}: any) => {
  return (
    <TextField isInvalid={isInvalid} isRequired={isRequired} className="w-full">
      {label && <Label className={classNames?.label}>{label}</Label>}
      <Input {...props} className={classNames?.input} />
      {errorMessage && <FieldError className={classNames?.errorMessage}>{errorMessage}</FieldError>}
    </TextField>
  )
}

/** Compatibility Select */
export const SelectCompat = ({
  label,
  errorMessage,
  isInvalid,
  isRequired,
  children,
  selectedKeys,
  onSelectionChange,
  classNames,
  ...props
}: any) => {
  const selected = React.useMemo(() => {
    if (selectedKeys instanceof Set) return selectedKeys
    if (typeof selectedKeys === 'string') return new Set([selectedKeys])
    return selectedKeys
  }, [selectedKeys])

  return (
    <Select isInvalid={isInvalid} isRequired={isRequired} className="w-full" {...props}>
      {label && <Label className={classNames?.label}>{label}</Label>}
      <Select.Trigger className={classNames?.trigger}>
        <Select.Value className={classNames?.value} />
      </Select.Trigger>
      <Select.Popover className={classNames?.popoverContent}>
        <ListBox
          selectedKeys={selected}
          onSelectionChange={onSelectionChange}
          className={classNames?.listbox}
        >
          {children}
        </ListBox>
      </Select.Popover>
      {errorMessage && <FieldError className={classNames?.errorMessage}>{errorMessage}</FieldError>}
    </Select>
  )
}

/** Compatibility Autocomplete */
export const AutocompleteCompat = ({
  label,
  errorMessage,
  isInvalid,
  isRequired,
  children,
  inputValue,
  onInputChange,
  onSelectionChange,
  selectedKey,
  defaultItems,
  items,
  ...props
}: any) => {
  const finalItems = items || defaultItems
  const renderedChildren =
    typeof children === 'function' && finalItems ? finalItems.map(children) : children

  // Remove known invalid props from props to avoid TS errors
  const { labelPlacement, inputProps, ...validProps } = props

  return (
    <Autocomplete
      isInvalid={isInvalid}
      isRequired={isRequired}
      className="w-full"
      inputValue={inputValue}
      onInputChange={onInputChange}
      onSelectionChange={onSelectionChange}
      selectedKey={selectedKey}
      {...validProps}
    >
      {label && <Label>{label}</Label>}
      <AutocompleteTrigger>
        <AutocompleteValue />
        <AutocompleteIndicator />
      </AutocompleteTrigger>
      <AutocompletePopover>
        <ListBox>{renderedChildren}</ListBox>
      </AutocompletePopover>
      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Autocomplete>
  )
}

/** Compatibility Tooltip */
export const TooltipCompat = ({
  content,
  delay = 0,
  closeDelay = 0,
  showArrow = false,
  placement = 'top',
  isDisabled = false,
  children,
  id,
}: any) => {
  if (!content || isDisabled) return <>{children}</>
  const validPlacement = (placement === 'center' ? 'top' : placement) as any

  return (
    <Tooltip delay={delay} closeDelay={closeDelay}>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Content showArrow={showArrow} placement={validPlacement}>
        {content}
      </Tooltip.Content>
    </Tooltip>
  )
}

/** Compatibility Pagination */
export const PaginationCompat = ({ page, value, ...props }: any) => {
  return <Pagination value={value || page} {...props} />
}

export {
  ListBoxItem as SelectItem,
  ListBoxItem as AutocompleteItem,
  ListBoxItem as Item,
  PaginationCompat as Pagination,
}
