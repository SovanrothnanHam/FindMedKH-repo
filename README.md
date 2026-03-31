# 🏥 FindMEDKH — Hospital Recommendation Chatbot

> Find the right hospital in Phnom Penh, right now.

FindMEDKH is a full-stack web application that helps people in Phnom Penh find the nearest, most suitable hospital based on their symptoms. Users describe their condition in plain language, and the chatbot instantly recommends the top 3 closest hospitals using keyword-based intent detection and GPS distance sorting.

---

## 📸 Screenshots

| Home Page | Hospital Listing | Chatbot |
|-----------|-----------------|---------|
| Hero + Specialties + Featured | Search + Filter + Photo Cards | Sidebar + Chat + Hospital Cards |

---

## ✨ Features

- **Smart Chatbot** — Keyword-based intent detection maps symptoms → medical specialties → hospitals
- **GPS Distance Sorting** — Haversine formula sorts hospitals nearest-first using your location
- **60+ Hospitals** — Public and private facilities across Phnom Penh with real data
- **31 Medical Specialties** — From cardiology to dental to mental health
- **Guest Mode** — 5 free messages without an account
- **User Accounts** — JWT auth, unlimited chat, saved history
- **Admin Dashboard** — Full CRUD for hospitals, specialties, and users
- **Baby Blue Theme** — Clean, professional medical UI with responsive design

---

## 🗂️ Project Structure

```
findmedkh/
│
├── 📁 backend/                      ← FastAPI Python backend
│   ├── main.py                      ← App entry point — run this
│   ├── requirements.txt             ← Python dependencies
│   ├── .env                         ← 🔑 Your database credentials (edit this!)
│   └── app/
│       ├── core/
│       │   ├── config.py            ← Reads .env settings
│       │   ├── database.py          ← MySQL connection (SQLAlchemy)
│       │   ├── security.py          ← bcrypt + JWT helpers
│       │   └── dependencies.py      ← FastAPI auth guards
│       ├── models/
│       │   └── models.py            ← Database table definitions (ORM)
│       ├── schemas/
│       │   └── schemas.py           ← API request/response shapes (Pydantic)
│       ├── services/
│       │   ├── intent_service.py    ← Keyword intent detection engine
│       │   ├── hospital_service.py  ← Hospital queries + Haversine distance
│       │   └── chat_service.py      ← Session tracking + message saving
│       └── routers/
│           ├── auth.py              ← /auth/register, /auth/login, /auth/me
│           ├── chat.py              ← /chat (main chatbot endpoint)
│           ├── hospitals.py         ← /hospitals (public listing)
│           └── admin.py             ← /admin/* (admin CRUD, protected)
│
└── 📁 frontend/                     ← Static HTML/CSS/JS (no framework)
    ├── index.html                   ← 🏠 Home / Landing page
    ├── assets/
    │   ├── css/
    │   │   ├── shared.css           ← ★ Global styles, colors, components
    │   │   └── home.css             ← Styles specific to index.html
    │   └── js/
    │       └── shared.js            ← ★ API client, auth, navbar, footer
    └── pages/
        ├── hospitals.html           ← 🏥 Hospital browser with photos + filters
        ├── chatbot.html             ← 💬 MED Assistant chatbot interface
        ├── login.html               ← 🔑 Login form
        ├── signup.html              ← 📝 Registration form
        ├── about.html               ← ℹ️ About, values, tech stack
        ├── faq.html                 ← ❓ Accordion FAQ
        └── admin.html               ← ⚙️ Admin dashboard (CRUD)
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- MySQL 8.0+
- A modern web browser

### Step 1 — Set Up the Database

```bash
# Import the provided SQL file into MySQL
mysql -u root -p < FindMEDKH_Database.sql
```

### Step 2 — Configure the Backend

```bash
cd backend

# Edit the .env file with your MySQL credentials:
# DB_PASSWORD=your_mysql_password
# SECRET_KEY=any_long_random_string_here
nano .env
```

### Step 3 — Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
pip install pydantic-settings        # if not included
```

### Step 4 — Run the Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ API is now running at: **http://localhost:8000**
📖 Interactive API docs at: **http://localhost:8000/docs**

### Step 5 — Open the Frontend

Simply open `frontend/index.html` in your browser.

> **Tip:** For best results, use a local server instead of opening file directly:
> ```bash
> # Python built-in server (from frontend/ directory):
> cd frontend
> python -m http.server 3000
> # Then open http://localhost:3000
> ```

---

## 🔑 Creating an Admin Account
<!-- pip uninstall bcrypt -y
pip install bcrypt==4.0.1 -->
<!-- pip uninstall passlib -y
pip install passlib==1.7.4 -->
<!-- uvicorn main:app --reload --host 0.0.0.0 --port 8000 -->
1. Register a normal account at `/pages/signup.html`
2. Run this SQL to promote it to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
3. Log in and you'll see the **⚙ Admin** button in the navbar

---

## 🎨 Customization Guide

### Change the Color Theme

Open `frontend/assets/css/shared.css` and edit the `:root` variables:

```css
:root {
  --sky:       #5DADE2;   /* ← Main baby blue */
  --sky-dark:  #2E86C1;   /* ← Darker blue for hover */
  --coral:     #E8705A;   /* ← CTA button color */
  --navy:      #1A3A52;   /* ← Footer background */
}
```

### Change the Logo

Open `frontend/assets/js/shared.js`, find `renderNavbar()`, and edit:

```javascript
// Change the ✚ icon:
<div class="cross">✚</div>

// Change the site name text:
FindMEDKH
```

### Change the Logo Icon (CSS)

In `shared.css`, find `.nav-brand .cross` to change the icon background color and shape.

### Add a Hospital Photo

In `frontend/pages/hospitals.html`, find the `PHOTOS` object and add:

```javascript
const PHOTOS = {
  'Your Hospital Name': 'https://your-photo-url.jpg',
  // or use a local file:
  'Your Hospital Name': '../assets/img/hospitals/your-photo.jpg',
};
```

### Add a New Nav Page

In `shared.js`, find `renderNavbar()` and add to the `pages` array:

```javascript
const pages = [
  // ... existing pages ...
  { href: base + 'newpage.html', label: 'New Page', key: 'newpage' },
];
```

### Change the API Server URL

In `shared.js` (line ~30):

```javascript
const API = 'http://localhost:8000';  // ← Change this for production
```

### Change Guest Message Limit

In `backend/.env`:
```
GUEST_MAX_MESSAGES=5   ← Change this number
```

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | None | Create account |
| `POST` | `/auth/login` | None | Get JWT token |
| `GET` | `/auth/me` | User | Get current user |
| `POST` | `/chat` | Optional | Send message, get hospitals |
| `GET` | `/chat/history/{id}` | Optional | Get session history |
| `GET` | `/hospitals` | None | List all hospitals |
| `GET` | `/hospitals/specialties` | None | List all specialties |
| `GET` | `/hospitals/{id}` | None | Get single hospital |
| `GET` | `/admin/stats` | Admin | Dashboard numbers |
| `GET/POST/PUT/DELETE` | `/admin/hospitals` | Admin | Hospital CRUD |
| `GET/POST/PUT/DELETE` | `/admin/specialties` | Admin | Specialty CRUD |
| `GET/DELETE` | `/admin/users` | Admin | User management |

---

## 🧠 How the Chatbot Works

```
User Message → Tokenize (words + bigrams) → Score against intent keywords
→ Pick highest-scoring intent → Map intent to specialty names
→ SQL JOIN hospitals ↔ specialties → Filter by specialty
→ Haversine distance calculation → Sort nearest first → Return top 3
```

**No AI models used.** Pure keyword matching — fast, free, and fully offline-capable.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI 0.111 |
| Database | MySQL 8, SQLAlchemy 2.0 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Validation | Pydantic v2 |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Plus Jakarta Sans + Fraunces (Google Fonts) |
| Photos | Unsplash (free, no attribution required) |
| Distance | Haversine formula (custom implementation) |

---

## 🗃️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (role: user/admin) |
| `hospitals` | Hospital data (name, GPS, phone, hours) |
| `specialties` | Medical specialties with keywords |
| `hospital_specialties` | Many-to-many: hospital ↔ specialty |
| `chat_sessions` | Chat sessions (tracks guest message count) |
| `chat_messages` | Individual chat messages (user + bot) |
| `chatbot_intents` | Intent definitions and response templates |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (never stored plain)
- All API inputs validated with **Pydantic**
- JWT tokens expire after **120 minutes** (configurable in `.env`)
- Admin endpoints protected by role check
- HTML output always escaped with `esc()` to prevent XSS
- Change `SECRET_KEY` in `.env` before deploying to production!

---

## 📄 License

This project is for educational purposes. Hospital data sourced from public records.

---

## 🇰🇭 Made for Cambodia

Built specifically for Phnom Penh, with real hospital data, real GPS coordinates, and real phone numbers. Every hospital in the database is a real medical facility.

**Emergency contacts:**
- 🚓 Police: **119**
- 🚑 Ambulance: **118**
- 🏥 Calmette Hospital (24/7): **023 426 948**
- 🏥 Raffles Medical: **023 216 911**
