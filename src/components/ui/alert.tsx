import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AlertProps {
  children: ReactNode
  variant?: 'default' | 'destructive' | 'warning' | 'success'
  className?: string
}

interface AlertDescriptionProps {
  children: ReactNode
  className?: string
}

const Alert = ({ children, variant = 'default', className }: AlertProps) => {
  const variants = {
    default: 'bg-background text-foreground border-border',
    destructive: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    success: 'bg-green-50 text-green-900 border-green-200'
  }

  return (
    <div className={cn(
      'relative w-full rounded-lg border p-4',
      variants[variant],
      className
    )}>
      {children}
    </div>
  )
}

const AlertDescription = ({ children, className }: AlertDescriptionProps) => {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)}>
      {children}
    </div>
  )
}

const AlertTitle = ({ children, className }: { children: ReactNode, className?: string }) => {
  return (
    <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)}>
      {children}
    </h5>
  )
}

export { Alert, AlertDescription, AlertTitle }
