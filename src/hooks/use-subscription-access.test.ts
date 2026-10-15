import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSubscriptionAccess } from './use-subscription-access';

const now = Date.parse('2026-10-15T12:00:00Z');
const state = (end: number) => ({ isActive: true, status: 'active', currentPeriodEnd: new Date(end).toISOString() });

describe('Pro access in an open tab', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('revokes access at the exact deadline without a network response', () => {
    const { result } = renderHook(() => useSubscriptionAccess(state(now + 1000)));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });

  it('keeps access after a successful renewal and expires at the new deadline', () => {
    const { result, rerender } = renderHook(({ end }) => useSubscriptionAccess(state(end)), {
      initialProps: { end: now + 1000 },
    });
    rerender({ end: now + 2000 });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });

  it('handles annual subscriptions without overflowing browser timers', () => {
    const end = now + 365 * 86400_000;
    const { result } = renderHook(() => useSubscriptionAccess(state(end)));
    for (let i = 0; i < 15; i++) act(() => vi.advanceTimersByTime(2_147_483_647));
    expect(result.current).toBe(false);
  });

  it('honors the server denying access despite a future deadline', () => {
    const { result } = renderHook(() => useSubscriptionAccess({ ...state(now + 1000), isActive: false }));
    expect(result.current).toBe(false);
  });
});
