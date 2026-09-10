# Sisenco Digital

## 1. Install dependencies

Install dependencies for both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

Create `frontend/.env`:

```env
VITE_BASE_URL="http://localhost:3000"
```

Replace the PostgreSQL connection values with your local database credentials.

## 2. Run the frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend is available at <http://localhost:5173>.

## 3. Run the backend

From the `backend` directory:

```bash
npm run dev
```

The API is available at <http://localhost:3000>.

## 4. Run the database

Make sure PostgreSQL is running and the database named in `DATABASE_URL` exists. Then, from the `backend` directory, apply the Prisma migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Run the frontend and backend in separate terminals after the database is ready.
