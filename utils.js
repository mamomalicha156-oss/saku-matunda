/**
 * utils.js
 * -----------------------------------------------------------------------
 * Small, dependency-free helpers used across the render files: currency
 * formatting, HTML-escaping for anything that gets interpolated into a
 * template string, and the handful of SVG icons used in the header.
 * -----------------------------------------------------------------------
 */

/** Formats a number as USD, e.g. fmt(3.5) -> "$3.50" */
function fmt(amount) {
  return '$' + amount.toFixed(2);
}

/** Escapes a value for safe use inside an HTML attribute, e.g. value="...". */
function escapeAttr(value) {
  return (value || '').replace(/"/g, '&quot;');
}

/** Escapes a value for safe use as HTML text content. */
function escapeHtml(value) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Builds a real product photo URL from LoremFlickr (free, Creative
 * Commons-licensed photos sourced from Flickr, credited to their
 * photographers). `?lock=` pins a specific photo to a given id so the
 * same item always shows the same picture instead of a new random one
 * on every reload.
 */
function imageUrlFor(id, imageQuery, size) {
  size = size || 500;
  const tags = imageQuery || 'grocery,food';
  // Encode each tag individually but keep the comma between tags literal —
  // LoremFlickr expects "tag1,tag2" in the URL path, not "tag1%2Ctag2".
  const encodedTags = tags.split(',').map(encodeURIComponent).join(',');
  return `https://loremflickr.com/${size}/${size}/${encodedTags}?lock=${id}`;
}

/** Convenience wrapper for a full product object (uses its own id + imageQuery). */
function productImageUrl(product, size) {
  return imageUrlFor(product.id, product.imageQuery || product.category + ',food', size);
}

/**
 * Fallback for a product <img> that fails to load: swaps it for the
 * product's emoji icon instead of leaving a broken image icon.
 */
function onProductImgError(imgEl, emoji, fontSize) {
  imgEl.onerror = null;
  const span = document.createElement('span');
  span.textContent = emoji;
  span.style.fontSize = fontSize || '32px';
  span.style.display = 'flex';
  span.style.alignItems = 'center';
  span.style.justifyContent = 'center';
  span.style.width = '100%';
  span.style.height = '100%';
  imgEl.replaceWith(span);
}

// Inline SVGs kept small and stroke-based so they inherit `currentColor`
// and match whatever text color surrounds them.
const ICONS = {
  search: `
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="7"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>`,
  cart: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7.5H6"/>
    </svg>`,
  user: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/>
    </svg>`,
};
