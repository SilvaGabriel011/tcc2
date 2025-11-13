import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export function Section({ children, className = '', id }: SectionProps) {
  return (
    <section
      id={id}
      className={`bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function SectionHeader({ title, description, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {icon && <div className="text-primary">{icon}</div>}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
}
