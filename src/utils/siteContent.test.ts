import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SITE_CONTENT,
  mergeSiteContent,
  encodeContentToUrlParam,
  decodeContentFromUrlParam
} from './siteContent.js';

test('mergeSiteContent returns default content when empty', () => {
  const content = mergeSiteContent(null);
  assert.equal(content.coupleName, 'Aa & Lalaa');
  assert.equal(content.recipientName, 'Lalaa');
  assert.ok(content.loveLetter.paragraphs.length > 0);
});

test('mergeSiteContent preserves custom values and falls back safely', () => {
  const merged = mergeSiteContent({
    coupleName: 'Daffa & Aisyah',
    stickyNoteText: 'Pesan khusus untukmu!'
  });
  assert.equal(merged.coupleName, 'Daffa & Aisyah');
  assert.equal(merged.stickyNoteText, 'Pesan khusus untukmu!');
  assert.equal(merged.senderName, 'Aa'); // fallback to default
});

test('encode and decode URL parameter preserves full content', () => {
  const custom = mergeSiteContent({
    coupleName: 'Romeo & Juliet',
    stickyNoteText: 'Sebuah cerita cinta abadi',
    loveLetter: {
      salutation: 'Teruntuk Juliet,',
      paragraphs: ['Paragraf satu', 'Paragraf dua'],
      signOff: 'Dari Romeo',
      footerQuote: 'Cinta tanpa batas',
      dateStr: 'Musim Semi 2026'
    }
  });

  const encoded = encodeContentToUrlParam(custom);
  assert.ok(encoded.length > 0);

  const decoded = decodeContentFromUrlParam(encoded);
  assert.ok(decoded);
  assert.equal(decoded.coupleName, 'Romeo & Juliet');
  assert.equal(decoded.loveLetter.salutation, 'Teruntuk Juliet,');
  assert.equal(decoded.loveLetter.paragraphs[0], 'Paragraf satu');
});
