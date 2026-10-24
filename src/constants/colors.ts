/**
 * D&G E-COMMERCE BRAND COLOR TOKENS
 * STRICT REQUIREMENT: The entire application interface must use ONLY these three brand colors:
 * 1. White: #FFFFFF
 * 2. Blue:  #1565C0
 * 3. Yellow:#FFD600
 * 
 * No black, grey, green, red, orange, purple, or any other accent colors are permitted.
 * All states, badges, errors, warnings, success indicators, and charts must strictly use
 * combinations of White, Blue, and Yellow.
 */

export const COLORS = {
  white: '#FFFFFF',
  blue: '#1565C0',
  yellow: '#FFD600',

  // Semantic role mappings using exclusively the 3 brand colors
  background: '#FFFFFF',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',

  primary: '#1565C0',
  primaryText: '#1565C0',
  secondaryText: '#1565C0',
  buttonBackground: '#1565C0',
  buttonText: '#FFFFFF',

  accent: '#FFD600',
  accentText: '#1565C0',
  accentBackground: '#FFD600',

  border: '#1565C0',
  borderHighlight: '#FFD600',
  divider: '#1565C0',

  // Alert and status representations strictly using the 3 colors
  errorBorder: '#1565C0',
  errorBackground: '#FFD600',
  errorText: '#1565C0',

  successBorder: '#1565C0',
  successBackground: '#FFD600',
  successText: '#1565C0',

  warningBorder: '#1565C0',
  warningBackground: '#FFD600',
  warningText: '#1565C0',

  badgeBackground: '#FFD600',
  badgeText: '#1565C0',
  badgeBorder: '#1565C0',
  badgeActiveBackground: '#1565C0',
  badgeActiveText: '#FFD600',

  inputBackground: '#FFFFFF',
  inputBorder: '#1565C0',
  inputText: '#1565C0',
  inputPlaceholder: '#1565C0',

  tabBarBackground: '#FFFFFF',
  tabBarActive: '#1565C0',
  tabBarInactive: '#1565C0',
  tabBarIndicator: '#FFD600',
} as const;

export default COLORS;
