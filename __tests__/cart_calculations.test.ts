describe('Shopping Cart Calculations (RWF)', () => {
  const STANDARD_DELIVERY_FEE = 1500;
  const FREE_DELIVERY_THRESHOLD = 30000;

  function calculateCart(items: { price: number; quantity: number }[]) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee =
      items.length === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  }

  test('Empty cart results in 0 RWF subtotal, 0 RWF delivery, 0 RWF total', () => {
    const res = calculateCart([]);
    expect(res.subtotal).toBe(0);
    expect(res.deliveryFee).toBe(0);
    expect(res.total).toBe(0);
  });

  test('Order below 30,000 RWF incurs 1,500 RWF Rwamagana delivery fee', () => {
    // 1 item of 18,000 RWF (Shirt)
    const res = calculateCart([{ price: 18000, quantity: 1 }]);
    expect(res.subtotal).toBe(18000);
    expect(res.deliveryFee).toBe(1500);
    expect(res.total).toBe(19500);
  });

  test('Order at or above 30,000 RWF qualifies for free delivery', () => {
    // 2 shirts of 18,000 RWF = 36,000 RWF
    const res = calculateCart([{ price: 18000, quantity: 2 }]);
    expect(res.subtotal).toBe(36000);
    expect(res.deliveryFee).toBe(0);
    expect(res.total).toBe(36000);
  });
});
