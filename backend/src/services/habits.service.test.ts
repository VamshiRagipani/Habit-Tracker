import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildHabitKey, normalizeHabitPayload } from './habits.service';

describe('habit normalization', () => {
  it('creates a stable habit key from the name', () => {
    assert.equal(buildHabitKey('Drink Water'), 'drink-water');
  });

  it('normalizes user input without leaking empty values', () => {
    const next = normalizeHabitPayload({
      label: '  Morning Run  ',
      detail: '  A short run before breakfast.  ',
      icon: '   ',
      phase: 2,
      sort_order: 4,
    });

    assert.deepEqual(next.habit_key, 'morning-run');
    assert.equal(next.label, 'Morning Run');
    assert.equal(next.detail, 'A short run before breakfast.');
    assert.equal(next.icon, '✅');
    assert.equal(next.phase, 2);
    assert.equal(next.sort_order, 4);
  });
});
