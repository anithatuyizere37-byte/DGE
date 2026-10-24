import COLORS from './colors';

export const THEME = {
  colors: COLORS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 26,
      fontWeight: '700' as const,
      color: COLORS.blue,
      lineHeight: 32,
    },
    h2: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: COLORS.blue,
      lineHeight: 26,
    },
    h3: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: COLORS.blue,
      lineHeight: 22,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: COLORS.blue,
      lineHeight: 20,
    },
    bodyBold: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: COLORS.blue,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: COLORS.blue,
      lineHeight: 16,
    },
    button: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: COLORS.white,
    },
  },
  shopInfo: {
    name: 'D&G E-Commerce',
    tagline: 'Quality Retail Shopping in Rwamagana',
    location: 'Rwamagana, Eastern Province, Rwanda',
    phone: '+250 788 000 000',
    email: 'info@dgecommerce.rw',
    currency: 'RWF',
  },
  categories: [
    'Clothes',
    'Shoes',
    'Bags',
    'Household Equipment',
    'Jewellery',
    'Cosmetics',
  ] as const,
};

export default THEME;
