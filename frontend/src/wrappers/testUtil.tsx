import { render as rtlRender } from '@testing-library/react'
import { BreadcrumbRoot } from 'contexts/BreadcrumbContext'
import React from 'react'

function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <BreadcrumbRoot>{children}</BreadcrumbRoot>
    ),
    ...options,
  })
}

export * from '@testing-library/react'

export { render }
