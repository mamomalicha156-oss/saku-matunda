/**
 * render-auth.js
 * -----------------------------------------------------------------------
 * Login and signup pages, and the logic behind their forms. Both admin
 * and customer accounts sign in through the same login form — what
 * differs is which account they're logging into (see users in data.js).
 * -----------------------------------------------------------------------
 */

// When a login/signup form fails validation, we stash the message here
// and consume it on the very next render of that same view. This keeps
// the error message from "sticking" if the user navigates away.
let pendingError = null;

function renderWithError(view, message) {
  pendingError = { view, msg: message };
  state.view = view;
  render();
}

function viewLogin(errorMessage) {
  return `
  <div class="auth-shell">
    <div class="auth-card">
      <h2>Welcome back</h2>
      <p class="sub">Log in to check out faster and track your orders.</p>
      ${errorMessage ? `<div class="error-box">${errorMessage}</div>` : ''}
      <form onsubmit="return handleLogin(event)">
        <div class="field"><label>Email</label><input type="email" id="li-email" required placeholder="you@example.com"></div>
        <div class="field"><label>Password</label><input type="password" id="li-pass" required placeholder="••••••••"></div>
        <button class="btn btn-primary btn-block" type="submit">Log in</button>
      </form>
      <p class="form-note">Demo admin login: admin@sakugrocery.com / admin123</p>
      <div class="swap-line">New to Saku? <a href="#" onclick="go('signup');return false;">Create an account</a></div>
    </div>
  </div>`;
}

function viewSignup(errorMessage) {
  return `
  <div class="auth-shell">
    <div class="auth-card">
      <h2>Create your account</h2>
      <p class="sub">Save your address and reorder in a couple of clicks.</p>
      ${errorMessage ? `<div class="error-box">${errorMessage}</div>` : ''}
      <form onsubmit="return handleSignup(event)">
        <div class="field"><label>Full name</label><input type="text" id="su-name" required placeholder="Jane Wanjiru"></div>
        <div class="field"><label>Email</label><input type="email" id="su-email" required placeholder="you@example.com"></div>
        <div class="field"><label>Password</label><input type="password" id="su-pass" required minlength="4" placeholder="At least 4 characters"></div>
        <button class="btn btn-primary btn-block" type="submit">Sign up</button>
      </form>
      <div class="swap-line">Already have an account? <a href="#" onclick="go('login');return false;">Log in</a></div>
    </div>
  </div>`;
}

/**
 * Looks up a matching account and, if found, sends the user to the
 * right place: the admin console for admin accounts, the shop for
 * everyone else. Note the order here — we switch views with go() before
 * showing the "welcome back" toast, so the toast's own re-render lands
 * on the destination page instead of flashing the login form again.
 */
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('li-email').value.trim().toLowerCase();
  const password = document.getElementById('li-pass').value;

  const account = users.find((u) => u.email.toLowerCase() === email && u.password === password);
  if (!account) {
    renderWithError('login', 'Incorrect email or password.');
    return false;
  }

  state.currentUser = account;
  go(account.isAdmin ? 'admin-dashboard' : 'shop', { activeCategory: 'all' });
  showToast('Welcome back, ' + account.name.split(' ')[0]);
  return false;
}

/** Creates a new (non-admin) customer account and signs them straight in. */
function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim().toLowerCase();
  const password = document.getElementById('su-pass').value;

  const alreadyExists = users.some((u) => u.email.toLowerCase() === email);
  if (alreadyExists) {
    renderWithError('signup', 'An account with this email already exists.');
    return false;
  }

  const account = { name, email, password, isAdmin: false };
  users.push(account);
  state.currentUser = account;

  go('shop', { activeCategory: 'all' });
  showToast('Account created — welcome, ' + name.split(' ')[0]);
  return false;
}

function logout() {
  state.currentUser = null;
  showToast('Logged out');
  go('home');
}
