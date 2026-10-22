# DriveEasy Car Rental System
**ITUE301 Advanced Web Development Frameworks — Practical Exam Set E**

A full-stack self-drive car rental booking platform built from scratch to prevent double-bookings, manage fleet inventory, and provide authenticated booking management.

---

## 1. Project Overview

### Scenario
DriveEasy operates a small self-drive car rental fleet. Previously, bookings were conducted over manual phone calls, leading to scheduling collisions and double-bookings of the same vehicle. 

This platform eliminates scheduling conflicts by enforcing **server-side double-booking prevention**:
- Only vehicles with `available: true` can be reserved.
- Once a booking is created (`POST /api/v1/bookings`), the vehicle is immediately marked `available: false`.
- Any subsequent attempt to book an unavailable vehicle is rejected with HTTP `400 Bad Request` and `{ "success": false, "message": "Vehicle is not available" }`.
- Customers can log in, view the fleet, filter by vehicle category client-side, book cars, view their booking history, and cancel active reservations.
- Fleet Managers and Admins can access a lazy-loaded Admin Panel to monitor reservations, add new vehicles, and update booking statuses.

---

## 2. Technology Stack

- **Frontend:** React 18, React Router v6 (`react-router-dom`), JavaScript, Fetch API, CSS3
- **Backend:** Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), CORS, Dotenv
- **Database:** MongoDB, Mongoose ODM
- **Architecture:** Client-Server decoupled REST API with Bearer token authentication and global request logging

---

## 3. Project Directory Structure

```text
driveeasy/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx       # React Router navigation with active links
│   │   │   ├── VehicleCard.jsx      # Props: model, type, pricePerDay, available
│   │   │   └── ProtectedRoute.jsx   # Route guard redirecting to / if unauthenticated
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login & registration forms
│   │   │   ├── FleetPage.jsx        # Vehicle fleet, client-side filter, booking form
│   │   │   ├── MyBookingsPage.jsx   # Customer reservations with populate details
│   │   │   └── AdminPanel.jsx       # Lazy-loaded fleet & booking manager
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Provides customer and token via useContext
│   │   │
│   │   ├── App.jsx                  # React Router configuration & Suspense
│   │   ├── main.jsx                 # React root entry point
│   │   └── index.css                # Clean, responsive CSS styling
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── Customer.js              # Name, unique email, unique licenseNumber, phone
│   │   ├── Vehicle.js               # Model, type (enum), pricePerDay (min 0), available
│   │   └── Booking.js               # Ref Customer, ref Vehicle, dates, status (enum)
│   │
│   ├── middleware/
│   │   ├── requestLogger.js         # Applied globally: [METHOD] [PATH] [TIMESTAMP]
│   │   ├── authGuard.js             # Bearer JWT validator, attaches req.customer
│   │   └── errorHandler.js          # Last middleware, returns structured JSON
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # POST /login, POST /register
│   │   ├── vehicleRoutes.js         # GET / (public), POST / (admin)
│   │   └── bookingRoutes.js         # POST /, GET /my, GET /, PATCH /:id/status
│   │
│   ├── controllers/
│   │   ├── authController.js        # Customer login & JWT generation
│   │   ├── vehicleController.js     # Vehicle retrieval & creation
│   │   └── bookingController.js     # Double-booking checks, populate, status
│   │
│   ├── server.js                    # Express app bootstrap & MongoDB connection
│   ├── seed.js                      # Standalone database seed script
│   ├── testApi.js                   # Automated 6-point REST API test suite
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── README.md
├── .env.example
└── .gitignore
```

---

## 4. Setup & Installation Instructions

### Prerequisites
- **Node.js** (v18.x or v20.x+ recommended)
- **npm** (v9.x or v10.x+)
- **MongoDB** (Local MongoDB Community Server or MongoDB Atlas cluster URI)
  *Note: If no external MongoDB daemon is running, the backend seamlessly falls back to an embedded in-memory MongoDB engine (`mongodb-memory-server`) to ensure 100% reliability during viva examinations.*

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   Default `.env` contents:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/driveeasy
   JWT_SECRET=driveeasy_exam_secret_key_2026
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   Or:
   ```bash
   node server.js
   ```

The backend server will run at: `http://localhost:5000`  
Initial sample vehicles and a default test customer (`rahul@example.com` / `password123`) will be automatically seeded on first launch.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend will run at: `http://localhost:3000`

---

## 5. REST API Documentation

Base URL: `http://localhost:5000/api/v1`

| # | Endpoint | Method | Access | Description | Request Body / Params |
|---|----------|--------|--------|-------------|-----------------------|
| 1 | `/auth/login` | `POST` | Public | Authenticates customer & returns Bearer token | `{ "email": "rahul@example.com", "password": "password123" }` |
| 2 | `/vehicles` | `GET` | Public | Returns all vehicles in fleet | None |
| 3 | `/bookings` | `POST` | Protected (`authGuard`) | Creates a booking & prevents double-booking | `{ "vehicleId": "<id>", "pickupDate": "2026-11-01", "returnDate": "2026-11-05" }` |
| 4 | `/bookings/my` | `GET` | Protected (`authGuard`) | Returns current customer's bookings with `.populate()` | None (Requires `Authorization: Bearer <token>`) |
| 5 | `/bookings/:id/status` | `PATCH` | Protected (`authGuard`) | Updates status (`reserved`, `ongoing`, `completed`, `cancelled`) | `{ "status": "ongoing" }` |

---

## 6. Testing the API with Postman or Thunder Client

An automated test script (`backend/testApi.js`) is included. You can run:
```bash
cd backend
node testApi.js
```

### Manual Postman Testing Sequence:

#### 1. Customer Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "rahul@example.com",
    "password": "password123"
  }
  ```
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOi...",
    "customer": {
      "id": "...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com"
    }
  }
  ```
- Copy the `token` for the Authorization header.

#### 2. Get All Vehicles
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/vehicles`
- **Expected Response (200 OK):** List of all vehicles with `model`, `type`, `pricePerDay`, `available`.

#### 3. Create Booking (Success)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/bookings`
- **Header:** `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "vehicleId": "<COPIED_VEHICLE_ID>",
    "pickupDate": "2026-11-01",
    "returnDate": "2026-11-05"
  }
  ```
- **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "data": { ... }
  }
  ```

#### 4. Double-Booking Prevention (Must Reject with 400)
- Call the exact same `POST /api/v1/bookings` request again with the same `vehicleId`.
- **Expected Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Vehicle is not available"
  }
  ```

#### 5. View Customer Bookings
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/bookings/my`
- **Header:** `Authorization: Bearer <token>`
- **Expected Response (200 OK):** Returns only bookings belonging to Rahul Sharma, with customer (`name`, `email`) and vehicle (`model`, `type`) populated.

---

## 7. Viva-First Architecture & Explanation Guide

When answering viva questions, refer to these direct implementation points:

1. **How is double-booking prevented?**
   - In `backend/controllers/bookingController.js`:
     ```javascript
     const vehicle = await Vehicle.findById(vehicleId);
     if (vehicle.available !== true) {
       return res.status(400).json({ success: false, message: "Vehicle is not available" });
     }
     await Booking.create({ customerId: req.customer._id, vehicleId, ... });
     vehicle.available = false;
     await vehicle.save();
     ```
   - If `available` is false, HTTP 400 is returned immediately before any booking can be saved.

2. **How does Lazy Loading work for AdminPanel?**
   - In `frontend/src/App.jsx`:
     ```javascript
     const AdminPanel = lazy(() => import("./pages/AdminPanel"));
     // ...
     <Suspense fallback={<div className="suspense-loading">Loading Admin Panel...</div>}>
       <AdminPanel />
     </Suspense>
     ```
   - Vite splits `AdminPanel` into its own chunk (`AdminPanel-*.js`), which is only downloaded when navigating to `/admin`.

3. **How does the client-side type filter work?**
   - In `frontend/src/pages/FleetPage.jsx`:
     ```javascript
     const filteredVehicles = selectedType === "All"
       ? vehicles
       : vehicles.filter(v => v.type === selectedType);
     ```
   - Changing filters does NOT trigger any new network requests; it filters the existing array stored in React state.

4. **How is Authentication protected?**
   - **Frontend:** `ProtectedRoute.jsx` reads `token` from `AuthContext`. If missing, it navigates to `/`.
   - **Backend:** `authGuard.js` reads `Authorization: Bearer <token>`, verifies the JWT, and attaches the customer to `req.customer`. Invalid/missing tokens return HTTP 401.

5. **Why is `errorHandler.js` placed last?**
   - In Express, error-handling middleware requires four parameters: `(err, req, res, next)`. Express only passes errors to it if it is registered after all routes.

6. **How does `.populate()` work?**
   - In `backend/controllers/bookingController.js`:
     ```javascript
     Booking.find({ customerId: req.customer._id })
       .populate("customerId", "name email")
       .populate("vehicleId", "model type pricePerDay")
     ```
   - Mongoose replaces the foreign `ObjectId` references with the actual documents from the `Customer` and `Vehicle` collections.

---

## 8. PDF Report Checklist

Ensure your submitted PDF (`[RollNo]_SetE_Report.pdf`) contains:
- **Screenshot 1:** FleetPage displaying vehicle cards, model, type, price/day, and conditional buttons ("Book Now" vs "Not Available"), plus the category filter.
- **Screenshot 2:** Postman / Thunder Client displaying `POST /api/v1/bookings` returning `201 Created`.
- **Screenshot 3:** Postman / Thunder Client displaying duplicate booking returning `400 Bad Request` with `"Vehicle is not available"`.
- **Screenshot 4:** MongoDB database showing the saved `Booking` document with `customerId` and `vehicleId` references.
- **Screenshot 5:** `MyBookingsPage` showing populated booking records.
