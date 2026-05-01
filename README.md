# Kabo Farm Management System

A simplified, beginner-friendly farm management web application that helps a
small farm keep track of its **crops**, **livestock**, **inventory**, and
**daily activities**, and produces a **status summary report** for the whole
farm. Built with Node.js + Express + SQLite on the back end and plain
HTML/CSS/JavaScript on the front end &mdash; no heavy frameworks.

> Inspired by, but **not copied from**, the public farm-management projects
> referenced in the project brief. The data model, code structure, and UI
> are an original simplified design that follows clean separation of concerns.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Quick start](#quick-start)
5. [Default user accounts](#default-user-accounts)
6. [API documentation](#api-documentation)
7. [Database schema](#database-schema)
8. [Solution verification](#solution-verification)
9. [How AI was used](#how-ai-was-used)
10. [License](#license)

---

## Features

- **User accounts & roles** &mdash; admin, farmer, customer (session-based login)
- **Crop management** &mdash; add / update / delete crops with status, planting and harvest dates, and quantity
- **Livestock tracking** &mdash; tag number, species, breed, weight, health status
- **Inventory management** &mdash; feeds, tools, fertilizers, seeds, medicines &mdash; with reorder-level alerts
- **Activity log** &mdash; record planting, harvesting, feeding, spraying, etc., linked to the affected crop or animal
- **Reporting** &mdash; live dashboard + a printable farm-status summary
- **Admin user management** &mdash; create or remove farmers, customers, and other admins
- **Mobile-friendly UI** &mdash; responsive layout that works on phone, tablet, and desktop
- **Local SQLite database** &mdash; zero setup, single file in `./data/kabo_farm.db`

## Tech stack

| Layer       | Technology                                                      |
| ----------- | --------------------------------------------------------------- |
| Backend     | Node.js 18+, Express                                            |
| Database    | SQLite — auto-selects the best available driver (see below)     |
| Frontend    | Plain HTML, CSS, vanilla JavaScript (no frameworks)             |
| Auth        | Session cookies (`express-session`), `bcryptjs` hashing         |
| Dev tooling | npm                                                             |

### SQLite driver — works on every platform

The app automatically picks the right SQLite driver at startup:

| Node version | What it uses | Compilation needed? |
| ------------ | ------------ | ------------------- |
| 22.7+ / 24+  | Built-in `node:sqlite` | **None** |
| 18 – 22.6 on macOS/Linux | `better-sqlite3` | Uses system `gcc` (usually pre-installed) |
| 18 – 22.6 on Windows | `better-sqlite3` | Needs "Desktop development with C++" in Visual Studio |

`better-sqlite3` is listed as an **optional** dependency, so `npm install` never fails even when it can't compile — the app simply falls back to the built-in module if available.

## Project structure

```
kabo-farm-system/
├── server.js                 # App entry point (Express)
├── package.json
├── README.md
├── .gitignore
├── docs/
│   ├── USER_GUIDE.md         # Step-by-step user guide
│   ├── AI_USAGE.md           # How AI was used in each stage
│   └── VERIFICATION.md       # Solution verification checklist
├── src/
│   ├── db/
│   │   ├── database.js       # SQLite connection + schema
│   │   └── seed.js           # Initial users + sample data
│   ├── models/               # Data-access layer (one per table)
│   │   ├── userModel.js
│   │   ├── cropModel.js
│   │   ├── livestockModel.js
│   │   ├── inventoryModel.js
│   │   └── activityModel.js
│   ├── services/             # Business logic
│   │   ├── authService.js
│   │   └── reportService.js
│   ├── middleware/
│   │   └── auth.js           # requireAuth + requireRole
│   └── routes/               # Express routers (REST API)
│       ├── authRoutes.js
│       ├── userRoutes.js
│       ├── cropRoutes.js
│       ├── livestockRoutes.js
│       ├── inventoryRoutes.js
│       ├── activityRoutes.js
│       └── reportRoutes.js
└── public/                   # Vanilla HTML/CSS/JS frontend
    ├── index.html            # Login page
    ├── dashboard.html
    ├── crops.html
    ├── livestock.html
    ├── inventory.html
    ├── activities.html
    ├── reports.html
    ├── users.html            # Admin only
    ├── css/style.css
    └── js/
        ├── api.js
        ├── app.js
        ├── crops.js
        ├── livestock.js
        ├── inventory.js
        └── activities.js
```

This structure follows a **separation of concerns**:

- **routes** &mdash; only handle HTTP concerns (validation, status codes, calling services/models)
- **services** &mdash; business logic (auth, aggregated reports)
- **models** &mdash; pure data access (SQL via `better-sqlite3`)
- **public** &mdash; the static front-end consumes the JSON API

## Quick start

Requirements: **Node.js 18+** and npm.

> **Windows + Node 24 users:** `npm install` works without any C++ tools —
> the app uses Node's built-in SQLite module automatically.
> **Windows + Node 18-22 users:** install
> [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
> with "Desktop development with C++" and run `npm install` again, OR upgrade
> to Node 24.

```bash
# 1. Install dependencies
npm install

# 2. Start the server (creates ./data/kabo_farm.db on first run and seeds it)
npm start

# 3. Open the app
# http://localhost:5000
```

The first startup will:

1. Create `./data/kabo_farm.db`
2. Create all tables
3. Insert the default users and a few sample crops/livestock/inventory/activities
4. Print which SQLite driver it selected (`node:sqlite` or `better-sqlite3`)

Then open **http://localhost:5000** in your browser.

To use a different port: `PORT=3000 npm start` (Windows: `set PORT=3000 && npm start`)

To re-seed manually after deleting the DB file:

```bash
npm run seed
```

To develop with auto-restart:

```bash
npm run dev
```

## Default user accounts

| Username | Password    | Role     |
| -------- | ----------- | -------- |
| admin    | admin123    | admin    |
| jane     | farmer123   | farmer   |
| peter    | farmer123   | farmer   |
| mary     | customer123 | customer |

> **Change these passwords** before any real-world use. Admins can create new
> users from **Users** in the sidebar.

## API documentation

All endpoints return JSON. Authentication is session-cookie based. Send
`Content-Type: application/json` for POST / PUT bodies.

### Auth

| Method | Path              | Body                       | Description                  |
| ------ | ----------------- | -------------------------- | ---------------------------- |
| POST   | `/api/auth/login` | `{ username, password }`   | Log in, sets session cookie  |
| POST   | `/api/auth/logout`| -                          | Destroys session             |
| GET    | `/api/auth/me`    | -                          | Returns the current user     |

### Crops &nbsp;`/api/crops`

| Method | Path  | Roles            | Description       |
| ------ | ----- | ---------------- | ----------------- |
| GET    | `/`   | any logged in    | List crops (farmers see only their own) |
| GET    | `/:id`| any              | Get one crop      |
| POST   | `/`   | admin, farmer    | Create crop       |
| PUT    | `/:id`| admin, farmer    | Update crop       |
| DELETE | `/:id`| admin, farmer    | Delete crop       |

### Livestock &nbsp;`/api/livestock`

Same shape as `/api/crops`. `tag_number` must be unique.

### Inventory &nbsp;`/api/inventory`

| Method | Path             | Roles         | Description                 |
| ------ | ---------------- | ------------- | --------------------------- |
| GET    | `/`              | any           | List items                  |
| GET    | `/low-stock`     | any           | Items at/under reorder level|
| GET    | `/:id`           | any           | Get one item                |
| POST   | `/`              | admin, farmer | Create                      |
| PUT    | `/:id`           | admin, farmer | Update                      |
| DELETE | `/:id`           | admin, farmer | Delete                      |

### Activities &nbsp;`/api/activities`

| Method | Path  | Roles            |
| ------ | ----- | ---------------- |
| GET    | `/`   | any              |
| POST   | `/`   | admin, farmer    |
| PUT    | `/:id`| admin, farmer    |
| DELETE | `/:id`| admin, farmer    |

### Reports

| Method | Path                  | Roles | Description                       |
| ------ | --------------------- | ----- | --------------------------------- |
| GET    | `/api/reports/summary`| any   | Aggregated farm-status summary    |

### Users (admin only)

| Method | Path           | Description                                  |
| ------ | -------------- | -------------------------------------------- |
| GET    | `/api/users`   | List users                                   |
| POST   | `/api/users`   | Create `{ username, password, full_name, role, email }` |
| DELETE | `/api/users/:id` | Delete (cannot delete self)                |

### Example: create a crop

```bash
curl -X POST http://localhost:3000/api/crops \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"name":"Kale","variety":"Collards","field_location":"Field C","status":"growing","quantity_kg":0}'
```

## Database schema

Five SQLite tables (see `src/db/database.js` for the canonical DDL):

```
users (id, username, password_hash, full_name, role, email, created_at)
crops (id, name, variety, field_location, planted_date, expected_harvest,
       quantity_kg, status, farmer_id, created_at)
livestock (id, tag_number, species, breed, birth_date, weight_kg,
           health_status, farmer_id, created_at)
inventory (id, item_name, category, quantity, unit, reorder_level, notes, created_at)
activities (id, activity_type, description, activity_date,
            related_crop_id, related_livestock_id, performed_by, created_at)
```

Constraints:

- `users.role`            &isin; { admin, farmer, customer }
- `crops.status`          &isin; { planned, growing, harvested, sold }
- `livestock.health_status` &isin; { healthy, sick, recovering, sold, deceased }
- `inventory.category`    &isin; { feed, tool, fertilizer, seed, medicine, other }
- `activities.activity_type` &isin; { planting, harvesting, feeding, watering, spraying, maintenance, other }

Foreign-key relations:

- `crops.farmer_id`             &rarr; `users.id`
- `livestock.farmer_id`         &rarr; `users.id`
- `activities.related_crop_id`  &rarr; `crops.id`
- `activities.related_livestock_id` &rarr; `livestock.id`
- `activities.performed_by`     &rarr; `users.id`

## Solution verification

See `docs/VERIFICATION.md` for the full step-by-step checklist. Quick sanity
test:

```bash
npm install && npm start
# In another terminal:
curl -i http://localhost:3000/api/auth/me        # expect 401
curl -i -c c.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'  # expect 200 + Set-Cookie
curl -b c.txt http://localhost:3000/api/reports/summary  # expect JSON summary
```

If all three calls behave as commented, the system is working end-to-end.

## How AI was used

See `docs/AI_USAGE.md` for the per-stage breakdown (design, schema,
backend, frontend, documentation, verification).

## License

MIT &mdash; see source files for header comments. This project is provided as a
learning / starter codebase; do **not** ship to production without replacing
the default session secret and user passwords.
