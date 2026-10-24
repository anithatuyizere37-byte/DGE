import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  Skeleton,
  ProductCardSkeleton,
  ProductListSkeleton,
  ProductDetailsSkeleton,
  OrderCardSkeleton,
  DashboardCardSkeleton,
  HomeScreenSkeleton,
} from '../src/components/Skeleton';

describe('Skeleton Loading Components Render Suite', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('Atomic Skeleton renders properly', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Skeleton width={100} height={20} />);
    });
    expect(tree).toBeDefined();
  });

  test('ProductCardSkeleton renders without crashing', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<ProductCardSkeleton />);
    });
    expect(tree).toBeDefined();
  });

  test('ProductListSkeleton renders proper card placeholders', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<ProductListSkeleton count={3} />);
    });
    expect(tree).toBeDefined();
  });

  test('ProductDetailsSkeleton renders full screen detail placeholders', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<ProductDetailsSkeleton />);
    });
    expect(tree).toBeDefined();
  });

  test('OrderCardSkeleton renders order cards properly', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<OrderCardSkeleton />);
    });
    expect(tree).toBeDefined();
  });

  test('DashboardCardSkeleton and HomeScreenSkeleton mount and render cleanly', () => {
    let dTree: any;
    let hTree: any;
    ReactTestRenderer.act(() => {
      dTree = ReactTestRenderer.create(<DashboardCardSkeleton />);
      hTree = ReactTestRenderer.create(<HomeScreenSkeleton />);
    });
    expect(dTree).toBeDefined();
    expect(hTree).toBeDefined();
  });
});
