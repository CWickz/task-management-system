# TaskMaster Workspace Pro ⚡

A modern, high-performance sprint task management application built with React, Node.js, Express, and MongoDB.

### 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS + React Icons
- **Backend**: Node.js + Express (RESTful Architecture)
- **Database**: MongoDB (via Mongoose ODM)
- **HTTP Client**: Axios (Full CRUD Integration)
- **Persistence**: LocalStorage Engine (Client Profile & Preference Cache)

### ⚡ Key Features

- **Linear Task Architecture**: Modern card feed showcasing prioritized color tags, due-date badges, and automated creation dates.
- **One-Click Lifecycle Management**: Instant status toggling across `Pending`, `In Progress`, and `Completed` with dynamic sprint progress bars.
- **Sprint Schedule & Timeline**: Integrated interactive calendar overview featuring timeline dates and day-level task indicators.
- **Protected Bulk Operations**: One-click bulk completion deletion (`DELETE /api/tasks/completed`) guarded by interactive modal dialogs.
- **Full Data Portability**: Instant one-click JSON backup export engine directly pulling live database items.
- **Dual-Layer Validation**: Strict Mongoose schema constraints, input sanitization, and graceful UI error alert handling.

### 🚀 How to Run (Development)

If you want to build or modify the project from source:

1. `npm install`
2. Start Backend: `cd backend && npm run dev`
3. Start Frontend: `cd frontend && npm run dev`
4. Build for Production: `npm run build`
