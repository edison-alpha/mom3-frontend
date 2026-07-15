import * as React from 'react'

import { Slot as SlotPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'

import { AppIcon } from '@/components/ui/app-icon'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        primary:
          'bg-[#3B33BD] text-white shadow-[0_10px_28px_-12px_rgba(59,51,189,0.8)] hover:brightness-110 focus-visible:ring-[#3B33BD]/50',
        gradient:
          'bg-[#3B33BD] text-white hover:brightness-110 focus-visible:ring-[#3B33BD]/40',
        lime:
          'bg-[#ccff00] text-[#16162a] shadow-[0_10px_28px_-12px_rgba(204,255,0,0.55)] hover:brightness-105 focus-visible:ring-[#ccff00]/60',
        dark: 'bg-[#1C1C1E] text-white hover:bg-[#262628] focus-visible:ring-[#3B33BD]/50',
        subtle: 'bg-white/[0.06] text-white hover:bg-white/[0.1] focus-visible:ring-white/40',
        danger: 'bg-red-500/15 text-red-50 hover:bg-red-500/25 focus-visible:ring-red-400/50',
        success: 'bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25 focus-visible:ring-emerald-400/50',
        destructive:
          'bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white',
        outline:
          'bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        plain: 'bg-transparent text-current hover:bg-transparent',
        transparent: 'bg-transparent text-current hover:bg-white/[0.06]',
        text: 'bg-transparent text-primary hover:bg-primary/10'
      },
      size: {
        xs: 'min-h-8 gap-1 px-2 text-[11px] has-[>svg]:px-1.5',
        compact: 'min-h-9 gap-1.5 px-2.5 text-xs has-[>svg]:px-2',
        default: 'min-h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'min-h-10 gap-1.5 px-3 text-xs has-[>svg]:px-2.5',
        lg: 'min-h-12 px-6 text-base has-[>svg]:px-4',
        xl: 'min-h-14 px-8 text-base has-[>svg]:px-5',
        'icon-xs': 'size-8',
        icon: 'size-10',
        'icon-sm': 'size-10',
        'icon-lg': 'size-12'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-md',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'full'
    }
  }
)

function Button({
  className,
  variant,
  size,
  rounded,
  color,
  asChild = false,
  loading = false,
  isLoading = false,
  isDisabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  label,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    color?: string
    loading?: boolean
    isLoading?: boolean
    isDisabled?: boolean
    startIcon?: React.ReactNode | string
    endIcon?: React.ReactNode | string
    fullWidth?: boolean
    label?: React.ReactNode
  }) {
  const Comp = asChild ? SlotPrimitive.Root : 'button'
  const resolvedLoading = loading || isLoading
  const resolvedVariant = color === 'primary'
    ? 'primary'
    : color === 'success'
      ? 'success'
      : color === 'danger'
        ? 'danger'
        : color === 'warning'
          ? 'lime'
          : color === 'dark'
            ? 'dark'
            : color === 'secondary'
              ? 'secondary'
              : color === 'ghost'
                ? 'ghost'
                : color === 'plain'
                  ? 'plain'
                  : color === 'transparent'
                    ? 'transparent'
                    : color === 'text'
                      ? 'text'
                : variant
  const renderIcon = (icon: React.ReactNode | string | undefined) =>
    typeof icon === 'string' ? <AppIcon icon={icon} aria-hidden='true' /> : icon

  return (
    <Comp
      data-slot='button'
      {...props}
      className={cn(buttonVariants({ variant: resolvedVariant, size, rounded, className }), fullWidth && 'w-full')}
      aria-busy={resolvedLoading || undefined}
      disabled={resolvedLoading || isDisabled || props.disabled}
    >
      {resolvedLoading ? <LoaderCircle className='animate-spin' aria-hidden='true' /> : renderIcon(startIcon)}
      {label ?? children}
      {!resolvedLoading && renderIcon(endIcon)}
    </Comp>
  )
}

export { Button, Button as ButtonMuiStyled, buttonVariants }
