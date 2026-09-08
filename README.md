# OrderFlow — Frontend

> A modern operations dashboard for managing orders, customers, employees, and business workflows.
--------------------------
Admin Dashboard

<img width="1915" height="902" alt="Screenshot 2026-09-08 210732" src="https://github.com/user-attachments/assets/d8a80f07-b7fa-4cd6-b7df-d2d15c460525" />

-------------------------------------------

Staff Portal

<img width="1917" height="905" alt="Screenshot 2026-09-08 210623" src="https://github.com/user-attachments/assets/f216436f-66bb-4dd0-80ea-1550430111a6" />

-------------------------------------------------


**OrderFlow** is a full-stack order management platform designed around real-world business operations. This repository contains the React frontend, providing the interface for authentication, order management, customer management, employee administration, analytics, and real-time operational updates.

### 🔗 Project Links

* **Live Application:** https://order-flow-frontend-omega.vercel.app/
* **Backend Repository:** https://github.com/poochix/OrderFlow-backend
* **Frontend Repository:** https://github.com/poochix/orderFlow-frontend

-------------------------------------------------------
 
 LOGIN DETAILS
 
Admin email    : admin@orderflow.com
Admin password : AdminPassword123! 

Staff email    : test@email.com
Staff password : 123456

--------------------------------------------------------

## ✨ Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Protected application routes
* Role-based access control
* Admin, Manager, and Staff workflows
* Persistent authentication state
* Secure API communication

### 📦 Order Management

* Create and manage orders
* Track order status throughout its lifecycle
* Assign employees to orders
* View detailed order information
* Filter and search operational data
* Real-time order updates

### 👥 Customer Management

* Customer records
* Customer details and contact information
* Customer-related order information
* Search and filtering

### 👨‍💼 Employee Management

* Employee administration
* Role-based permissions
* Employee assignment
* User management for authorized roles

### 📊 Analytics & Dashboard

* Operational dashboard
* Order statistics
* Business analytics
* Data visualization
* Performance-oriented views

### ⚡ Real-Time Updates

OrderFlow uses **Socket.IO** to provide real-time updates between the backend and frontend.

This allows important operational changes to be reflected without requiring users to manually refresh the application.

### 📝 Audit & Operational Visibility

Important business operations can be tracked through the backend audit system, giving the application a foundation for accountability and operational history.

---

## 🛠️ Tech Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| React            | User interface                |
| TypeScript       | Type safety                   |
| Vite             | Development and build tooling |
| Redux Toolkit    | Global state management       |
| React Router     | Application routing           |
| React Hook Form  | Form management               |
| Zod              | Runtime validation            |
| Axios            | HTTP communication            |
| Socket.IO Client | Real-time communication       |
| Tailwind CSS     | Styling                       |
| shadcn/ui        | UI components                 |
| Recharts         | Data visualization            |

---

## 🏗️ Frontend Architecture

The frontend follows a feature-oriented React architecture.

```text
src/
├── components/      # Reusable UI components
├── features/        # Feature-specific application logic
├── hooks/           # Reusable React hooks
├── layouts/         # Application layouts
├── lib/             # Shared utilities and configuration
├── store/            # Redux state management
└── ...
```

The application separates reusable UI, feature-specific logic, application state, layouts, and shared utilities to keep the codebase maintainable as the application grows.

---

## 🔄 Application Flow

```text
                    React Application
                           │
                           ▼
                    React Router
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
          Protected Routes       Public Routes
                 │
                 ▼
           Redux Store
                 │
          ┌──────┴──────┐
          ▼             ▼
       Axios        Socket.IO
          │             │
          └──────┬──────┘
                 ▼
            Express API
                 │
                 ▼
              MongoDB
```

---

## 🔐 Authentication Flow

```text
User
 │
 ▼
Login Form
 │
 ▼
Authentication API
 │
 ▼
Backend verifies credentials
 │
 ▼
JWT issued
 │
 ▼
Authenticated session
 │
 ▼
Protected frontend routes
 │
 ▼
Role-based UI / API access
```

Authorization is enforced on the backend as the source of truth, while the frontend uses the authenticated user's role to provide the appropriate application experience.

---

## ⚡ Real-Time Architecture

OrderFlow uses Socket.IO for real-time communication.

```text
Order / Business Event
          │
          ▼
     Backend Server
          │
          ▼
       Socket.IO
          │
          ▼
    Connected Clients
          │
          ▼
     UI State Update
```

This allows operational changes to propagate to connected users without requiring a full page refresh.

---

## 📸 Application Preview

> Screenshots will be added here to showcase the major application workflows.

Recommended screenshots:

1. Login
2. Main dashboard
3. Orders table
4. Order details
5. Customer management
6. Employee management
7. Analytics
8. Admin/user management

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/poochix/orderFlow-frontend.git

cd orderFlow-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on the project's environment configuration.

```env
VITE_API_URL=your_backend_api_url
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local development URL shown by Vite.

---

## 🏭 Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🔗 Related Repository

The backend is maintained separately:

**OrderFlow Backend**

https://github.com/poochix/OrderFlow-backend

The backend provides:

* REST APIs
* Authentication
* Authorization
* Database access
* Business logic
* Validation
* Audit logging
* Real-time Socket.IO communication

---

## 🎯 Engineering Focus

OrderFlow was built with a focus on:

* Maintainable architecture
* Strong typing
* Reusable components
* Secure authentication
* Role-based authorization
* Clear separation of concerns
* Real-time communication
* Scalable state management
* Production-oriented development practices

---

## 📌 Project Status

OrderFlow is an actively developed full-stack application.

Future improvements may include additional operational workflows, deeper analytics, expanded automated testing, and further production infrastructure.

---

## 👨‍💻 Author

**Hritik Dubey**

Full-Stack Developer

---

## 📄 License

This project is intended as a portfolio and learning project.
