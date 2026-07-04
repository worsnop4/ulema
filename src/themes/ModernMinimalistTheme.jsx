import React from 'react'
import BaseThemeEngine from './BaseThemeEngine'
import { THEMES } from '../config/constants'

export default function ModernMinimalistTheme(props) {
  return <BaseThemeEngine {...props} layout={THEMES.MODERN_MINIMALIST} />
}
