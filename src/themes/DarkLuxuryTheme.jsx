import React from 'react'
import BaseThemeEngine from './BaseThemeEngine'
import { THEMES } from '../config/constants'

export default function DarkLuxuryTheme(props) {
  return <BaseThemeEngine {...props} layout={THEMES.DARK_LUXURY} />
}
