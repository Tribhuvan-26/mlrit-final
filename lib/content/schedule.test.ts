import assert from 'node:assert/strict';
import test from 'node:test';

import { isScheduledNow, scheduleDateMessage } from './schedule';

const at = (iso: string) => Date.parse(iso);

test('an item with no dates is live, and an inactive one is not', () => {
  assert.equal(isScheduledNow({}), true);
  assert.equal(isScheduledNow({ active: true }), true);
  assert.equal(isScheduledNow({ active: null }), true);
  assert.equal(isScheduledNow({ active: false }), false);
});

test('a start date holds the item back until that day begins (IST)', () => {
  const item = { startDate: '2026-12-01' };
  assert.equal(isScheduledNow(item, at('2026-11-30T18:29:59Z')), false); // 23:59:59 IST on the 30th
  assert.equal(isScheduledNow(item, at('2026-11-30T18:30:00Z')), true); // midnight IST
});

test('an end date keeps the item up through that day and drops it after', () => {
  const item = { endDate: '2026-12-31' };
  assert.equal(isScheduledNow(item, at('2026-12-31T18:29:59Z')), true); // 23:59:59 IST
  assert.equal(isScheduledNow(item, at('2026-12-31T18:30:00Z')), false); // midnight IST
});

test('a window shows only inside it, and inactive overrides the window', () => {
  const item = { startDate: '2026-12-01', endDate: '2026-12-10' };
  assert.equal(isScheduledNow(item, at('2026-12-05T06:00:00Z')), true);
  assert.equal(isScheduledNow(item, at('2026-12-11T06:00:00Z')), false);
  assert.equal(isScheduledNow({ ...item, active: false }, at('2026-12-05T06:00:00Z')), false);
});

test('an unreadable date never hides an item', () => {
  assert.equal(isScheduledNow({ startDate: 'soon', endDate: 'later' }), true);
});

test('date validation accepts empty and YYYY-MM-DD only', () => {
  assert.equal(scheduleDateMessage(''), true);
  assert.equal(scheduleDateMessage(undefined), true);
  assert.equal(scheduleDateMessage('2026-12-31'), true);
  assert.notEqual(scheduleDateMessage('31-12-2026'), true);
  assert.notEqual(scheduleDateMessage('2026-13-45'), true);
});
