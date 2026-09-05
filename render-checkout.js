/**
 * render-checkout.js
 * -----------------------------------------------------------------------
 * The checkout form (delivery details + payment method) and the order
 * confirmation screen shown right after. placeOrder() is where a cart
 * actually turns into an order: it snapshots the cart, decrements
 * product stock, and files the order into `orders`.
 * -----------------------------------------------------------------------
 */

function viewCheckout() {
  if (state.cart.length === 0) {
    return `
    <div class="wrap">
      <div class="empty" style="margin-top:60px;">
        <span class="emoji">🧺</span>
        <h3>Your cart is empty</h3>
        <p>Add a few items before checking out.</p>
        <button class="btn btn-primary" style="margin-top:14px;" onclick="go('shop',{activeCategory:'all'})">Go to shop</button>
      </div>
    </div>`;
  }

  const deliveryFee = cartTotal() > 35 ? 0 : 4.99;

  const orderLines = state.cart
    .map((line) => {
      const product = findProduct(line.productId);
      return `<div class="mini-line"><div class="emoji-box"><img src="${productImageUrl(product,80)}" alt="${escapeAttr(product.name)}" onerror="onProductImgError(this,'${product.icon}','16px')"></div><div class="name">${product.name} × ${line.qty}</div><div>${fmt(product.price * line.qty)}</div></div>`;
    })
    .join('');

  return `
  <div class="wrap checkout-grid">
    <div>
      <h2 style="color:var(--forest);">Checkout</h2>
      <form id="checkout-form" onsubmit="return placeOrder(event)">
        <div class="checkout-card">
          <h3>Delivery details</h3>
          <div class="field"><label>Full name</label><input type="text" id="ck-name" required value="${state.currentUser ? escapeAttr(state.currentUser.name) : ''}"></div>
          <div class="field-row">
            <div class="field"><label>Phone</label><input type="tel" id="ck-phone" required placeholder="07XX XXX XXX"></div>
            <div class="field"><label>Town / area</label><input type="text" id="ck-town" required placeholder="e.g. Meru"></div>
          </div>
          <div class="field"><label>Delivery address</label><textarea id="ck-address" rows="2" required placeholder="Street, building, house number"></textarea></div>
        </div>
        <div class="checkout-card">
          <h3>Payment method</h3>
          <div class="field">
            <label><input type="radio" name="pay" value="card" checked style="width:auto;margin-right:8px;">Card on delivery</label>
          </div>
          <div class="field">
            <label><input type="radio" name="pay" value="mpesa" style="width:auto;margin-right:8px;">Mobile money</label>
          </div>
          <div class="field" style="margin-bottom:0;">
            <label><input type="radio" name="pay" value="cash" style="width:auto;margin-right:8px;">Cash on delivery</label>
          </div>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Place order — ${fmt(cartTotal() + deliveryFee)}</button>
      </form>
    </div>
    <div class="order-summary">
      <h3 style="margin:0 0 14px;color:var(--forest);">Order summary</h3>
      ${orderLines}
      <div class="sum-row" style="margin-top:14px;"><span>Subtotal</span><span>${fmt(cartTotal())}</span></div>
      <div class="sum-row"><span>Delivery</span><span>${deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}</span></div>
      <div class="sum-row total"><span>Total</span><span>${fmt(cartTotal() + deliveryFee)}</span></div>
    </div>
  </div>`;
}

/**
 * Turns the current cart into a filed order: reads the form, snapshots
 * each cart line (so later catalog edits don't rewrite order history),
 * deducts the purchased quantities from stock, and clears the cart.
 */
function placeOrder(event) {
  event.preventDefault();

  const name = document.getElementById('ck-name').value.trim();
  const phone = document.getElementById('ck-phone').value.trim();
  const town = document.getElementById('ck-town').value.trim();
  const address = document.getElementById('ck-address').value.trim();
  const paymentMethod = document.querySelector('input[name="pay"]:checked').value;
  const deliveryFee = cartTotal() > 35 ? 0 : 4.99;

  const items = state.cart.map((line) => {
    const product = findProduct(line.productId);
    return {
      productId: product.id,
      name: product.name,
      icon: product.icon,
      imageQuery: product.imageQuery || product.category + ',food',
      qty: line.qty,
      price: product.price,
    };
  });

  items.forEach((item) => {
    const product = findProduct(item.productId);
    if (product) product.stock = Math.max(0, product.stock - item.qty);
  });

  const order = {
    id: nextOrderId++,
    date: new Date(),
    customer: name,
    phone,
    town,
    address,
    pay: paymentMethod,
    items,
    subtotal: cartTotal(),
    delivery: deliveryFee,
    total: cartTotal() + deliveryFee,
    status: 'Pending',
  };

  orders.unshift(order);
  state.lastOrder = order;
  state.cart = [];

  go('confirmation');
  return false;
}

function viewConfirmation() {
  const order = state.lastOrder;
  if (!order) {
    return `<div class="wrap"><div class="empty"><span class="emoji">📦</span><h3>No recent order</h3></div></div>`;
  }

  const itemLines = order.items
    .map((item) => `<div class="mini-line"><div class="emoji-box"><img src="${imageUrlFor(item.productId, item.imageQuery, 80)}" alt="${escapeAttr(item.name)}" onerror="onProductImgError(this,'${item.icon}','16px')"></div><div class="name">${item.name} × ${item.qty}</div><div>${fmt(item.price * item.qty)}</div></div>`)
    .join('');

  return `
  <div class="confirm-wrap">
    <span class="emoji">✅</span>
    <h2>Order placed!</h2>
    <p style="color:var(--ink-soft);">Thanks${order.customer ? ', ' + order.customer.split(' ')[0] : ''} — we're packing your groceries now.</p>
    <div class="order-id">Order #${order.id}</div>
    <div class="checkout-card" style="text-align:left;">
      <h3>What's coming</h3>
      ${itemLines}
      <div class="sum-row total"><span>Total paid</span><span>${fmt(order.total)}</span></div>
    </div>
    <button class="btn btn-primary" onclick="go('shop',{activeCategory:'all'})">Continue shopping</button>
  </div>`;
}
