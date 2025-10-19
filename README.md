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
- **Add Person**: Create new person records
- **My Info**: View, edit, and delete personal records
- **Profile**: Manage account information and change password
- **Personal Statistics**: Track submitted records and activity

### 👑 Admin Features
- **Full Dashboard**: System-wide statistics and analytics
- **Search Records**: Search across all person records
- **Reports**: Comprehensive system reports and analytics
- **View Records**: Manage all person records in the system
- **User Management**: Manage user accounts and roles
- **Admin Panel**: System administration tools

### 📊 Analytics & Reporting
- **Real-time Statistics**: Live data from database
- **Demographic Analysis**: Gender, age groups, city distribution
- **Activity Tracking**: User actions and system activity
- **Contact Completeness**: Data quality metrics
- **Search Analytics**: Search patterns and usage

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for components
- **React Router** for navigation
- **React Query** for data fetching

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** as ORM
- **MySQL** database
- **JWT** for authentication
- **bcrypt** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Backend Setup
```bash
cd person-hub-app/server
npm install
```

### Database Setup
```bash
# Create .env file with database connection
DATABASE_URL="mysql://username:password@localhost:3306/person_hub"

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Create admin user
node create-admin.js
```

### Frontend Setup
```bash
cd person-hub-app
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd person-hub-app/server
npm run dev
```
Server runs on `http://localhost:5001`

### Start Frontend Development Server
```bash
cd person-hub-app
npm run dev
```
Frontend runs on `http://localhost:8080`

## 👥 User Roles & Access

### Regular Users
- **Dashboard**: Personal statistics and quick actions
- **Add Person**: Create new person records
- **My Info**: View and manage their own records
- **Profile**: Account management and password change

### Admin Users
- **All User Features**: Full access to user functionality
- **Search**: Search across all person records
- **Reports**: System-wide analytics and reports
- **View Records**: Manage all person records
- **User Management**: Manage user accounts and roles
- **Admin Panel**: System administration

## 🔑 Default Admin Credentials

- **Email**: `admin@gmail.com`
- **Password**: `password`

## 📁 Project Structure

```
person-hub-app/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   ├── forms/              # Form components
│   │   ├── reports/            # Report components
│   │   ├── search/             # Search components
│   │   └── ui/                 # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Login.tsx           # Authentication
│   │   ├── MyInfo.tsx          # User's personal records
│   │   ├── Profile.tsx         # User profile management
│   │   ├── ViewRecords.tsx     # Admin record management
│   │   ├── UserManagement.tsx  # Admin user management
│   │   └── ...                 # Other pages
│   └── hooks/                  # Custom React hooks
├── server/
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/            # API routes
│   │   └── utils/              # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── create-admin.js        # Admin user creation script
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password

### Person Management
- `GET /api/persons` - Get all persons (filtered by user)
- `POST /api/persons` - Create new person
- `GET /api/persons/:id` - Get person by ID
- `PUT /api/persons/:id` - Update person
- `DELETE /api/persons/:id` - Delete person

### Search & Analytics
- `GET /api/search/persons` - Search persons
- `GET /api/search/stats` - Get person statistics
- `GET /api/search/demographics` - Get demographic data
- `GET /api/search/dashboard` - Get dashboard statistics

### User Management (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### Activity Logs
- `GET /api/activities/stats` - Get activity statistics
- `GET /api/activities/person/:personId` - Get person activity

## 🎨 UI Components

The application uses a comprehensive set of reusable UI components:

- **Cards**: Information display containers
- **Tables**: Data presentation with sorting and filtering
- **Forms**: Input validation and submission
- **Dialogs**: Modal windows for actions
- **Navigation**: Role-based menu system
- **Charts**: Data visualization components
- **Badges**: Status and category indicators

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-Based Access**: Granular permission system
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **CORS Configuration**: Proper cross-origin resource sharing

## 📊 Database Schema

### Users Table
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `name`: User display name
- `role`: USER or ADMIN
- `createdAt`: Account creation date
- `updatedAt`: Last update date

### Persons Table
- `id`: Unique identifier
- `firstName`: Person's first name
- `lastName`: Person's last name
- `email`: Contact email
- `phone`: Contact phone
- `address`: Physical address
- `dateOfBirth`: Birth date
- `profileImage`: Profile picture URL
- `tags`: Comma-separated tags
- `notes`: Additional notes
- `createdById`: User who created the record
- `createdAt`: Record creation date
- `updatedAt`: Last update date

### Activity Logs Table
- `id`: Unique identifier
- `action`: Action type (CREATE, UPDATE, DELETE, etc.)
- `details`: Action description
- `timestamp`: When the action occurred
- `userId`: User who performed the action
- `personId`: Person record affected (optional)

## 🚀 Deployment

### Environment Variables
Create a `.env` file in the server directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/person_hub"
JWT_SECRET="your-jwt-secret-key"
PORT=5001
HOST=localhost
```

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Recent Updates

### Version 2.0.0
- ✅ Role-based access control implementation
- ✅ User profile management
- ✅ Password change functionality
- ✅ Admin user management
- ✅ Personal record management for users
- ✅ Comprehensive reporting system
- ✅ Real-time statistics and analytics
- ✅ Enhanced security features
- ✅ Improved UI/UX with role-specific navigation

### Version 1.0.0
- ✅ Basic person management
- ✅ Authentication system
- ✅ Dashboard and reporting
- ✅ Search functionality
- ✅ Admin panel