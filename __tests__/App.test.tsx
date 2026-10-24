import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

describe('App Root Render', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('App component mounts and renders without crashing', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    expect(renderer).toBeDefined();

    // Advance timers so splash screen timer executes cleanly inside act
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });
});
