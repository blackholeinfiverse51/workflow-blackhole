# 📋 Admin Dashboard Components List

## Complete Component Inventory for AdminDashboard.jsx

This document lists all components, UI elements, and dependencies used in the Admin Dashboard.

---

## 🎨 UI Components (from `@/components/ui/`)

### 1. **Card Components**
- `Card` - Main container component
- `CardContent` - Content wrapper inside cards
- `CardHeader` - Header section of cards
- `CardTitle` - Title text in card headers
- `CardDescription` - Description text in card headers
- `CardFooter` - Footer section of cards

**Usage**: Used for dashboard overview cards, department cards, user cards, and form containers.

---

### 2. **Form Components**
- `Input` - Text input fields
- `Textarea` - Multi-line text input
- `Label` - Form field labels
- `Select` - Dropdown select component
  - `SelectTrigger` - Select button/trigger
  - `SelectValue` - Selected value display
  - `SelectContent` - Dropdown content container
  - `SelectItem` - Individual select option

**Usage**: Used in department creation/editing forms, user creation/editing forms, and password management.

---

### 3. **Button Components**
- `Button` - Primary button component

**Usage**: Used for actions like "Add Department", "Edit", "Delete", "Refresh Data", "Change Password", etc.

---

### 4. **Table Components**
- `Table` - Main table container
- `TableBody` - Table body wrapper
- `TableCell` - Individual table cell
- `TableHead` - Table header cell
- `TableHeader` - Table header row container
- `TableRow` - Table row container

**Usage**: Used for displaying users and departments in tabular format.

---

### 5. **Dialog Components**
- `Dialog` - Modal dialog container
- `DialogContent` - Dialog content wrapper
- `DialogDescription` - Dialog description text
- `DialogFooter` - Dialog footer section
- `DialogHeader` - Dialog header section
- `DialogTitle` - Dialog title text

**Usage**: Used for:
- Department creation/editing dialogs
- User creation/editing dialogs
- User view/details dialog
- Password change dialog

---

### 6. **Tabs Components**
- `Tabs` - Main tabs container
- `TabsContent` - Individual tab content
- `TabsList` - Tabs navigation list
- `TabsTrigger` - Individual tab trigger/button

**Usage**: Used to organize content into three tabs:
- Departments
- Users
- Passwords (Admin/Manager only)

---

### 7. **Badge Component**
- `Badge` - Status badge component

**Usage**: Used to display user roles (Admin, Manager, User) with color coding.

---

### 8. **Avatar Components**
- `Avatar` - User avatar container
- `AvatarFallback` - Fallback content when image unavailable
- `AvatarImage` - Avatar image element

**Usage**: Used to display user profile pictures in user lists and details.

---

### 9. **Dropdown Menu Components**
- `DropdownMenu` - Dropdown menu container
- `DropdownMenuContent` - Dropdown content wrapper
- `DropdownMenuItem` - Individual menu item
- `DropdownMenuTrigger` - Dropdown trigger button

**Usage**: Used for user action menus (Edit, Delete, View, Change Password).

---

## 🎯 Custom Components

### 1. **AdminChatbot**
- **Path**: `@/components/admin/admin-chatbot`
- **Type**: Custom admin chatbot component
- **Usage**: Displays AI chatbot for admin assistance

---

## 🎨 Icons (from `lucide-react`)

### Icon Components Used:
- `Building2` - Department icon
- `Users` - Users icon
- `Plus` - Add/create icon
- `Trash2` - Delete icon
- `RefreshCw` - Refresh/reload icon
- `Search` - Search icon
- `Edit` - Edit icon
- `UserPlus` - Add user icon
- `UserCog` - Manager/admin icon
- `KeyRound` - Password/key icon
- `Eye` - Show password icon
- `EyeOff` - Hide password icon

---

## 🔧 Hooks & Context

### 1. **useAuth**
- **Path**: `@/context/auth-context`
- **Usage**: Provides authentication state and user information
- **Properties Used**:
  - `token` - Authentication token
  - `user` - Current user object (aliased as `currentUser`)

### 2. **useToast**
- **Path**: `../hooks/use-toast`
- **Usage**: Displays toast notifications for success/error messages

---

## 📦 External Libraries

### 1. **React**
- `useState` - State management
- `useEffect` - Side effects and lifecycle

### 2. **Axios**
- HTTP client for API requests
- Configured with base URL from `API_URL`

---

## 🗂️ Component Structure

### Main Sections:

1. **Admin Chatbot**
   - `<AdminChatbot />` - Always visible at top

2. **Page Header**
   - Title: "Admin Dashboard"
   - Description: "Manage departments and users"
   - Refresh button

3. **Dashboard Overview Card**
   - Search input
   - Three KPI cards:
     - Total Departments
     - Total Users
     - Managers count

4. **Tabs Section**
   - **Departments Tab**:
     - Add Department form card
     - Manage Departments grid
   - **Users Tab**:
     - Add User form card
     - Users table/list
   - **Passwords Tab** (Admin/Manager only):
     - Password management interface

5. **Dialog Modals**:
   - Department creation/edit dialog
   - User creation/edit dialog
   - User view/details dialog
   - Password change dialog

---

## 📊 Data Management

### State Variables:
- `users` - Array of all users
- `departments` - Array of all departments
- `isLoading` - Loading state
- `searchTerm` - Search filter
- `newDepartment` - New department form data
- `newUser` - New user form data
- `editingDepartment` - Currently editing department
- `editingUser` - Currently editing user
- `viewingUser` - User being viewed
- `selectedUserForPassword` - User selected for password change
- Dialog visibility states

### API Endpoints Used:
- `GET /admin/users` - Fetch all users
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/departments` - Fetch all departments
- `POST /admin/departments` - Create new department
- `PUT /admin/departments/:id` - Update department
- `DELETE /admin/departments/:id` - Delete department

---

## 🎨 Styling & Design

### Design System:
- Uses Tailwind CSS classes
- Custom gradient classes: `gradient-primary`, `gradient-secondary`, `gradient-accent`
- Shadow effects: `shadow-xl`, `shadow-glow-primary`
- Hover effects: `hover:scale-105`, `hover:-translate-y-1`
- Transition animations: `transition-all duration-300`

### Color Scheme:
- Primary colors for departments
- Secondary colors for users
- Accent colors for managers
- Status badges with role-based colors

---

## 🔐 Access Control

### Role-Based Features:
- **Admin & Manager**: Full access to all features including password management
- **Other Roles**: Limited access (if applicable)

### Permission Checks:
- `isAdminOrManager` - Boolean check for admin/manager role
- Controls visibility of "Passwords" tab

---

## 📝 Form Fields

### Department Form:
- Name (required)
- Description
- Color (select from predefined options)
- Department Lead (optional, select from managers/admins)

### User Form:
- Name (required)
- Email (required)
- Password (required for new users)
- Role (select: Admin, Manager, User)
- Department (select from departments)

### Password Change Form:
- New Password (required, min 6 characters)
- Confirm Password (required, must match)

---

## 🎯 Key Features

1. **Department Management**:
   - Create, read, update, delete departments
   - Assign department leads
   - View department members count
   - Color-coded departments

2. **User Management**:
   - Create, read, update, delete users
   - Assign roles and departments
   - View user details
   - Search and filter users

3. **Password Management** (Admin/Manager only):
   - Change user passwords
   - Search users for password management
   - Password validation

4. **Dashboard Overview**:
   - Real-time statistics
   - KPI cards with animations
   - Search functionality

---

## 📁 File Location

**Path**: `client/src/pages/AdminDashboard.jsx`

**Total Lines**: ~1573 lines

---

## 🔄 Component Dependencies

```
AdminDashboard
├── AdminChatbot (custom)
├── Card Components (ui)
├── Form Components (ui)
├── Table Components (ui)
├── Dialog Components (ui)
├── Tabs Components (ui)
├── Badge Component (ui)
├── Avatar Components (ui)
├── Dropdown Menu (ui)
├── Icons (lucide-react)
├── useAuth (context)
└── useToast (hook)
```

---

## 📚 Related Files

### UI Components:
- `client/src/components/ui/card.jsx`
- `client/src/components/ui/input.jsx`
- `client/src/components/ui/button.jsx`
- `client/src/components/ui/textarea.jsx`
- `client/src/components/ui/table.jsx`
- `client/src/components/ui/badge.jsx`
- `client/src/components/ui/tabs.jsx`
- `client/src/components/ui/avatar.jsx`
- `client/src/components/ui/dropdown-menu.jsx`
- `client/src/components/ui/select.jsx`
- `client/src/components/ui/dialog.jsx`
- `client/src/components/ui/label.jsx`

### Custom Components:
- `client/src/components/admin/admin-chatbot.jsx`

### Context & Hooks:
- `client/src/context/auth-context.jsx`
- `client/src/hooks/use-toast.js`

### API:
- `client/src/lib/api.js` (for API_URL)

---

## 🎉 Summary

The Admin Dashboard uses **20+ UI components**, **1 custom component**, **12 icons**, **2 hooks/context**, and integrates with the backend API for full CRUD operations on users and departments.

**Total Component Count**: ~35+ components and elements

---

**Last Updated**: November 29, 2025
**Component File**: `client/src/pages/AdminDashboard.jsx`

