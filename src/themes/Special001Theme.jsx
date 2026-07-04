import BaseThemeEngine from './BaseThemeEngine'
import { THEMES } from '../config/constants'

export default function Special001Theme(props) {
  return <BaseThemeEngine {...props} layout={THEMES.SPECIAL_001} />
}
