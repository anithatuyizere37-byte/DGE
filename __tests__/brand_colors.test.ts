import COLORS from '../src/constants/colors';

describe('Strict Brand Color Compliance', () => {
  const ALLOWED_COLORS = new Set(['#FFFFFF', '#1565C0', '#FFD600']);

  test('COLORS defines only White (#FFFFFF), Blue (#1565C0), and Yellow (#FFD600)', () => {
    expect(COLORS.white).toBe('#FFFFFF');
    expect(COLORS.blue).toBe('#1565C0');
    expect(COLORS.yellow).toBe('#FFD600');
  });

  test('All semantic color tokens resolve exclusively to the 3 permitted brand colors', () => {
    Object.entries(COLORS).forEach(([, colorValue]) => {
      expect(ALLOWED_COLORS.has(colorValue)).toBe(true);
    });
  });
});
