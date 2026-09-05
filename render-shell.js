/**
 * render-shell.js
 * -----------------------------------------------------------------------
 * The pieces of UI that show up on (almost) every customer-facing page:
 * the sticky header/search bar, the category rail, a single product
 * card, the slide-out cart drawer, the toast, and the footer. app.js
 * wraps these around whichever view is currently active.
 * -----------------------------------------------------------------------
 */

/** Renders one product tile for the grid, including its add-to-cart control. */
function productCard(product) {
  const stock = stockLabel(product.stock);
  const cartLine = state.cart.find((l) => l.productId === product.id);

  // A light tint behind the emoji, cycling through a small palette so the
  // grid doesn't look monotone.
  const categoryIndex = CATEGORIES.findIndex((c) => c.id === product.category);
  const tileBackgrounds = ['#F1EEDD', '#E6EFE1', '#EEF3FB', '#F6E9DD', '#F3ECD6', '#E5F1EF', '#F1E6DD', '#EDEFE6'];
  const tileBg = tileBackgrounds[categoryIndex % tileBackgrounds.length];

  const stockBadge =
    product.stock <= 0 ? `<span class="tag out">Sold out</span>`
    : product.stock <= 10 ? `<span class="tag low">Low stock</span>`
    : '';

  const addControl = cartLine
    ? `<div class="qty-stepper">
         <button onclick="setQty(${product.id}, ${cartLine.qty - 1})">−</button>
         <span>${cartLine.qty}</span>
         <button onclick="setQty(${product.id}, ${cartLine.qty + 1})" ${cartLine.qty >= product.stock ? 'disabled' : ''}>+</button>
       </div>`
    : `<button class="qty-add" onclick="addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''} title="Add to cart">+</button>`;

  return `
    <div class="card">
      <div class="card-media" style="background:${tileBg}">
        ${stockBadge}
        <img src="${productImageUrl(product)}" alt="${escapeAttr(product.name)}" loading="lazy"
             onerror="onProductImgError(this,'${product.icon}','44px')">
      </div>
      <div class="card-body">
        <div class="card-cat">${catInfo(product.category).name}</div>
        <div class="card-name" onclick="go('product',{productId:${product.id}})">${product.name}</div>
        <div class="card-unit">${product.unit}</div>
        <div class="card-foot">
          <div class="price">${fmt(product.price)}</div>
          ${addControl}
        </div>
      </div>
    </div>`;
}

/** Applies the shop page's category / search / sort filters to the catalog. */
function filteredProducts() {
  let list = products.slice();

  if (state.activeCategory !== 'all') {
    list = list.filter((p) => p.category === state.activeCategory);
  }

  if (state.searchTerm.trim()) {
    const query = state.searchTerm.trim().toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(query) || catInfo(p.category).name.toLowerCase().includes(query)
    );
  }

  if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

/** Sticky top bar + logo + nav links + search box + account/cart icons. */
function header() {
  const onShopPage = state.view === 'shop';
  const onHomePage = state.view === 'home';

  return `
  <div class="topbar"><div class="wrap">
    <span>Same-day delivery on orders before 2pm</span>
    <span>Need help? support@sakugrocery.test</span>
  </div></div>
  <header class="site">
    <div class="wrap nav-row">
      <a class="brand" href="#" onclick="go('home');return false;">
        <span class="mark">Saku</span><span class="sub">Grocery</span>
      </a>
      <nav class="nav-links">
        <a href="#" class="${onHomePage ? 'active' : ''}" onclick="go('home');return false;">Home</a>
        <a href="#" class="${onShopPage ? 'active' : ''}" onclick="go('shop',{activeCategory:'all'});return false;">Shop</a>
      </nav>
      <div class="search-box">
        ${ICONS.search}
        <input type="text" placeholder="Search for groceries..." value="${escapeAttr(state.searchTerm)}"
          oninput="state.searchTerm=this.value; if(state.view!=='shop'){state.view='shop';} renderKeepFocus(this)">
      </div>
      <div class="nav-actions">
        ${
          state.currentUser
            ? `<a href="#" class="account-name" onclick="go(${state.currentUser.isAdmin ? "'admin-dashboard'" : "'shop'"});return false;">Hi, ${state.currentUser.name.split(' ')[0]}</a>
               <button class="icon-btn" title="Log out" onclick="logout()">${ICONS.user}</button>`
            : `<button class="icon-btn" title="Account" onclick="go('login')">${ICONS.user}</button>`
        }
        <button class="icon-btn" title="Cart" onclick="state.cartOpen=true; render()">
          ${ICONS.cart}
          ${cartCount() > 0 ? `<span class="badge">${cartCount()}</span>` : ''}
        </button>
      </div>
    </div>
  </header>`;
}

/**
 * Re-renders the whole app, then restores focus + cursor position on the
 * header search input. Needed because typing triggers a full re-render
 * (the input is destroyed and recreated), which would otherwise steal
 * focus after every keystroke.
 */
function renderKeepFocus(inputEl) {
  const selectionStart = inputEl.selectionStart;
  const selectionEnd = inputEl.selectionEnd;
  render();
  const freshInput = document.querySelector('.search-box input');
  if (freshInput) {
    freshInput.focus();
    freshInput.setSelectionRange(selectionStart, selectionEnd);
  }
}

/** Horizontal row of category filter chips, used on the home and shop pages. */
function categoryRail() {
  return `
  <div class="cat-rail"><div class="wrap cat-row">
    <button class="cat-chip ${state.activeCategory === 'all' ? 'active' : ''}" onclick="go('shop',{activeCategory:'all'})">
      <span class="dot">🛒</span> All groceries
    </button>
    ${CATEGORIES.map(
      (c) => `
      <button class="cat-chip ${state.activeCategory === c.id ? 'active' : ''}" onclick="go('shop',{activeCategory:'${c.id}'})">
        <span class="dot">${c.icon}</span> ${c.name}
      </button>`
    ).join('')}
  </div></div>`;
}

/** The slide-out cart panel, shared by every page (toggled via state.cartOpen). */
function cartDrawer() {
  const lines = state.cart.map((l) => (findProduct(l.productId) ? l : null)).filter(Boolean);
  const deliveryFee = cartTotal() > 35 ? 0 : 4.99;

  const emptyState = `
    <div class="empty">
      <span class="emoji">🧺</span>
      <h3>Your cart is empty</h3>
      <p>Add a few fresh things from the shop.</p>
    </div>`;

  const lineItems = lines
    .map((line) => {
      const product = findProduct(line.productId);
      return `
      <div class="cart-line">
        <div class="emoji-box"><img src="${productImageUrl(product,120)}" alt="${escapeAttr(product.name)}" loading="lazy" onerror="onProductImgError(this,'${product.icon}','24px')"></div>
        <div class="cart-line-info">
          <div class="name">${product.name}</div>
          <div class="unit">${product.unit} · ${fmt(product.price)}</div>
          <div class="cart-line-foot">
            <div class="qty-stepper">
              <button onclick="setQty(${product.id}, ${line.qty - 1})">−</button>
              <span>${line.qty}</span>
              <button onclick="setQty(${product.id}, ${line.qty + 1})" ${line.qty >= product.stock ? 'disabled' : ''}>+</button>
            </div>
            <button class="remove-link" onclick="removeFromCart(${product.id})">Remove</button>
          </div>
        </div>
      </div>`;
    })
    .join('');

  const summary =
    lines.length > 0
      ? `
    <div class="drawer-foot">
      <div class="sum-row"><span>Subtotal</span><span>${fmt(cartTotal())}</span></div>
      <div class="sum-row"><span>Delivery</span><span>${deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}</span></div>
      <div class="sum-row total"><span>Total</span><span>${fmt(cartTotal() + deliveryFee)}</span></div>
      <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="go('checkout')">Checkout</button>
    </div>`
      : '';

  return `
  <div class="overlay ${state.cartOpen ? 'open' : ''}" onclick="state.cartOpen=false; render()"></div>
  <div class="drawer ${state.cartOpen ? 'open' : ''}">
    <div class="drawer-head">
      <h3>Your cart (${cartCount()})</h3>
      <button class="drawer-close" onclick="state.cartOpen=false; render()">×</button>
    </div>
    <div class="drawer-items">${lines.length === 0 ? emptyState : lineItems}</div>
    ${summary}
  </div>`;
}

/** Small pill notification shown after actions like "added to cart". */
function toast() {
  return `<div class="toast ${state.toastMsg ? 'show' : ''}">✓ ${state.toastMsg || ''}</div>`;
}

/** Site footer with a few link columns, shown under every customer page. */
function footer() {
  return `
  <footer class="site"><div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="foot-brand">Saku Grocery</div>
        <p>Fresh produce, pantry staples and everyday essentials, brought from local farms and shops straight to your door.</p>
      </div>
      <div>
        <h4>Shop</h4>
        ${CATEGORIES.slice(0, 4).map((c) => `<a href="#" onclick="go('shop',{activeCategory:'${c.id}'});return false;">${c.name}</a>`).join('')}
      </div>
      <div>
        <h4>Company</h4>
        <a href="#" onclick="return false;">About Saku</a>
        <a href="#" onclick="return false;">Our farms</a>
        <a href="#" onclick="return false;">Careers</a>
      </div>
      <div>
        <h4>Support</h4>
        <a href="#" onclick="return false;">Delivery areas</a>
        <a href="#" onclick="return false;">Track an order</a>
        <a href="#" onclick="go('login');return false;">Store login</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Saku Grocery. mamo.</span>
      <span>Built with HTML, CSS &amp; JavaScript</span>
    </div>
  </div></footer>`;
}
