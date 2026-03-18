import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-mist text-earth',
    success: 'bg-matcha/10 text-matcha',
    warning: 'bg-aged/20 text-earth',
    danger: 'bg-red-50 text-red-600',
    muted: 'bg-mist/50 text-earth/60',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-light rounded-sm tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
