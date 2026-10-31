# ISP Sales Management System with Chatbot - Project Walkthrough

The **ISP Sales Management System** has been fully implemented, verified, and packaged according to all specifications in [ISP-Project-Requirement.txt](file:///home/ashiq/work/isp-sales/ISP-Project-Requirement.txt).

---

## 1. System Overview & Technology Stack

| Layer | Technology | Version / Configuration |
|---|---|---|
| **Backend** | ASP.NET Core Web API | .NET 10.0.403 (`mcr.microsoft.com/dotnet/sdk:10.0-alpine`) |
| **Frontend** | Angular | Angular 22 standalone components + Signals |
| **Styling** | Tailwind CSS | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| **Database** | PostgreSQL | PostgreSQL 17 / 19 Alpine via Docker container |
| **DevOps** | Docker Compose | `docker-compose.yml` with healthchecks & persistent volumes |

---

## 2. Key Delivered Features

### 1. Customer Public Experience & Interactive Chatbot
- **Modern Landing Page**: High-impact broadband hero section, package cards with speed indicators (20 Mbps, 50 Mbps, 100 Mbps, 200 Mbps), and active fiber coverage badge showcase.
- **Floating Interactive Chatbot Assistant** (`app-chatbot`):
  - **Option 1: View Packages**: Renders rich interactive package cards with monthly pricing and speed tier badges directly in the chat window.
  - **Option 2: New Connection**: Guided conversational wizard:
    - Step 1: Select City (Dhaka, Chattogram, etc.).
    - Step 2: Select Area (Uttara, Ashulia, Savar, Mohammadpur, Agrabad, etc.).
    - *Coverage Fallback*: If area is unlisted, smoothly prompts for customer info and records it as a **Future Lead**.
    - Step 3: Collect customer name, phone, address, and selected package.
    - Step 4: Creates a new order with unique reference `#ORD-YYYYMMDD-XXXXXX` and status `PENDING`.
  - **Option 3: Talk to an Agent**: Collects customer name and phone number for immediate callback scheduling.

### 2. Admin Management Dashboard (`/admin`)
- **Real-Time KPIs**: Live counters for *Total Orders*, *Pending Orders*, *Completed Connections*, *Total Sales Agents*, *Future Expansion Leads*, and *Callback Requests*.
- **Package Management**: CRUD operations for package name, bandwidth (Mbps), monthly price (৳), description, and active status toggling.
- **Coverage Area Management**: City and coverage area management pre-seeded with Dhaka (*Uttara, Ashulia, Savar, Mohammadpur*) and Chattogram (*Colonelhat, Agrabad, Boropol*).
- **Sales Agent Management**: Create agent accounts with secure password hashing (`BCrypt`), manage team status.
- **Callback Requests & Future Leads**: Track and follow up on customer callbacks and analyze unserved geographic leads for future fiber deployments.

### 3. Sales Agent Operations Dashboard (`/agent`)
- **Connection Order Queue**: View detailed customer orders (name, phone, address, selected package, coverage zone).
- **Status Progression**: Transition orders seamlessly across valid states:
  - `PENDING` ➔ `CONFIRMED` ➔ `CONNECTED` (or `CANCELLED`).
- **Quick Status Filters**: One-click filtering between all, pending, confirmed, and completed installations.

### 4. Role-Based Security & JWT
- **Role separation**: Admin and Sales Agent roles enforced via JWT Bearer tokens and Angular Route Guards (`adminGuard`, `agentGuard`).
- **Pre-seeded Default Credentials**:
  - **Admin**: `admin` / `Admin@123` (`admin@ispsales.local`)
  - **Sales Agent**: `agent` / `Agent@123` (`agent@ispsales.local`)

---

## 3. End-to-End Verification Results

1. **Backend Compilation & Testing**:
   - `dotnet build` completed with **0 Errors, 0 Warnings**.
   - Database automatically migrated and seeded with initial cities, packages, and admin/agent accounts.
2. **Frontend Compilation**:
   - Angular 22 + Tailwind CSS 4 build succeeded (`ng build`).
3. **Integration Flows Verified via Automated API Tests**:
   - **Chatbot Order Creation**: Verified customer order creation (`ORD-20261031-59CC2D`) with initial status `PENDING`.
   - **Future Lead Creation**: Tested unlisted area lead capture (`Keraniganj`).
   - **Callback Request**: Tested customer phone callback submission (`01900112233`).
   - **Agent Status Lifecycle**: Transitioned order from `PENDING` ➔ `CONFIRMED` ➔ `CONNECTED`.
   - **Admin KPI Aggregation**: Validated dynamic KPI response reflecting updated counts.
4. **Docker Container Configuration**:
   - `docker-compose.yml` validated and configured for database, backend API, and frontend Nginx container.

---

## 4. How to Run Locally

### Option A: Local Development (Fast Reload)
1. **Database**:
   ```bash
   docker compose up -d db
   ```
2. **Backend**:
   ```bash
   cd backend/IspSales.Api
   dotnet run --urls "http://localhost:5000"
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm start
   # Open browser at http://localhost:4200
   ```

### Option B: Complete Containerized Stack
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:4200`
- Backend API & Swagger: `http://localhost:5000/swagger`
- Database: `localhost:5432`
