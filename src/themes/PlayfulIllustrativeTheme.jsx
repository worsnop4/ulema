import React from 'react'
import BaseThemeEngine from './BaseThemeEngine'
import { THEMES } from '../config/constants'

export default function PlayfulIllustrativeTheme(props) {
  return <BaseThemeEngine {...props} layout={THEMES.PLAYFUL_ILLUSTRATIVE} />
}
