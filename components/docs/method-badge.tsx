import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MethodBadgeProps {
  method: string
  path: string
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  POST: 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  PUT: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  PATCH: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  DELETE: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
}

export function MethodBadge({ method, path }: MethodBadgeProps) {
  const colorClass = methodColors[method.toUpperCase()] || methodColors.GET

  return (
    <div className="not-prose flex items-center gap-2 my-4">
      <Badge className={cn('font-mono font-semibold', colorClass)}>
        {method.toUpperCase()}
      </Badge>
      <code className="text-sm text-slate-700 dark:text-slate-300 font-mono">{path}</code>
    </div>
  )
}
