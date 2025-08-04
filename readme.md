# Car Wash Management System

A full-stack application for managing car wash operations with vehicle entry, queue management, and receipt generation.

## Setup Instructions

### Backend Setup
1. Navigate to the backend folder
2. Run `npm install`
3. Create a `.env` file with your MongoDB Atlas connection string
4. Run `npm start` or `npm run dev` for development

### Frontend Setup
The frontend is served statically by the Express server. Just open http://localhost:3000 in your browser.

## Features
- Vehicle entry form with automatic token generation
- Lane assignment and pricing calculation
- Real-time queue display
- Mark wash as completed
- Receipt generation
- Filter by status (All/Pending/Completed)

## API Endpoints
- POST /api/wash - Add new vehicle
- GET /api/wash - Get all vehicles (with optional status filter)
- PATCH /api/wash/:id/complete - Mark wash as completed
- GET /api/wash/:id/receipt - Get receipt for completed wash