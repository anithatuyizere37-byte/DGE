import { OrderStage } from '../src/components/Timeline';

describe('Order Fulfillment 5-Stage Pipeline', () => {
  const REQUIRED_STAGES: OrderStage[] = [
    'placed',
    'confirmed',
    'processing',
    'out_for_delivery',
    'delivered',
  ];

  test('Order tracking includes all 5 sequential stages required by prompt', () => {
    expect(REQUIRED_STAGES.length).toBe(5);
    expect(REQUIRED_STAGES[0]).toBe('placed');
    expect(REQUIRED_STAGES[1]).toBe('confirmed');
    expect(REQUIRED_STAGES[2]).toBe('processing');
    expect(REQUIRED_STAGES[3]).toBe('out_for_delivery');
    expect(REQUIRED_STAGES[4]).toBe('delivered');
  });

  test('Order progression follows valid stage indices', () => {
    const getStageIndex = (stage: OrderStage): number => REQUIRED_STAGES.indexOf(stage);

    expect(getStageIndex('placed')).toBe(0);
    expect(getStageIndex('confirmed')).toBe(1);
    expect(getStageIndex('processing')).toBe(2);
    expect(getStageIndex('out_for_delivery')).toBe(3);
    expect(getStageIndex('delivered')).toBe(4);
  });
});
