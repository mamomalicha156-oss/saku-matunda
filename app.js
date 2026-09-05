/**
 * app.js
 * -----------------------------------------------------------------------
 * The root render function: picks which view to show based on
 * state.view, wraps it in the right chrome (storefront header/footer,
 * or the admin sidebar), and mounts the result into #app. Every other
 * file just changes `state` and calls render() — this is the only place
 * that decides what that state currently means on screen.
 *
 * Loaded last, so everything it references (data, state, and the
 * render-*.js view functions) already exists by the time it runs.
 * -----------------------------------------------------------------------
 */

const ADMIN_VIEWS = ['admin-dashboard', 'admin-products', 'admin-orders', 'admin-staff'];

function render() {
  const appEl = document.getElementById('app');

  // Guard admin pages: if someone isn't logged in as an admin, bounce
  // them to the login screen instead of rendering an admin view.
  if (ADMIN_VIEWS.includes(state.view) && !requireAdmin()) {
    state.view = 'login';
  }

  let body;

  if (ADMIN_VIEWS.includes(state.view)) {
    const adminContent =
      state.view === 'admin-dashboard' ? viewAdminDashboard()
      : state.view === 'admin-products' ? viewAdminProducts()
      : state.view === 'admin-orders' ? viewAdminOrders()
      : viewAdminStaff();

    body = `
      ${header()}
      <div class="admin-shell">
        ${adminNav(state.view)}
        ${adminContent}
      </div>`;
  } else {
    // Consume any pending form error meant for the view we're about to show
    let errorMessage = null;
    if (pendingError && pendingError.view === state.view) {
      errorMessage = pendingError.msg;
      pendingError = null;
    }

    const pageContent =
      state.view === 'home' ? viewHome()
      : state.view === 'shop' ? viewShop()
      : state.view === 'product' ? viewProduct()
      : state.view === 'checkout' ? viewCheckout()
      : state.view === 'confirmation' ? viewConfirmation()
      : state.view === 'login' ? viewLogin(errorMessage)
      : state.view === 'signup' ? viewSignup(errorMessage)
      : viewHome();

    body = `
      ${header()}
      <main style="flex:1;">${pageContent}</main>
      ${footer()}`;
  }

  appEl.innerHTML = body + cartDrawer() + toast();
}

// Kick things off.
render();
