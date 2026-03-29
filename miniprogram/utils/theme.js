/**
 * 主题与色彩管理模块
 * 根据情绪方向动态切换色彩系统
 */

const THEMES = {
  bright: {
    primary: '#FF9F43',
    secondary: '#FECA57',
    tertiary: '#FFA502',
    gradient: 'linear-gradient(135deg, #FF9F43, #FECA57)',
    liquidColors: ['rgba(255, 159, 67, 0.8)', 'rgba(254, 202, 87, 0.6)'],
    glowColor: 'rgba(255, 159, 67, 0.4)',
    particleColor: '#FFD700',
    bgAccent: 'rgba(255, 159, 67, 0.08)',
    cardBorder: 'rgba(255, 159, 67, 0.15)',
    textAccent: '#FF9F43'
  },
  calm: {
    primary: '#4ECDC4',
    secondary: '#48DBFB',
    tertiary: '#7ED6DF',
    gradient: 'linear-gradient(135deg, #4ECDC4, #48DBFB)',
    liquidColors: ['rgba(78, 205, 196, 0.8)', 'rgba(72, 219, 251, 0.6)'],
    glowColor: 'rgba(78, 205, 196, 0.4)',
    particleColor: '#7ED6DF',
    bgAccent: 'rgba(78, 205, 196, 0.08)',
    cardBorder: 'rgba(78, 205, 196, 0.15)',
    textAccent: '#4ECDC4'
  },
  deep: {
    primary: '#A855F7',
    secondary: '#6C5CE7',
    tertiary: '#DC143C',
    gradient: 'linear-gradient(135deg, #A855F7, #6C5CE7)',
    liquidColors: ['rgba(168, 85, 247, 0.8)', 'rgba(108, 92, 231, 0.6)'],
    glowColor: 'rgba(168, 85, 247, 0.4)',
    particleColor: '#A855F7',
    bgAccent: 'rgba(168, 85, 247, 0.08)',
    cardBorder: 'rgba(168, 85, 247, 0.15)',
    textAccent: '#A855F7'
  }
}

function getTheme(direction) {
  return THEMES[direction] || THEMES.calm
}

function getLiquidGradientCSS(direction, intensity = 0.5) {
  const theme = getTheme(direction)
  const alpha = 0.5 + intensity * 0.4
  return `linear-gradient(180deg, 
    ${theme.liquidColors[0].replace(/[\d.]+\)$/, alpha + ')')}, 
    ${theme.liquidColors[1].replace(/[\d.]+\)$/, (alpha * 0.7) + ')')}
  )`
}

function getGlowCSS(direction, intensity = 0.5) {
  const theme = getTheme(direction)
  const spread = 20 + intensity * 40
  return `0 0 ${spread}rpx ${theme.glowColor}`
}

function interpolateColor(color1, color2, factor) {
  const hex = c => parseInt(c, 16)
  const r1 = hex(color1.slice(1, 3)), g1 = hex(color1.slice(3, 5)), b1 = hex(color1.slice(5, 7))
  const r2 = hex(color2.slice(1, 3)), g2 = hex(color2.slice(3, 5)), b2 = hex(color2.slice(5, 7))
  const r = Math.round(r1 + (r2 - r1) * factor)
  const g = Math.round(g1 + (g2 - g1) * factor)
  const b = Math.round(b1 + (b2 - b1) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

module.exports = {
  THEMES,
  getTheme,
  getLiquidGradientCSS,
  getGlowCSS,
  interpolateColor
}
