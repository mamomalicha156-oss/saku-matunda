/**
 * render-admin.js
 * -----------------------------------------------------------------------
 * Everything behind the admin login: a sales dashboard, product CRUD
 * (with a modal for add/edit), and an order list with status updates.
 * Gated by requireAdmin() — app.js bounces non-admins back to /login
 * before any of these views ever render.
 * -----------------------------------------------------------------------
 */

function requireAdmin() {
  return state.currentUser && state.currentUser.isAdmin;
}

/** Left-hand sidebar shown on every admin-* page, with the active link highlighted. */
function adminNav(activeView) {
  const links = [
    ['admin-dashboard', 'Dashboard'],
    ['admin-products', 'Products'],
    ['admin-orders', 'Orders'],
    ['admin-staff', 'Staff'],
  ];

  return `
  <div class="admin-side">
    <div class="adm-title">Saku Admin</div>
    ${links.map(([id, label]) => `<a href="#" class="${activeView === id ? 'active' : ''}" onclick="go('${id}');return false;">${label}</a>`).join('')}
    <div style="height:1px;background:rgba(255,255,255,.12);margin:14px 4px;"></div>
    <a href="#" onclick="go('shop',{activeCategory:'all'});return false;">View storefront</a>
    <a href="#" onclick="logout();return false;">Log out</a>
  </div>`;
}

function viewAdminDashboard() {
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  // Tally units sold per category across every order, for the bar chart.
  const unitsSoldByCategory = {};
  orders.forEach((order) =>
    order.items.forEach((item) => {
      const product = findProduct(item.productId);
      const category = product ? product.category : 'other';
      unitsSoldByCategory[category] = (unitsSoldByCategory[category] || 0) + item.qty;
    })
  );
  const maxUnitsSold = Math.max(1, ...Object.values(unitsSoldByCategory));
  const categoriesWithSales = CATEGORIES.filter((c) => unitsSoldByCategory[c.id]);

  const chart =
    categoriesWithSales.length === 0
      ? `<p style="color:var(--ink-soft);">No orders yet — place a test order from the storefront to see sales appear here.</p>`
      : `<div class="bar-chart">
          ${categoriesWithSales
            .map(
              (c) => `
            <div class="bar-col">
              <div class="bar" style="height:${Math.max(6, (unitsSoldByCategory[c.id] / maxUnitsSold) * 130)}px;"></div>
              <span>${c.icon} ${unitsSoldByCategory[c.id]}</span>
            </div>`
            )
            .join('')}
        </div>`;

  const recentOrdersTable =
    orders.length === 0
      ? `<p style="color:var(--ink-soft);">No orders yet.</p>`
      : `<div class="table-scroll"><table>
          <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
          ${orders
            .slice(0, 5)
            .map(
              (o) => `
            <tr>
              <td>#${o.id}</td><td>${escapeHtml(o.customer)}</td>
              <td>${o.items.reduce((sum, i) => sum + i.qty, 0)} items</td>
              <td>${fmt(o.total)}</td>
              <td><span class="pill ${o.status.toLowerCase()}">${o.status}</span></td>
            </tr>`
            )
            .join('')}
        </table></div>`;

  return `
  <div class="admin-main">
    <div class="admin-head"><h2>Dashboard</h2><span style="color:var(--ink-soft);font-size:13px;">Overview of store performance</span></div>
    <div class="kpi-row">
      <div class="kpi"><div class="label">Total sales</div><div class="value">${fmt(totalSales)}</div><div class="delta">${totalOrders} order${totalOrders !== 1 ? 's' : ''} placed</div></div>
      <div class="kpi"><div class="label">Products listed</div><div class="value">${products.length}</div><div class="delta">${CATEGORIES.length} categories</div></div>
      <div class="kpi"><div class="label">Low stock</div><div class="value">${lowStockCount}</div><div class="delta" style="color:var(--ochre);">10 units or fewer</div></div>
      <div class="kpi"><div class="label">Out of stock</div><div class="value">${outOfStockCount}</div><div class="delta" style="color:var(--tomato);">Needs restock</div></div>
    </div>
    <div class="panel">
      <h3>Units sold by aisle</h3>
      ${chart}
    </div>
    <div class="panel">
      <h3>Recent orders</h3>
      ${recentOrdersTable}
    </div>
  </div>`;
}

function viewAdminProducts() {
  const rows = products
    .map((product) => {
      const stock = stockLabel(product.stock);
      return `
      <tr>
        <td><img class="row-thumb" src="${productImageUrl(product,80)}" alt="${escapeAttr(product.name)}" onerror="this.style.display='none'">${product.name}</td>
        <td>${catInfo(product.category).name}</td>
        <td>${fmt(product.price)}</td>
        <td>${product.stock}</td>
        <td><span class="pill ${stock.pill}">${stock.text}</span></td>
        <td style="white-space:nowrap;">
          <button class="icon-action" title="Edit" onclick="openProductModal(${product.id})">✎</button>
          <button class="icon-action" title="Delete" onclick="deleteProduct(${product.id})">🗑</button>
        </td>
      </tr>`;
    })
    .join('');

  return `
  <div class="admin-main">
    <div class="admin-head">
      <h2>Products</h2>
      <button class="btn btn-primary btn-sm" onclick="openProductModal('new')">+ Add product</button>
    </div>
    <div class="panel">
      <div class="table-scroll"><table>
        <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
        ${rows}
      </table></div>
    </div>
  </div>
  ${state.adminProductModal ? productModal() : ''}`;
}

/* ------------------------ Add / edit product modal ------------------------ */

function openProductModal(idOrNew) {
  state.adminEditingProduct = idOrNew;
  state.adminProductModal = true;
  render();
}

function closeProductModal() {
  state.adminProductModal = false;
  state.adminEditingProduct = null;
  render();
}

function productModal() {
  const editingProduct = state.adminEditingProduct !== 'new' ? findProduct(state.adminEditingProduct) : null;
  const formValues = editingProduct || { name: '', category: CATEGORIES[0].id, icon: '🛒', price: '', unit: '', stock: '', desc: '' };

  return `
  <div class="modal-back" onclick="if(event.target===this) closeProductModal()">
    <div class="modal">
      <h3>${editingProduct ? 'Edit product' : 'Add a new product'}</h3>
      <form onsubmit="return saveProduct(event)">
        <div class="field"><label>Product name</label><input type="text" id="pm-name" required value="${escapeAttr(formValues.name)}"></div>
        <div class="field-row">
          <div class="field"><label>Category</label>
            <select id="pm-cat">${CATEGORIES.map((c) => `<option value="${c.id}" ${formValues.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Emoji icon (fallback)</label><input type="text" id="pm-icon" maxlength="4" value="${escapeAttr(formValues.icon)}" placeholder="🥕"></div>
        </div>
        <div class="field"><label>Photo keyword(s)</label><input type="text" id="pm-image" value="${escapeAttr(formValues.imageQuery || '')}" placeholder="e.g. mango,fruit"></div>
        <p class="form-note" style="margin:-8px 0 14px;">Pulls a real photo matching this keyword. Leave blank to use the category as a keyword instead.</p>
        <div class="field-row">
          <div class="field"><label>Price ($)</label><input type="number" id="pm-price" step="0.01" min="0" required value="${formValues.price}"></div>
          <div class="field"><label>Stock (units)</label><input type="number" id="pm-stock" min="0" required value="${formValues.stock}"></div>
        </div>
        <div class="field"><label>Unit label</label><input type="text" id="pm-unit" required value="${escapeAttr(formValues.unit)}" placeholder="per lb / each / 6-pack"></div>
        <div class="field"><label>Description</label><textarea id="pm-desc" rows="3">${escapeHtml(formValues.desc)}</textarea></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline btn-sm" onclick="closeProductModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">${editingProduct ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </div>
  </div>`;
}

function saveProduct(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('pm-name').value.trim(),
    category: document.getElementById('pm-cat').value,
    icon: document.getElementById('pm-icon').value.trim() || '🛒',
    imageQuery: document.getElementById('pm-image').value.trim(),
    price: parseFloat(document.getElementById('pm-price').value) || 0,
    stock: parseInt(document.getElementById('pm-stock').value) || 0,
    unit: document.getElementById('pm-unit').value.trim(),
    desc: document.getElementById('pm-desc').value.trim(),
  };

  if (state.adminEditingProduct === 'new') {
    products.push(makeProduct(formData));
    showToast('Product added');
  } else {
    const product = findProduct(state.adminEditingProduct);
    Object.assign(product, formData);
    showToast('Product updated');
  }

  closeProductModal();
  return false;
}

function deleteProduct(id) {
  if (!confirm('Remove this product from the store?')) return;
  products = products.filter((p) => p.id !== id);
  state.cart = state.cart.filter((l) => l.productId !== id); // don't leave a dangling cart line
  showToast('Product removed');
  render();
}

/* -------------------------------- Orders -------------------------------- */

function viewAdminOrders() {
  const rows = orders
    .map(
      (order) => `
    <tr>
      <td>#${order.id}<br><span style="color:var(--ink-soft);font-size:11.5px;">${order.date.toLocaleString()}</span></td>
      <td>${escapeHtml(order.customer)}<br><span style="color:var(--ink-soft);font-size:11.5px;">${escapeHtml(order.phone)}</span></td>
      <td>${escapeHtml(order.town)}</td>
      <td>${order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
      <td>${fmt(order.total)}</td>
      <td>
        <select onchange="updateOrderStatus(${order.id}, this.value)" style="border:1px solid var(--line-strong);border-radius:8px;padding:5px 8px;font-size:12.5px;">
          ${['Pending', 'Shipped', 'Delivered'].map((s) => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>`
    )
    .join('');

  return `
  <div class="admin-main">
    <div class="admin-head"><h2>Orders</h2><span style="color:var(--ink-soft);font-size:13px;">${orders.length} total</span></div>
    <div class="panel">
      ${
        orders.length === 0
          ? `<p style="color:var(--ink-soft);">No orders placed yet. Orders will appear here once customers check out.</p>`
          : `<div class="table-scroll"><table>
              <tr><th>Order</th><th>Customer</th><th>Delivery to</th><th>Items</th><th>Total</th><th>Status</th></tr>
              ${rows}
            </table></div>`
      }
    </div>
  </div>`;
}

function updateOrderStatus(id, status) {
  const order = orders.find((o) => o.id === id);
  if (!order) return;
  order.status = status;
  showToast('Order #' + id + ' marked ' + status);
  render();
}

/* --------------------------------- Staff --------------------------------- */

function statusPillClass(status) {
  if (status === 'Active') return 'ok';
  if (status === 'On leave') return 'low';
  return 'out'; // 'Inactive'
}

function viewAdminStaff() {
  const rows = staff
    .map(
      (member) => `
    <tr>
      <td>${member.name}</td>
      <td>${member.role}</td>
      <td>${escapeHtml(member.email)}<br><span style="color:var(--ink-soft);font-size:11.5px;">${escapeHtml(member.phone)}</span></td>
      <td><span class="pill ${statusPillClass(member.status)}">${member.status}</span></td>
      <td style="white-space:nowrap;">
        <button class="icon-action" title="Edit" onclick="openStaffModal(${member.id})">✎</button>
        <button class="icon-action" title="Remove" onclick="deleteStaff(${member.id})">🗑</button>
      </td>
    </tr>`
    )
    .join('');

  const activeCount = staff.filter((m) => m.status === 'Active').length;

  return `
  <div class="admin-main">
    <div class="admin-head">
      <h2>Staff</h2>
      <button class="btn btn-primary btn-sm" onclick="openStaffModal('new')">+ Add staff</button>
    </div>
    <div class="kpi-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:22px;">
      <div class="kpi"><div class="label">Total staff</div><div class="value">${staff.length}</div></div>
      <div class="kpi"><div class="label">Active now</div><div class="value">${activeCount}</div></div>
      <div class="kpi"><div class="label">Roles covered</div><div class="value">${new Set(staff.map((m) => m.role)).size}</div></div>
    </div>
    <div class="panel">
      ${
        staff.length === 0
          ? `<p style="color:var(--ink-soft);">No staff on file yet.</p>`
          : `<div class="table-scroll"><table>
              <tr><th>Name</th><th>Role</th><th>Contact</th><th>Status</th><th></th></tr>
              ${rows}
            </table></div>`
      }
    </div>
  </div>
  ${state.adminStaffModal ? staffModal() : ''}`;
}

function openStaffModal(idOrNew) {
  state.adminEditingStaff = idOrNew;
  state.adminStaffModal = true;
  render();
}

function closeStaffModal() {
  state.adminStaffModal = false;
  state.adminEditingStaff = null;
  render();
}

function staffModal() {
  const editingStaff = state.adminEditingStaff !== 'new' ? staff.find((m) => m.id === state.adminEditingStaff) : null;
  const formValues = editingStaff || { name: '', role: STAFF_ROLES[0], email: '', phone: '', status: 'Active' };

  return `
  <div class="modal-back" onclick="if(event.target===this) closeStaffModal()">
    <div class="modal">
      <h3>${editingStaff ? 'Edit staff member' : 'Add a staff member'}</h3>
      <form onsubmit="return saveStaff(event)">
        <div class="field"><label>Full name</label><input type="text" id="sm-name" required value="${escapeAttr(formValues.name)}"></div>
        <div class="field-row">
          <div class="field"><label>Role</label>
            <select id="sm-role">${STAFF_ROLES.map((r) => `<option value="${r}" ${formValues.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Status</label>
            <select id="sm-status">${['Active', 'On leave', 'Inactive'].map((s) => `<option value="${s}" ${formValues.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
        </div>
        <div class="field"><label>Email</label><input type="email" id="sm-email" required value="${escapeAttr(formValues.email)}"></div>
        <div class="field"><label>Phone</label><input type="tel" id="sm-phone" required value="${escapeAttr(formValues.phone)}" placeholder="07XX XXX XXX"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline btn-sm" onclick="closeStaffModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">${editingStaff ? 'Save changes' : 'Add staff'}</button>
        </div>
      </form>
    </div>
  </div>`;
}

function saveStaff(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('sm-name').value.trim(),
    role: document.getElementById('sm-role').value,
    status: document.getElementById('sm-status').value,
    email: document.getElementById('sm-email').value.trim(),
    phone: document.getElementById('sm-phone').value.trim(),
  };

  if (state.adminEditingStaff === 'new') {
    staff.push(makeStaff(formData));
    showToast('Staff member added');
  } else {
    const member = staff.find((m) => m.id === state.adminEditingStaff);
    Object.assign(member, formData);
    showToast('Staff member updated');
  }

  closeStaffModal();
  return false;
}

function deleteStaff(id) {
  if (!confirm('Remove this staff member?')) return;
  staff = staff.filter((m) => m.id !== id);
  showToast('Staff member removed');
  render();
}
