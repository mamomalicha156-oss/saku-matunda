/**
 * state.js
 * -----------------------------------------------------------------------
 * The single object that drives what's on screen, plus the small set of
 * functions that read or mutate it: cart operations, lookups, toast
 * notifications and page navigation. Every render-*.js file reads from
 * `state` and calls `render()` (defined in app.js) after changing it.
 * -----------------------------------------------------------------------
 */

const state = {
  // Which screen is showing. One of:
  // home | shop | product | checkout | confirmation | login | signup |
  // admin-dashboard | admin-products | admin-orders
  view: 'home',

  // Shop page filters
  activeCategory: 'all',
  searchTerm: '',
  sort: 'featured',

  // Which product the product-detail page is showing
  productId: null,

  // { productId, qty }[]
  cart: [],

  // Logged-in user object from `users`, or null when signed out
  currentUser: null,

  // Whether the slide-out cart drawer is open
  cartOpen: false,

  // The order that was just placed, shown on the confirmation screen
  lastOrder: null,

  // Admin "add / edit product" modal: null (closed), 'new', or a product id
  adminEditingProduct: null,
  adminProductModal: false,

  // Admin "add / edit staff" modal: same pattern as the product modal above
  adminEditingStaff: null,
  adminStaffModal: false,

  // Toast notification text, or null when nothing is showing
  toastMsg: null,
};

/* ---------------------------- Lookups ---------------------------- */

function findProduct(id) {
  return products.find((p) => p.id === id);
}

function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || { name: id, icon: '🛒' };
}

/** Returns a short {text, cls, pill} description of a product's stock level. */
function stockLabel(stock) {
  if (stock <= 0) return { text: 'Out of stock', cls: 'stock-out', pill: 'out' };
  if (stock <= 10) return { text: stock + ' left in stock', cls: 'stock-low', pill: 'low' };
  return { text: 'In stock', cls: 'stock-ok', pill: 'ok' };
}

/* ----------------------------- Cart ------------------------------ */

function cartCount() {
  return state.cart.reduce((sum, line) => sum + line.qty, 0);
}

function cartTotal() {
  return state.cart.reduce((sum, line) => {
    const product = findProduct(line.productId);
    return product ? sum + product.price * line.qty : sum;
  }, 0);
}

function addToCart(productId, qty = 1) {
  const product = findProduct(productId);
  if (!product || product.stock <= 0) return;

  const existingLine = state.cart.find((l) => l.productId === productId);
  const alreadyInCart = existingLine ? existingLine.qty : 0;

  // Never let the cart hold more than what's in stock
  if (alreadyInCart + qty > product.stock) qty = product.stock - alreadyInCart;
  if (qty <= 0) return;

  if (existingLine) existingLine.qty += qty;
  else state.cart.push({ productId, qty });

  showToast(product.name + ' added to cart');
  render();
}

function setQty(productId, qty) {
  const product = findProduct(productId);
  const line = state.cart.find((l) => l.productId === productId);
  if (!line) return;

  if (qty <= 0) {
    state.cart = state.cart.filter((l) => l.productId !== productId);
  } else {
    line.qty = Math.min(qty, product.stock);
  }
  render();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((l) => l.productId !== productId);
  render();
}

/* ----------------------------- Toast ------------------------------ */

let toastTimer = null;

function showToast(message) {
  state.toastMsg = message;
  render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    state.toastMsg = null;
    render();
  }, 2400);
}

/* --------------------------- Navigation ---------------------------- */

/**
 * Switches to a new view, optionally patching extra state at the same
 * time (e.g. go('shop', { activeCategory: 'fruits' })), then re-renders.
 */
function go(view, extra) {
  state.view = view;
  state.cartOpen = false;
  if (extra) Object.assign(state, extra);

  // Render first — scrolling is a nice-to-have and must never be able to
  // block navigation. Some sandboxed preview environments (e.g. an iframe
  // without full scroll permissions) can throw here, which would
  // otherwise leave the page stuck on the old view.
  render();
  try {
    window.scrollTo({ top: 0, behavior: 'auto' });
  } catch (err) {
    window.scrollTo(0, 0);
  }
}
