import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_DOWNLOADS, downloadsFrom } from './downloads';

test('falls back to the bundled list while no rows are saved', () => {
  assert.equal(downloadsFrom(undefined).length, DEFAULT_DOWNLOADS.length);
  assert.equal(downloadsFrom([]).length, DEFAULT_DOWNLOADS.length);
});

test('saved rows are the whole list: a deleted default stays gone', () => {
  const out = downloadsFrom([{ id: 'a', title: 'New form', file: '/research/downloads/new.pdf' }]);
  assert.deepEqual(out, [{ id: 'a', title: 'New form', href: '/research/downloads/new.pdf' }]);
});

test('a row with no file has no link, and a row with no title is skipped', () => {
  const out = downloadsFrom([{ id: 'a', title: 'Needs file', file: '' }, { id: 'b', title: '  ', file: '/x.pdf' }]);
  assert.deepEqual(out, [{ id: 'a', title: 'Needs file', href: undefined }]);
});

test('a link pasted from the bucket becomes a same-site path', () => {
  const [d] = downloadsFrom([
    { id: 'a', title: 'T', file: 'https://mlrit-website-assets.s3.ap-south-1.amazonaws.com/site/media/k1/My%20Form.pdf' },
  ]);
  assert.equal(d.href, '/media/k1/My%20Form.pdf');
});
