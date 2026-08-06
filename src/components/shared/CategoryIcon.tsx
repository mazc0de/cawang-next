"use client";
import * as LucideIcons from 'lucide-react'
import { memo } from 'react'

export interface CategoryIconProps {
  icon?: string | null
  className?: string
  defaultEmoji?: string
}

export const CategoryIcon = memo(({ icon, className, defaultEmoji = '📝' }: CategoryIconProps) => {
  const iconStr = icon?.trim() || defaultEmoji

  // If it's a known Lucide icon name (e.g. 'ShoppingBag')
  if (iconStr in LucideIcons) {
    const IconComponent = (LucideIcons as any)[iconStr]
    return <IconComponent className={className || 'h-4 w-4'} />
  }

  // Otherwise, fallback to treating it as an emoji string
  return <span className={className}>{iconStr}</span>
})

CategoryIcon.displayName = 'CategoryIcon'
