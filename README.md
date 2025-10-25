# Restaurant Website

A modern restaurant website built with Next.js, featuring a public-facing website and an admin dashboard for managing menu items.

## Tech Stack

- **Frontend**: Next.js 14 (JavaScript)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Authentication**: Simple cookie-based auth

## Features

### Public Website
- Home page (ready for Figma designs)
- Menu display
- About page
- Contact information
- Mobile-responsive design

### Admin Dashboard
- Secure login system
- Menu item management (CRUD operations)
- Product management
- Simple authentication with cookies

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Public website: http://localhost:3000
   - Admin login: http://localhost:3000/admin
   - Admin dashboard: http://localhost:3000/admin/dashboard

## Project Structure

```
├── app/
│   ├── admin/                 # Admin pages
│   │   ├── dashboard/         # Admin dashboard
│   │   └── page.js           # Admin login
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   └── menu/             # Menu management endpoints
│   ├── globals.css           # Global styles
│   ├── layout.js             # Root layout
│   └── page.js               # Home page
├── components/               # Reusable components
├── lib/                     # Utility functions
│   └── mongodb.js           # Database connection
├── models/                  # Mongoose schemas
│   ├── MenuItem.js          # Menu item model
│   └── User.js              # User model
└── README.md
```

## Database Models

### MenuItem
- Name, description, price
- Category (appetizer, main, dessert, drink, special)
- Image URL, availability status
- Featured status, ingredients, allergens

### User
- Username, password (hashed)
- Role (admin, manager)
- Authentication for admin access

## Admin Setup

To create an admin user, you'll need to:
1. Connect to your MongoDB database
2. Hash a password using bcryptjs
3. Insert a user document with username and hashed password

## Development Notes

- The home page is ready for implementation based on Figma designs
- All API routes are functional for menu management
- Authentication system is simplified but secure for basic admin access
- Responsive design with Tailwind CSS
- MongoDB connection with proper error handling

## Next Steps

1. Implement home page sections based on Figma designs
2. Add menu display page for public users
3. Enhance admin dashboard with more features
4. Add image upload functionality
5. Implement order management system

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/session` - Check session

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create new menu item
- `GET /api/menu/[id]` - Get specific menu item
- `PUT /api/menu/[id]` - Update menu item
- `DELETE /api/menu/[id]` - Delete menu item