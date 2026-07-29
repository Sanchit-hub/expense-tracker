# Role-Based Expense Tracker

A simple full-stack expense tracker built with Node.js, Express, MongoDB, EJS, and session-based authentication.

## Features

- Login-only authentication with predefined users
- Two roles: `admin` and `viewer`
- Admin can add, edit, and delete expenses
- Viewer can only view expenses in read-only mode
- Expense filtering by category and date range
- Dashboard with total expenses, category totals, and recent transactions

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- EJS + vanilla JavaScript
- `express-session` for session authentication
- `bcrypt` for password hashing

## Project Structure

```text
config/
middleware/
models/
public/
routes/
scripts/
views/
server.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file using `.env.example`.

3. Start MongoDB locally and make sure `MONGODB_URI` is correct.

4. Seed the predefined users:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`

## Demo Users

- Admin: `admin@college.edu` / `admin123`
- Viewer: `viewer@college.edu` / `viewer123`

## API Routes

### Auth

- `POST /login`
- `POST /logout`

### Expenses

- `GET /expenses`
- `POST /expenses` - admin only
- `PUT /expenses/:id` - admin only
- `DELETE /expenses/:id` - admin only

## Notes

- This project uses the default in-memory session store from `express-session`, which is fine for a college project but not for production.
- Signup is intentionally not included because users are predefined in the database.
