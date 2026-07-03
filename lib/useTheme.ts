'use client'

import { useEffect } from 'react'
import { getTheme, applyTheme, getSystemThemeListener } from './themes'

export function useTheme() {
  useEffect(() => {
    applyTheme(getTheme())
    const theme = getTheme()
    if (theme === 'auto') {
      const cleanup = getSystemThemeListener(() => applyTheme('auto'))
      return cleanup
    }
  }, [])
}