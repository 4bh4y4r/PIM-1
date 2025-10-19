# Person Hub Application

A comprehensive person management system with role-based access control, built with React, TypeScript, Node.js, Express, and Prisma.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Secure Login/Registration**: JWT-based authentication
- **Role-Based Access Control**: Admin and User roles
- **Password Management**: Change password functionality
- **Protected Routes**: Role-specific page access

### 👤 User Features (Regular Users)
- **Dashboard**: Overview with personal statistics
- **Add Info**: Create new person records
- **My Info**: View, edit, and delete personal records
- **Profile**: Manage account information and change password

### 👑 Admin Features
- **Admin Dashboard**: System-wide statistics and overview
- **Search**: Search across all person records
- **Reports**: Analytics and reporting
- **Export Reports**: Export selected or all report summaries to CSV or PDF (Reports page)
- **View Records**: Browse/manage all person records
- **User Management**: Manage user accounts and roles
- UI is cleaned up: no "Add Info" link or "My Information" section for admins; documents upload is hidden for admins

### 🏷️ Smart Categories
- Records are automatically assigned categories based on fields actually filled:
  - Personal, Address, Identification, Education, Financial, Health
- Multiple categories are applied when multiple sections are filled
- Categories are computed server-side on create/update and merged with client-sent tags
- A backfill endpoint updates existing records: `POST /api/persons/backfill/tags`

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript, Vite, Tailwind CSS, Radix UI, React Router

### Backend
- Node.js + Express (TypeScript), Prisma (MySQL), JWT, bcrypt

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MySQL
- npm or yarn

### Backend Setup
```bash
cd person-hub-app/server
npm install
```

Create `.env` in `server`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/person_hub_db"
JWT_SECRET="your-jwt-secret-key"
PORT=5001
HOST=localhost
```

Run Prisma:
```bash
npx prisma migrate deploy
npx prisma generate
node create-admin.js
```

Start server (dev):
```bash
npm run dev
```

For production:
```bash
npm run build && npm start
```

CORS is enabled for localhost and LAN ports (8080/8082/8083). If your frontend runs elsewhere, add its origin in `server/src/index.ts`.

### Frontend Setup
```bash
cd person-hub-app
npm install
```

Create `.env` in frontend (optional):
```env
VITE_API_URL=http://localhost:5001
```

Start frontend:
```bash
npm run dev
```

## 👥 Role-based UI Behavior
- Regular users: see Dashboard, Add Info, My Info, Profile
- Admins: see Admin Dashboard, Search, Reports (with CSV/PDF export), View Records, User Management, Profile
  - No Add Info in nav
  - No My Information block
  - Document Uploads section hidden in form
  - Card View removed from My Information list for simplicity

## 🔌 Key API Endpoints
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/profile`
- Persons:
  - `GET /api/persons?page=1&limit=10000&sortBy=createdAt&sortOrder=desc`
  - `POST /api/persons`
  - `GET /api/persons/:id`
  - `PUT /api/persons/:id`
  - `DELETE /api/persons/:id`
- Reports:
  - `GET /api/search/stats`
  - `GET /api/search/demographics`
- Utilities:
  - `POST /api/persons/backfill/tags`

## Admin Dashboard Stats
- Total Records: uses backend pagination total when available
- Last 7 Days: count of records created within last 7 days
- Active Records: created within last 30 days
- Inactive Records: Total - Active