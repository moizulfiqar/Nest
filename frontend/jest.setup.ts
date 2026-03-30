import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'
import React from 'react'

globalThis.React = React

// Mock framer-motion due to how Jest 30 ESM resolution treats
// motion-dom's internal .mjs imports as "outside test scope".
jest.mock('framer-motion', () => {
  return {
    ...jest.requireActual('framer-motion'),
    LazyMotion: ({ children }) => children,
  }
})

jest.mock('next-auth/react', () => {
  return {
    ...jest.requireActual('next-auth/react'),
    useSession: () => ({
      data: {
        expires: '2099-01-01T00:00:00.000Z',
        user: { name: 'Test User', email: 'test@example.com', login: 'testuser', isLeader: true },
      },
      loading: false,
      status: 'authenticated',
    }),
  }
})

jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  const back = jest.fn()
  const forward = jest.fn()
  const prefetch = jest.fn()
  const push = jest.fn()
  const replace = jest.fn()

  const mockRouter = { push, replace, prefetch, back, forward }

  return {
    ...actual,
    useParams: jest.fn(() => ({})),
    usePathname: jest.fn(() => '/'),
    useRouter: jest.fn(() => mockRouter),
    useSearchParams: jest.fn(() => new URLSearchParams()),
  }
})

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockedLink({
    children,
    href,
    className,
    onClick,
    ...props
  }: {
    children: React.ReactNode
    href?: string
    className?: string
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
    [key: string]: unknown
  }) {
    return React.createElement(
      'a',
      {
        href,
        className,
        ...props,
        onClick: (e) => {
          e.preventDefault()
          onClick?.(e as React.MouseEvent<HTMLAnchorElement>)
        },
      },
      children
    )
  },
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    fill,
    objectFit,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
    [key: string]: unknown
  }) =>
    React.createElement('img', {
      src,
      alt,
      style: fill ? { objectFit: objectFit as React.CSSProperties['objectFit'] } : undefined,
      ...props,
    }),
}))

beforeAll(() => {
  if (globalThis !== undefined) {
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 0)
    })

    Object.defineProperty(globalThis, 'runAnimationFrameCallbacks', {
      value: () => {},
      configurable: true,
      writable: true,
    })
  }

  globalThis.ResizeObserver = class {
    disconnect = jest.fn()
    observe = jest.fn()
    unobserve = jest.fn()
  }
})

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const message = args.join(' ')
    if (message.includes('not wrapped in act(...)')) return
    throw new Error(`Console error: ${message}`)
  })

  jest.spyOn(globalThis.console, 'warn').mockImplementation((message) => {
    if (
      typeof message === 'string' &&
      message.includes('[@zag-js/dismissable] node is `null` or `undefined`')
    ) {
      return
    }
  })

  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      addListener: jest.fn(),
      dispatchEvent: jest.fn(),
      removeEventListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  })

  globalThis.removeAnimationFrameCallbacks = jest.fn()
  globalThis.runAnimationFrameCallbacks = jest.fn()
})

jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ theme: 'light', setTheme: jest.fn() })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}))

jest.mock('ics', () => {
  return {
    __esModule: true,
    createEvent: jest.fn(),
  }
})

jest.mock('@apollo/client/react', () => {
  const actual = jest.requireActual('@apollo/client/react')
  const mockUseMutation = jest.fn(() => [
    jest.fn().mockResolvedValue({ data: {} }),
    { data: null, loading: false, error: null, called: false },
  ])

  return {
    ...actual,
    useMutation: mockUseMutation,
  }
})

const passThrough = ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => {
  // Translate some common HeroUI props to data-attributes for testing
  const dataProps: any = {}
  if (props.variant) dataProps['data-variant'] = props.variant
  if (props.color) dataProps['data-color'] = props.color
  if (props.size) dataProps['data-size'] = props.size

  return React.createElement(React.Fragment, null, children)
}

const buttonElement = ({
  children,
  onPress,
  onClick,
  className,
  isDisabled,
  variant,
  color,
  size,
  radius,
  isLoading,
  ...props
}: {
  children: React.ReactNode
  onPress?: (e: any) => void
  onClick?: (e: any) => void
  className?: string
  isDisabled?: boolean
  variant?: string
  color?: string
  size?: string
  radius?: string
  isLoading?: boolean
  [key: string]: any
}) => {
  const {
    onPressStart,
    onPressEnd,
    onPressChange,
    onPressUp,
    onPressStartChange,
    ...domProps
  } = props as any
  const dataProps: any = {}
  if (variant) dataProps['data-variant'] = variant
  if (color) dataProps['data-color'] = color
  if (size) dataProps['data-size'] = size
  if (radius) dataProps['data-radius'] = radius

  return React.createElement(
    'button',
    {
      ...domProps,
      ...dataProps,
      className,
      disabled: isDisabled || isLoading,
      onClick: onPress || onClick,
    },
    isLoading ? 'Loading...' : children
  )
}

const toastMock = Object.assign(jest.fn(), {
  success: jest.fn(),
  danger: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
})

const ToastMock = Object.assign(passThrough, {
  Provider: passThrough,
  Content: passThrough,
  Indicator: passThrough,
  Title: passThrough,
  Description: passThrough,
  ActionButton: buttonElement,
  CloseButton: buttonElement,
  Queue: passThrough,
  toast: toastMock,
})

const TooltipMock = Object.assign(passThrough, {
  Trigger: passThrough,
  Content: () => null,
})

const ListBoxMock = Object.assign(passThrough, {
  Item: ({ children, textValue, ...props }: any) =>
    React.createElement(
      'div',
      { title: textValue, 'data-key': props.key || props.id, 'data-testid': 'select-item' },
      children
    ),
})

const globalAddToast = jest.fn()

const stripHeroUIProps = (props: any) => {
  const {
    variant,
    color,
    size,
    radius,
    isOpen,
    isRequired,
    isDisabled,
    isInvalid,
    isLoading,
    isReadOnly,
    isFullWidth,
    showControls,
    showShadow,
    errorMessage,
    description,
    labelPlacement,
    onSelectionChange,
    onValueChange,
    inputValue,
    onInputChange,
    selectedKey,
    defaultSelectedKey,
    defaultSelectedKeys,
    menuTrigger,
    allowsCustomValue,
    popoverProps,
    listboxProps,
    inputProps,
    onClear,
    isClearable,
    startContent,
    endContent,
    clearButtonProps,
    selectorButtonProps,
    scrollShadowProps,
    validationState,
    validationBehavior,
    onOpenChange,
    onClose,
    classNames,
    disableAnimation,
    ...domProps
  } = props
  return domProps
}

const herouiMock = {
  Autocomplete: Object.assign(
    (props: any) => {
      const { label, onInputChange, onSelectionChange, children, ...rest } = props
      const domProps = stripHeroUIProps(rest)
      const handleChange = (e: any) => {
        if (onInputChange) onInputChange(e.target.value)
        if (domProps.onChange) domProps.onChange(e)
      }
      return React.createElement(
        'div',
        { 'data-testid': 'autocomplete' },
        label && React.createElement('label', { key: 'label' }, label),
        React.createElement('input', {
          key: 'input',
          ...domProps,
          onChange: handleChange,
        }),
        children
      )
    },
    {
      Trigger: passThrough,
      Value: passThrough,
      Indicator: passThrough,
      Popover: passThrough,
      Filter: passThrough,
      ClearButton: passThrough,
    }
  ),
  AutocompleteItem: passThrough,
  Breadcrumbs: passThrough,
  BreadcrumbsItem: passThrough,
  Button: buttonElement,
  TextField: Object.assign(passThrough, {
    Label: passThrough,
    Input: passThrough,
    Error: passThrough,
    Description: passThrough,
  }),
  Label: passThrough,
  FieldError: passThrough,
  Header: passThrough,
  Input: (props: any) => {
    const { label, onValueChange, children, ...rest } = props
    const domProps = stripHeroUIProps(rest)
    const handleChange = (e: any) => {
      if (onValueChange) onValueChange(e.target.value)
      if (domProps.onChange) domProps.onChange(e)
    }
    return React.createElement(
      'div',
      null,
      label && React.createElement('label', { key: 'label' }, label),
      React.createElement('input', {
        key: 'input',
        'aria-label': typeof label === 'string' ? label : undefined,
        ...domProps,
        onChange: handleChange,
      })
    )
  },
  Textarea: (props: any) => {
    const { label, onValueChange, children, ...rest } = props
    const domProps = stripHeroUIProps(rest)
    const handleChange = (e: any) => {
      if (onValueChange) onValueChange(e.target.value)
      if (domProps.onChange) domProps.onChange(e)
    }
    return React.createElement(
      'div',
      null,
      label && React.createElement('label', { key: 'label' }, label),
      React.createElement('textarea', {
        key: 'textarea',
        'aria-label': typeof label === 'string' ? label : undefined,
        ...domProps,
        onChange: handleChange,
      })
    )
  },
  ListBox: ListBoxMock,
  ListBoxItem: ListBoxMock.Item,
  ListBoxSection: passThrough,
  Modal: Object.assign(
    (props: any) => {
      const { isOpen, children } = props
      const domProps = stripHeroUIProps(props)
      return isOpen ? React.createElement('div', { role: 'dialog', ...domProps }, children) : null
    },
    {
      Backdrop: passThrough,
      Container: passThrough,
      Dialog: passThrough,
      Header: passThrough,
      Body: passThrough,
      Footer: passThrough,
    }
  ),
  ModalBody: passThrough,
  ModalContent: passThrough,
  ModalFooter: passThrough,
  ModalHeader: passThrough,
  Pagination: (props: any) => {
    const { page, total, onChange } = props
    const domProps = stripHeroUIProps(props)
    return React.createElement(
      'div',
      { 'data-testid': 'pagination', ...domProps },
      React.createElement(
        'button',
        { key: 'prev', onClick: () => onChange(page - 1) },
        'Previous Page'
      ),
      React.createElement('span', { key: 'page' }, page),
      React.createElement('button', { key: 'next', onClick: () => onChange(page + 1) }, 'Next Page')
    )
  },
  Select: Object.assign(
    (props: any) => {
      const [isOpen, setIsOpen] = React.useState(false)
      const { children, label, name, selectedKeys, onChange, onSelectionChange } = props
      const domProps = stripHeroUIProps(props)

      const selectedValue =
        selectedKeys && typeof selectedKeys === 'object' && 'size' in selectedKeys
        ? Array.from(selectedKeys)[0]
        : Array.isArray(selectedKeys)
          ? selectedKeys[0]
          : selectedKeys

    let triggerText = label || name || ''
    const options: any[] = []

    React.Children.forEach(children, (child: any) => {
      if (child) {
        let optValue = (child.key as string)?.replace('.$', '') || child.props?.id
        const optLabel = child.props?.textValue || child.props?.children
        options.push({ key: optValue, value: optValue, label: optLabel })
        if (optValue === selectedValue) {
          triggerText = optLabel || triggerText
        }
      }
    })

    return React.createElement(
      'div',
      { 'data-testid': 'select-wrapper', className: domProps.className },
      React.createElement(
        'button',
        {
          key: 'btn',
          type: 'button',
          'data-testid': 'select-trigger',
          'aria-label': domProps['aria-label'],
          'aria-expanded': isOpen,
          'aria-haspopup': 'listbox',
          onClick: () => setIsOpen(!isOpen),
        },
        React.createElement('span', { 'data-slot': 'value' }, triggerText)
      ),
      React.createElement(
        'select',
        {
          key: 'hidden-select',
          role: 'combobox',
          hidden: true,
          value: selectedValue || '',
          onChange: onChange || (() => {}),
        },
        options.map((opt) =>
          React.createElement('option', { key: opt.key, value: opt.value }, opt.label)
        )
      ),
      React.createElement(
        'button',
        {
          key: 'empty-trigger',
          type: 'button',
          'data-testid': 'select-trigger-empty',
          style: { display: 'none' },
          onClick: () => {
            if (onSelectionChange) onSelectionChange(new Set([]))
            if (onChange) onChange({ target: { value: '', name } } as any)
          },
        },
        'Empty'
      ),
      isOpen &&
        React.createElement(
          'div',
          { key: 'popover', 'data-testid': 'select-popover', role: 'listbox' },
          children
        )
    )
  }, {
    Trigger: passThrough,
    Value: passThrough,
    Popover: passThrough,
    Portal: passThrough,
    Content: passThrough,
    Indicator: passThrough,
    Item: passThrough,
    Section: passThrough,
  }),
  SelectItem: (props: any) => {
    const { children, textValue } = props
    const domProps = stripHeroUIProps(props)
    return React.createElement(
      'button',
      {
        type: 'button',
        role: 'option',
        title: textValue,
        'aria-selected': false,
        'data-testid': 'select-item',
        ...domProps,
      },
      children
    )
  },
  Skeleton: (props: any) => {
    const { children, className } = props
    const domProps = stripHeroUIProps(props)
    return React.createElement('div', { className, 'data-testid': 'skeleton', ...domProps }, children)
  },
  Toast: ToastMock,
  ToastProvider: passThrough,
  ToastQueue: passThrough,
  Tooltip: TooltipMock,
  addToast: globalAddToast,
  toast: toastMock,
  useDisclosure: () => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onOpenChange: jest.fn(),
  }),
}

jest.mock('@heroui/react', () => herouiMock, { virtual: true })
jest.mock('@heroui/toast', () => herouiMock, { virtual: true })
jest.mock('@heroui/button', () => herouiMock, { virtual: true })
jest.mock('@heroui/modal', () => herouiMock, { virtual: true })
jest.mock('@heroui/tooltip', () => herouiMock, { virtual: true })
jest.mock('@heroui/skeleton', () => herouiMock, { virtual: true })
jest.mock('utils/toastWrapper', () => ({
  addToast: globalAddToast,
}))

expect.extend(toHaveNoViolations)
