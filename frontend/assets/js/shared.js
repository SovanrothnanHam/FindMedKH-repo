/* ═══════════════════════════════════════════════════════════════════════════
   FILE: assets/js/shared.js
   PURPOSE: Loaded on EVERY page. Provides:
     • API communication (apiFetch)
     • Authentication helpers (login state, token storage)
     • Navbar rendering (renderNavbar)
     • Footer rendering (renderFooter)
     • Toast notifications (toast)
     • Session ID management (getSessionId)
     • HTML escape utility (esc)

   ╔══════════════════════════════════════════════════════════════╗
   ║  QUICK CUSTOMIZATION GUIDE                                   ║
   ║  • Change API URL      → edit const API at top              ║
   ║  • Change logo text    → edit nav-brand HTML in renderNavbar ║
   ║  • Change logo icon    → edit .cross content in renderNavbar ║
   ║  • Add/remove nav links → edit pages[] array                ║
   ║  • Change footer text  → edit renderFooter()                ║
   ║  • Change emergency #s → edit renderFooter()                ║
   ╚══════════════════════════════════════════════════════════════╝
═══════════════════════════════════════════════════════════════════════════ */

/* ── API BASE URL ────────────────────────────────────────────────────────────
   TO CHANGE API SERVER: edit this URL.
   Development:  'http://localhost:8000'
   Production:   'https://your-api-domain.com'
──────────────────────────────────────────────────────────────────────────── */
const API = 'http://localhost:8000';

/* ══════════════════════════════════════════════════════════════════════
   AUTH HELPERS
   Token and user data stored in localStorage under 'fmkh_' prefix.
   TO CHANGE STORAGE KEYS: update all 'fmkh_token' and 'fmkh_user' strings.
══════════════════════════════════════════════════════════════════════ */

/** Get the stored JWT token, or null if not logged in */
function getToken()   { return localStorage.getItem('fmkh_token'); }

/** Get the stored user object {user_id, full_name, role}, or null */
function getUser()    { return JSON.parse(localStorage.getItem('fmkh_user') || 'null'); }

/** Returns true if a user is currently logged in */
function isLoggedIn() { return !!getToken(); }

/** Returns true if the logged-in user has admin role */
function isAdmin()    { const u = getUser(); return u && u.role === 'admin'; }

/** Save token and user after successful login */
function saveAuth(token, user) {
  localStorage.setItem('fmkh_token', token);
  localStorage.setItem('fmkh_user', JSON.stringify(user));
}

/** Clear all auth data on logout */
function clearAuth() {
  localStorage.removeItem('fmkh_token');
  localStorage.removeItem('fmkh_user');
}

/* ══════════════════════════════════════════════════════════════════════
   API FETCH WRAPPER
   Wraps the native fetch() with:
   • Automatic JSON Content-Type header
   • Automatic Authorization: Bearer token injection
   • Error parsing from FastAPI's { detail: "..." } format
   TO USE: const data = await apiFetch('/hospitals', { method: 'GET' })
══════════════════════════════════════════════════════════════════════ */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;  /* Attach JWT if logged in */

  const res = await fetch(API + path, { ...options, headers });

  if (!res.ok) {
    /* FastAPI returns errors as { detail: "message" } */
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ══════════════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
   Shows a temporary pop-up message at the bottom-right corner.
   TO CHANGE POSITION: edit bottom/right in #toast in shared.css
   USAGE: toast('Message text', 'success' | 'error' | 'default', ms)
══════════════════════════════════════════════════════════════════════ */
function toast(msg, type = 'default', duration = 3200) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  /* Prefix icon based on type */
  const icons = { success: '✓ ', error: '✕ ', default: '' };
  el.textContent = (icons[type] || '') + msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, duration);
}

/* ══════════════════════════════════════════════════════════════════════
   NAVBAR RENDERER
   Call renderNavbar('pageName') at the bottom of every page's <script>.
   The pageName string must match one of the 'key' values in pages[] below.
   Example: renderNavbar('hospitals')

   ★ TO CUSTOMIZE NAVBAR:
   • LOGO TEXT: edit the text after <div class="cross">✚</div>
   • LOGO ICON: change the ✚ character inside .cross
   • ADD PAGE: add { href, label, key } to pages[] array below
   • REMOVE PAGE: delete its entry from pages[]
   • ADMIN BUTTON: edit the isAdmin() block in the actions section
══════════════════════════════════════════════════════════════════════ */
function renderNavbar(activePage = '') {
  const user = getUser();
  const isRoot = !window.location.pathname.includes('/pages/');
  const base = isRoot ? 'pages/' : '../pages/';
  const homeHref = isRoot ? 'index.html' : '../index.html';

  /* ── NAV LINKS ── TO ADD A PAGE: add an entry here ── */
  const pages = [
    { href: homeHref,              label: 'Home',      key: 'home' },
    { href: base + 'hospitals.html', label: 'Hospitals', key: 'hospitals' },
    { href: base + 'chatbot.html',   label: 'Chatbot',   key: 'chatbot' },
    { href: base + 'about.html',     label: 'About',     key: 'about' },
    { href: base + 'faq.html',       label: 'FAQ',       key: 'faq' },
  ];

  const links = pages.map(p =>
    `<a href="${p.href}" class="${activePage === p.key ? 'active' : ''}">${p.label}</a>`
  ).join('');

  /* ── RIGHT SIDE ACTIONS (logged in vs guest) ── */
  let actions = '';
  if (user) {
    /* Logged-in: show name chip, admin button (if admin), logout */
    const initial = (user.full_name || 'U')[0].toUpperCase();
    actions = `
      <div class="nav-user">
        <span class="avatar">${initial}</span>
        <span>${user.full_name.split(' ')[0]}</span>
      </div>
      ${isAdmin() ? `<a href="${base}admin.html" class="btn btn-gold btn-sm">⚙ Admin</a>` : ''}
      <button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>
    `;
  } else {
    /* Guest: show Login + Sign Up buttons */
    /* TO CHANGE BUTTON TEXT: edit 'Log In' and 'Sign Up' strings */
    actions = `
      <a href="${base}login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="${base}signup.html" class="btn btn-primary btn-sm">Sign Up Free</a>
    `;
  }

  /* Inject HTML into <div id="navbar"> */
  document.getElementById('navbar').innerHTML = `
    <a href="${homeHref}" class="nav-brand">
      <div class="cross">✚</div>
      FindMEDKH
    </a>
    <nav class="nav-links" id="navLinks">${links}</nav>
    <div class="nav-actions">${actions}</div>
    <button class="nav-toggle" id="navToggle" onclick="toggleNav()" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  `;
}

/* Toggle mobile nav menu open/closed */
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

/* ══════════════════════════════════════════════════════════════════════
   FOOTER RENDERER
   Call renderFooter() at the bottom of every page's <script>.
   Injects HTML into <div id="footer">.

   ★ TO CUSTOMIZE FOOTER:
   • Company description: edit .footer-tagline paragraph
   • Nav column links:   edit the 'Navigate' / 'Help' anchor tags
   • Emergency numbers:  edit the phone numbers in 'Emergency' column
   • Copyright text:     edit the .footer-bottom span text
══════════════════════════════════════════════════════════════════════ */
function renderFooter() {
  const isRoot = !window.location.pathname.includes('/pages/');
  const base = isRoot ? 'pages/' : '';
  const homeHref = isRoot ? 'index.html' : '../index.html';

  document.getElementById('footer').innerHTML = `
    <div class="footer-grid">

      <!-- Column 1: Brand + description -->
      <!-- TO CHANGE FOOTER DESCRIPTION: edit the <p> paragraph below -->
      <div>
        <div class="footer-brand">
          <div class="cross">✚</div> FindMEDKH
        </div>
        <p class="footer-tagline">
          Your trusted guide to finding the right hospital in Phnom Penh, Cambodia.
          Fast, smart, and always free.
        </p>
      </div>

      <!-- Column 2: Navigate links — TO ADD/REMOVE LINKS: edit anchors below -->
      <div class="footer-col">
        <h4>Navigate</h4>
        <a href="${homeHref}">Home</a>
        <a href="${base}hospitals.html">Hospitals</a>
        <a href="${base}chatbot.html">Chatbot</a>
        <a href="${base}about.html">About Us</a>
      </div>

      <!-- Column 3: Help links -->
      <div class="footer-col">
        <h4>Help</h4>
        <a href="${base}faq.html">FAQ</a>
        <a href="${base}login.html">Log In</a>
        <a href="${base}signup.html">Sign Up</a>
      </div>

      <!-- Column 4: Emergency numbers — ★ UPDATE THESE WITH REAL NUMBERS -->
      <div class="footer-col">
        <h4>Emergency</h4>
        <a href="tel:119">🚓 Police: 119</a>
        <a href="tel:118">🚑 Ambulance: 118</a>
        <a href="tel:023426948">🏥 Calmette: 023 426 948</a>
        <a href="tel:023216911">🏥 Raffles: 023 216 911</a>
      </div>

    </div>

    <!-- Footer bottom bar -->
    <!-- TO CHANGE COPYRIGHT TEXT: edit the span below -->
    <div class="footer-bottom">
      <span>© 2025 FindMEDKH · Phnom Penh, Cambodia 🇰🇭</span>
      <span style="color:rgba(255,255,255,.4)">Built for healthier communities</span>
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════════════
   LOGOUT
   Clears auth data, shows toast, redirects to home page.
   TO CHANGE REDIRECT AFTER LOGOUT: edit the window.location.href line.
══════════════════════════════════════════════════════════════════════ */
function logout() {
  clearAuth();
  toast('Logged out successfully', 'success');
  const isRoot = !window.location.pathname.includes('/pages/');
  setTimeout(() => {
    window.location.href = isRoot ? 'index.html' : '../index.html';
  }, 600);
}

/* ══════════════════════════════════════════════════════════════════════
   SESSION ID
   Generates a unique session ID for guest chat tracking.
   Stored in localStorage as 'fmkh_session'.
   The chatbot uses this to enforce the 5-message guest limit.
   TO RESET: localStorage.removeItem('fmkh_session') in browser console.
══════════════════════════════════════════════════════════════════════ */
function getSessionId() {
  let sid = localStorage.getItem('fmkh_session');
  if (!sid) {
    /* Generate random UUID-like string */
    sid = 'sess-' + Math.random().toString(36).slice(2) + '-' + Date.now();
    localStorage.setItem('fmkh_session', sid);
  }
  return sid;
}

/* ══════════════════════════════════════════════════════════════════════
   HTML ESCAPE UTILITY
   Prevents XSS by escaping user-provided strings before inserting into DOM.
   ALWAYS use esc() when rendering data from the API into innerHTML.
   Usage: element.innerHTML = `<p>${esc(userText)}</p>`
══════════════════════════════════════════════════════════════════════ */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ══════════════════════════════════════════════════════════════════════
   HAVERSINE DISTANCE
   Calculates km distance between two GPS coordinates.
   Used by hospitals.html and chatbot.html for distance sorting.
   Formula: great-circle distance on a sphere of radius 6371km.
══════════════════════════════════════════════════════════════════════ */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 100) / 100;
}
