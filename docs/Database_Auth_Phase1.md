# Phase 1: Database & Authentication (Technical Spec)

This document outlines the exact architecture we will build for Phase 1 to give Lussovi a persistent backend.

## 1. MongoDB Connection Setup
Currently, the frontends use mock data. We will wire the existing `server.js` to a local MongoDB instance (`mongodb://localhost:27017/lussovi`).
*   Ensure Mongoose is properly configured.
*   Setup robust error handling for database connection drops.

## 2. The User Schema (`server/models/User.js`)
We will create a powerful User Schema that supports both standard e-commerce and our new Metaverse pivot.

**Key Fields Required:**
*   `name`, `email`, `password` (Hashed using bcrypt).
*   `role`: Enum (`CUSTOMER`, `DESIGNER`, `ADMIN`).
*   `addresses`: Array of shipping/pickup addresses (crucial for Shiprocket).
*   **Metaverse Fields:**
    *   `walletBalance`: Number (Lussovi Credits for the digital economy).
    *   `vipTier`: Enum (`NONE`, `SOLAR`, `GALAXY`) for exclusive animations.
    *   `digitalInventory`: Array of ObjectIds (Virtual clothing/assets they own).
    *   `friends`: Array of User ObjectIds (Social Graph).

## 3. The Authentication API (`server/routes/authRoutes.js`)
We will build secure REST endpoints for the Mobile App and Admin Panel to connect to.

### Endpoints to Build:
*   **`POST /api/auth/register`**: 
    *   Accepts email/password.
    *   Hashes password with `bcryptjs`.
    *   Creates User in MongoDB.
    *   Returns a JWT Token.
*   **`POST /api/auth/login`**:
    *   Verifies email/password.
    *   Returns a JWT Token and User Profile.
*   **`GET /api/auth/me`**:
    *   Protected route. Validates JWT token from headers.
    *   Returns the current user's profile (used to keep users logged in when they refresh the app).

## 4. Next Steps (For Tomorrow)
1. Write the `User.js` model file.
2. Write the controller logic in `authController.js`.
3. Test the endpoints using Postman or a quick test script to ensure JWT tokens are generating correctly.
4. Wire the React Native Mobile App login screen to hit `POST /api/auth/login`.
