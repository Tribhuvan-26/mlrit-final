import assert from 'node:assert/strict';
import test from 'node:test';

import { circularsFrom } from './circulars';
import { DEFAULT_CIRCULARS } from './circulars-data';
import { publicMediaUrl } from './media-url';

const row = (id: string, extra: Record<string, unknown> = {}) => ({
  id, title: `Circular ${id}`, category: 'Fee', date: 'October 29, 2026', file: `/examinations/circulars/${id}.pdf`, ...extra,
});

test('falls back to the bundled list while no rows are saved', () => {
  assert.equal(circularsFrom(undefined).length, DEFAULT_CIRCULARS.length);
  assert.equal(circularsFrom([]).length, DEFAULT_CIRCULARS.length);
});

test('saved rows are added to the bundled list, never replacing it', () => {
  const out = circularsFrom([row('a')]);
  assert.equal(out.length, DEFAULT_CIRCULARS.length + 1);
  const a = out.find((c) => c.id === 'a')!;
  assert.deepEqual([a.title, a.category, a.href, a.filename], ['Circular a', 'Fee', '/examinations/circulars/a.pdf', 'a.pdf']);
});

test('a saved row for a bundled file replaces that bundled copy', () => {
  const d = DEFAULT_CIRCULARS[0];
  const out = circularsFrom([{ id: 'edited', title: 'Edited title', category: 'Notice', date: d.date, file: d.file }]);
  assert.equal(out.length, DEFAULT_CIRCULARS.length);
  assert.equal(out.filter((c) => c.href === d.file).length, 1);
  assert.equal(out.find((c) => c.href === d.file)!.title, 'Edited title');
});

test('sorts newest first, keeps same-day order, and reads month-only dates', () => {
  const out = circularsFrom([
    row('old', { date: 'July 2026' }),
    row('new1', { date: 'October 29, 2026' }),
    row('new2', { date: 'October 29, 2026' }),
    row('mid', { date: 'September 1, 2026' }),
  ]);
  assert.deepEqual(out.map((c) => c.id).filter((id) => ['old', 'new1', 'new2', 'mid'].includes(id)), ['new1', 'new2', 'mid', 'old']);
});

test('skips rows with no title or no file, and defaults an unknown category to Notice', () => {
  const out = circularsFrom([row('a', { title: '  ' }), row('b', { file: '' }), row('c', { category: 'whatever' }), row('d', { category: 'timetable' })]);
  assert.deepEqual(out.filter((c) => ['a', 'b', 'c', 'd'].includes(c.id)).map((c) => [c.id, c.category]), [['c', 'Notice'], ['d', 'Timetable']]);
});

test('a link pasted from the bucket becomes a same-site path', () => {
  const [c] = circularsFrom([row('a', { file: 'https://mlrit-website-assets.s3.ap-south-1.amazonaws.com/site/media/k1/My%20Circular.pdf' })]);
  assert.equal(c.href, '/media/k1/My%20Circular.pdf');
  assert.equal(c.filename, 'My Circular.pdf');
});

test('public media URL encodes the name and keeps the plugin folder', () => {
  assert.equal(publicMediaUrl({ filename: 'a b.pdf', prefix: 'k1' }), '/media/k1/a%20b.pdf');
  assert.equal(publicMediaUrl({ filename: 'x.pdf' }), '/media/x.pdf');
});
