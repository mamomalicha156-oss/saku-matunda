/**
 * render-shop.js
 * -----------------------------------------------------------------------
 * The three core shopping views: the home/landing page, the filterable
 * shop grid, and a single product's detail page.
 * -----------------------------------------------------------------------
 */

function viewHome() {
  const featured = products.filter((p) => p.stock > 0).slice(0, 8);

  return `
  <section class="hero"><div class="wrap hero-grid">
    <div>
      <h1>Fresh food, from Saku's own aisles to your kitchen counter.</h1>
      <p class="lede">Order fruit, vegetables, dairy and pantry staples online and skip the trip to the store. Saku Grocery packs and delivers the same day, every day.</p>
      <div class="hero-actions">
        <button class="btn btn-primary" onclick="go('shop',{activeCategory:'all'})">Start shopping</button>
        <button class="btn btn-outline" onclick="go('shop',{activeCategory:'fruits'})">See what's fresh</button>
      </div>
      <div class="stat-strip">
        <div><b>${products.length}+</b><span>products stocked</span></div>
        <div><b>${CATEGORIES.length}</b><span>aisles to browse</span></div>
        <div><b>Same day</b><span>delivery cut-off 2pm</span></div>
      </div>
    </div>
    <div class="hero-art">
      <div class="tile tall"><span class="emoji">🥬</span><span>Vegetables picked this week</span></div>
      <div class="tile"><span class="emoji">🍓</span><span>Seasonal fruit</span></div>
      <div class="tile"><span class="emoji">🧀</span><span>Local dairy</span></div>
    </div>
  </div></section>

  ${categoryRail()}

  <div class="wrap">
    <div class="section-head">
      <div><h2>Popular this week</h2><p>A few things customers keep coming back for.</p></div>
      <a href="#" class="btn-ghost" onclick="go('shop',{activeCategory:'all'});return false;">Browse everything →</a>
    </div>
    <div class="grid">${featured.map(productCard).join('')}</div>
  </div>

  <div class="wrap" style="padding:70px 0 20px;">
    <div class="section-head" style="margin-top:0;">
      <div><h2>How ordering works</h2><p>From your cart to your counter in three steps.</p></div>
    </div>
    <div class="grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="panel"><h3>1. Browse and add to cart</h3><p style="color:var(--ink-soft);margin:0;">Search or filter by aisle, check prices and stock, and add what you need.</p></div>
      <div class="panel"><h3>2. Check out securely</h3><p style="color:var(--ink-soft);margin:0;">Enter your delivery address and choose a payment method at checkout.</p></div>
      <div class="panel"><h3>3. Track your order</h3><p style="color:var(--ink-soft);margin:0;">We'll get your groceries packed and out for same-day delivery.</p></div>
    </div>
  </div>`;
}

function viewShop() {
  const list = filteredProducts();

  const resultsHeading = state.activeCategory === 'all' ? 'All groceries' : catInfo(state.activeCategory).name;
  const resultsSubtitle = state.searchTerm ? `Results for “${escapeHtml(state.searchTerm)}”` : 'Fresh stock, updated daily.';

  const emptyState = `
    <div class="empty">
      <span class="emoji">🔍</span>
      <h3>No products found</h3>
      <p>Try a different search term or browse another aisle.</p>
    </div>`;

  return `
  ${categoryRail()}
  <div class="wrap" style="padding-top:26px;">
    <div class="section-head" style="margin-top:0;">
      <div><h2>${resultsHeading}</h2><p>${resultsSubtitle}</p></div>
    </div>
    <div class="filter-bar">
      <select onchange="state.sort=this.value; render()">
        <option value="featured" ${state.sort === 'featured' ? 'selected' : ''}>Sort: Featured</option>
        <option value="price-asc" ${state.sort === 'price-asc' ? 'selected' : ''}>Price: Low to high</option>
        <option value="price-desc" ${state.sort === 'price-desc' ? 'selected' : ''}>Price: High to low</option>
        <option value="name" ${state.sort === 'name' ? 'selected' : ''}>Name: A–Z</option>
      </select>
      <span class="result-count">${list.length} item${list.length !== 1 ? 's' : ''}</span>
    </div>
    ${list.length === 0 ? emptyState : `<div class="grid">${list.map(productCard).join('')}</div>`}
  </div>`;
}

function viewProduct() {
  const product = findProduct(state.productId);

  if (!product) {
    return `
    <div class="wrap">
      <div class="empty">
        <span class="emoji">🤔</span>
        <h3>Product not found</h3>
        <a href="#" class="btn btn-outline" onclick="go('shop',{activeCategory:'all'});return false;" style="margin-top:12px;">Back to shop</a>
      </div>
    </div>`;
  }

  const stock = stockLabel(product.stock);
  const cartLine = state.cart.find((l) => l.productId === product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const addControl = cartLine
    ? `<div class="qty-stepper">
         <button onclick="setQty(${product.id}, ${cartLine.qty - 1})">−</button>
         <span>${cartLine.qty}</span>
         <button onclick="setQty(${product.id}, ${cartLine.qty + 1})" ${cartLine.qty >= product.stock ? 'disabled' : ''}>+</button>
       </div>
       <button class="btn btn-outline" onclick="state.cartOpen=true; render()">View cart</button>`
    : `<button class="btn btn-primary" onclick="addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>Add to cart</button>`;

  const relatedSection = related.length
    ? `
      <div class="section-head"><div><h2>More from ${catInfo(product.category).name}</h2></div></div>
      <div class="grid" style="margin-bottom:60px;">${related.map(productCard).join('')}</div>`
    : '<div style="height:40px;"></div>';

  return `
  <div class="wrap">
    <div class="breadcrumb">
      <a href="#" onclick="go('shop',{activeCategory:'all'});return false;">Shop</a> ›
      <a href="#" onclick="go('shop',{activeCategory:'${product.category}'});return false;"> ${catInfo(product.category).name}</a> ›
      <span> ${product.name}</span>
    </div>
    <div class="detail-grid">
      <div class="detail-media"><img src="${productImageUrl(product,700)}" alt="${escapeAttr(product.name)}" onerror="onProductImgError(this,'${product.icon}','100px')"></div>
      <div>
        <h1 class="detail-name">${product.name}</h1>
        <div class="detail-meta">${catInfo(product.category).name} · ${product.unit}</div>
        <div class="detail-price">${fmt(product.price)}</div>
        <div class="stock-line ${stock.cls}">${stock.text}</div>
        <p class="detail-desc">${product.desc}</p>
        <div class="add-row">${addControl}</div>
      </div>
    </div>
    ${relatedSection}
  </div>`;
}
