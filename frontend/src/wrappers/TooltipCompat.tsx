'use client'

import { Tooltip } from '@heroui/react'
import type { ReactNode } from 'react'

interface TooltipCompatProps {
  /** Tooltip text content */
  content?: ReactNode
  /** Unique identifier for the tooltip */
  id?: string
  /** Delay before showing tooltip (ms) */
  delay?: number
  /** Delay before hiding tooltip (ms) */
  closeDelay?: number
  /** Show arrow on the tooltip */
  showArrow?: boolean
  /** Placement of the tooltip */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  /** Whether the tooltip is disabled */
  isDisabled?: boolean
  /** The element that triggers the tooltip */
  children: ReactNode
}

/**
 * Compatibility wrapper for HeroUI Tooltip v2 → v3 migration
 * 
 * Converts v2 API:
 *   <Tooltip content="text" showArrow delay={100} closeDelay={100} placement="top">{child}</Tooltip>
 * 
 * To v3 API:
 *   <Tooltip delay={100} closeDelay={100} placement="top">
 *     <Tooltip.Trigger asChild>{child}</Tooltip.Trigger>
 *     <Tooltip.Content showArrow>{text}</Tooltip.Content>
 *   </Tooltip>
 * 
 * Drop-in replacement for all existing v2 Tooltip usages.
 */
const TooltipCompatInternal = ({
  content,
  delay = 0,
  closeDelay = 0,
  showArrow = false,
  placement = 'top',
  isDisabled = false,
  children,
  id,
}: TooltipCompatProps) => {
  if (!content || isDisabled) {
    return <>{children}</>
  }

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

// Support compound component pattern by re-exporting v3 sub-parts
const TooltipCompatWithParts = TooltipCompatInternal as any
TooltipCompatWithParts.Trigger = Tooltip.Trigger
TooltipCompatWithParts.Content = Tooltip.Content
TooltipCompatWithParts.Arrow = Tooltip.Arrow

export { TooltipCompatWithParts as TooltipCompat }
