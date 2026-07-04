import React from 'react'
import BaseThemeEngine from './BaseThemeEngine'
import { THEMES } from '../config/constants'

export default function WatercolorFloralTheme(props) {
  return <BaseThemeEngine {...props} layout={THEMES.WATERCOLOR_FLORAL} />
}
