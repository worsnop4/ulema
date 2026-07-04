import React from 'react'
import BaseThemeEngine from './BaseThemeEngine'
import { THEMES } from '../config/constants'

export default function TraditionalAdatTheme(props) {
  return <BaseThemeEngine {...props} layout={THEMES.TRADITIONAL_ADAT} />
}
