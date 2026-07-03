'use client'

import { useTheme } from '@/lib/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme()
  return <>{children}</>
}