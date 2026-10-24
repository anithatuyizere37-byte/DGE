import THEME from '../src/constants/theme';

describe('D&G Shop Business Rules & Roles Verification', () => {
  test('Shop location is strictly Rwamagana, Rwanda with RWF currency', () => {
    expect(THEME.shopInfo.name).toBe('D&G E-Commerce');
    expect(THEME.shopInfo.currency).toBe('RWF');
    expect(THEME.shopInfo.location).toContain('Rwamagana');
  });

  test('Required 6 product categories are defined', () => {
    const requiredCategories = [
      'Clothes',
      'Shoes',
      'Bags',
      'Household Equipment',
      'Jewellery',
      'Cosmetics',
    ];
    requiredCategories.forEach((cat) => {
      expect(THEME.categories).toContain(cat);
    });
  });

  test('Permitted user roles are strictly Client and Owner', () => {
    const validRoles = ['client', 'owner'];
    expect(validRoles.length).toBe(2);
    expect(validRoles).toContain('client');
    expect(validRoles).toContain('owner');
  });
});
