# TaskFlow — Interactive Task Management & User Approval Platform

A modern, full-stack MERN application for task management with role-based user registration approval workflows and real-time private messaging.

## 🚀 Features

- **User Registration & Approval Pipeline**: New accounts start in `pending` status and must be reviewed and approved by the Admin before accessing dashboards.
- **Interactive Waiting Screen**: Creative pending page with progress indicators and real-time Socket.IO status transitions.
- **Admin Dashboard**: Comprehensive statistics, user filtering/search, approval/rejection actions with reason feedback.
- **Task Management**: Create, assign, edit, and track tasks with priorities (Low, Medium, High) and deadlines.
- **Private Messaging**: One-on-one communication channel between Admin and users via Socket.IO.
- **Real-time Notifications**: Instant alerts for registrations, approvals, task assignments, and new messages.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Redux Toolkit, TanStack Query, Socket.IO Client, Lucide Icons, React Hot Toast
- **Backend**: Node.js, Express.js, Socket.IO, Mongoose, JWT, bcryptjs, Helmet, Express Validator
- **Database**: MongoDB

## 🏁 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
*Runs on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

### 4. Default Admin Credentials
- **Email**: `admin@taskplatform.com`
- **Password**: `Admin@123456`
