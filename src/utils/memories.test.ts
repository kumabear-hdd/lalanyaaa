import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLDERS,
  INITIAL_MEMORIES,
  countFolderMemories,
  filterAndSortMemories,
  getRandomMemory,
  escapeSvgText,
  generateSvgMemoryImage
} from './memories.js';

test('folders structure has 7 distinct romantic categories', () => {
  assert.equal(FOLDERS.length, 7);
  assert.equal(FOLDERS[0].id, 'our-first-memories');
});

test('initial memories contains 12 default memories', () => {
  assert.equal(INITIAL_MEMORIES.length, 12);
  const first = INITIAL_MEMORIES[0];
  assert.equal(first.id, 'mem-1');
  assert.equal(first.title, 'Hari Pertama Kita Bertemu');
});

test('countFolderMemories counts items correctly', () => {
  const counts = countFolderMemories(INITIAL_MEMORIES);
  assert.equal(counts['our-first-memories'], 2);
  assert.equal(counts['silly-moments'], 2);
  assert.equal(counts['favorite-photos'], 2);
  assert.equal(counts['little-adventures'], 2);
  assert.equal(counts['screenshots-chats'], 2);
  assert.equal(counts['moments-to-keep'], 1);
  assert.equal(counts['for-lalaa-only'], 1);
});

test('filterAndSortMemories filters by folder and search term', () => {
  const filtered = filterAndSortMemories(INITIAL_MEMORIES, {
    folderId: 'silly-moments'
  });
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].folderId, 'silly-moments');

  const searched = filterAndSortMemories(INITIAL_MEMORIES, {
    searchQuery: 'Es Krim'
  });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].title, 'Es Krim & Cerita Panjang');
});

test('filterAndSortMemories filters favorites only', () => {
  const favs = filterAndSortMemories(INITIAL_MEMORIES, {
    favoritesOnly: true
  });
  assert.ok(favs.length > 0);
  assert.ok(favs.every(f => f.isFavorite));
});

test('escapeSvgText and generateSvgMemoryImage produces safe data url', () => {
  const escaped = escapeSvgText('Aa & Lalaa <3 "Forever"');
  assert.equal(escaped, 'Aa &amp; Lalaa &lt;3 &quot;Forever&quot;');

  const svgDataUrl = generateSvgMemoryImage('Test Title', ['#F7C9D4', '#EBA7BA'], '💖', 'Sub');
  assert.ok(svgDataUrl.startsWith('data:image/svg+xml;utf8,'));
});

test('getRandomMemory selects a valid memory from pool', () => {
  const random = getRandomMemory(INITIAL_MEMORIES, 'mem-1');
  assert.ok(random);
  assert.notEqual(random.id, 'mem-1');
});
