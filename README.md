# LedgerPay

## Overview

LedgerPay is a full-stack digital banking application that lets users register, manage a personal account, and perform core money operations—deposits, withdrawals, and peer-to-peer transfers. An admin role can monitor all accounts and transactions and freeze or unfreeze customer accounts.

The project is split into a Spring Boot REST API backed by PostgreSQL and a React single-page application that communicates over HTTP with JWT-based authentication.

## Features

Verified capabilities from the current codebase:

- **User registration and login** — Register with full name, email, and password; log in to receive a JWT and user profile data.
- **JWT authentication** — Stateless auth with Bearer tokens (1-hour expiration); tokens include email and role claims.
- **BCrypt password hashing** — Passwords are encoded with Spring Security's `BCryptPasswordEncoder` before storage.
- **USER / ADMIN role-based authorization** — New registrations receive the `USER` role; admin-only endpoints require the `ADMIN` authority.
- **Account management** — Each user gets one bank account on registration with a generated account number, UPI ID, zero balance, and `ACTIVE` status.
- **Account number and UPI ID** — 12-digit account numbers and UPI IDs in the form `{normalizedname}{4digits}@ledgerpay` are generated automatically.
- **Deposit** — Add funds to the authenticated user's account; recorded as a `DEPOSIT` transaction.
- **Withdrawal** — Remove funds with an insufficient-balance check; recorded as a `WITHDRAWAL` transaction.
- **Transfer** — Send money to another account by account number **or** UPI ID (exactly one recipient identifier required).
- **Transaction history** — View transactions where the user's account is sender or receiver, ordered by date descending.
- **Account freeze / unfreeze** — Admins can set account status to `FROZEN` or back to `ACTIVE`; frozen accounts cannot deposit, withdraw, or transfer.
- **Admin account management** — List all accounts with owner details, balance, and status; freeze or unfreeze from the admin dashboard.
- **Admin transaction monitoring** — View all system transactions across accounts.
- **Protected frontend routes** — Dashboard, My Account, Transfer, and Transactions require a stored JWT.
- **Admin-only frontend route** — `/admin` checks the JWT `role` claim and redirects non-admins to the dashboard.
- **Responsive banking dashboard** — Layout and components include CSS media queries for tablet and mobile viewports.

> **Note:** The registration form collects a phone number on the frontend, but the backend `RegisterRequest` does not persist it. Admin users are not created through the API; the `ADMIN` role must be assigned directly in the database.

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Java 21 | Runtime |
| Spring Boot 4.1 | Application framework |
| Spring Web MVC | REST controllers |
| Spring Data JPA / Hibernate | ORM and persistence |
| Spring Security | Authentication and authorization |
| Spring Validation | Request DTO validation |
| JJWT 0.13 | JWT generation and verification |
| Lombok | Boilerplate reduction |
| Maven | Build tool |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 8 | Dev server and build tool |
| React Router 7 | Client-side routing |
| Axios | HTTP client with JWT interceptor |
| Oxlint | Linting |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational data store |

## System Architecture

```
React frontend (localhost:5173)
        │
        │  Axios REST calls + Authorization: Bearer <token>
        ▼
Spring Boot controllers  (/api/*)
        │
        ▼
Service layer  (business logic, @Transactional)
        │
        ▼
Repository layer  (Spring Data JPA)
        │
        ▼
PostgreSQL  (ledgerpay database)
```

### Authentication flow

1. The client sends credentials to `POST /api/auth/login`.
2. The backend validates the email and BCrypt-hashed password, then issues a signed JWT containing the user's email (subject) and role.
3. The frontend stores the token in `localStorage` and attaches it to subsequent requests via an Axios request interceptor.
4. `JwtAuthenticationFilter` reads the `Authorization` header, validates the token, loads the user from the database, and sets the Spring Security context.
5. Protected endpoints require a valid token; admin endpoints additionally require the `ADMIN` authority.

## Backend Architecture

Package root: `com.ledgerpay`

| Layer | Responsibility | Key classes |
|---|---|---|
| **Controller** | HTTP mapping, request validation, response codes | `AuthController`, `AccountController`, `TransactionController`, `AdminController` |
| **Service** | Business rules and transactions | `UserServiceImpl`, `AuthServiceImpl`, `AccountServiceImpl`, `TransactionServiceImpl`, `AdminServiceImpl` |
| **Repository** | Database access | `UserRepository`, `AccountRepository`, `TransactionRepository` |
| **Entity** | JPA-mapped domain models | `User`, `Account`, `Transaction` |
| **DTO** | API request/response shapes | `RegisterRequest`, `LoginRequest`, `DepositRequest`, `WithdrawRequest`, `TransferRequest`, `AccountResponse`, `TransactionResponse`, `AdminAccountResponse` |
| **Security** | JWT filter, CORS, route authorization | `SecurityConfig`, `JwtAuthenticationFilter`, `JwtUtil` |
| **Exception handling** | Consistent error responses | `GlobalExceptionHandler`, custom exceptions (`AccountNotFoundException`, `InsufficientBalanceException`, etc.) |

Supporting packages: `config`, `util` (`AccountUtil`, `JwtUtil`), `exception`.

## Database Design

Hibernate manages the schema (`spring.jpa.hibernate.ddl-auto=update`).

### User (`users`)

| Field | Type | Constraints |
|---|---|---|
| `id` | `Long` | Primary key, auto-generated |
| `fullname` | `String` | Not null |
| `email` | `String` | Not null, unique |
| `password` | `String` | Not null (BCrypt hash) |
| `role` | `Role` enum | Not null — `USER` or `ADMIN` |
| `createdAt` | `LocalDateTime` | Not null, set on insert |
| `updatedAt` | `LocalDateTime` | Not null, updated on save |

### Account (`accounts`)

| Field | Type | Constraints |
|---|---|---|
| `id` | `Long` | Primary key, auto-generated |
| `accountNumber` | `String` | Not null, unique |
| `upiId` | `String` | Not null, unique |
| `balance` | `BigDecimal` | Not null |
| `status` | `AccountStatus` enum | Not null — `ACTIVE`, `FROZEN`, or `CLOSED` |
| `user` | `User` | Not null; stored as `user_id` foreign key |

### Transaction (`transactions`)

| Field | Type | Constraints |
|---|---|---|
| `id` | `Long` | Primary key, auto-generated |
| `sender` | `Account` | Not null; stored as `sender_account_id` foreign key |
| `receiver` | `Account` | Not null; stored as `receiver_account_id` foreign key |
| `amount` | `BigDecimal` | Not null |
| `type` | `TransactionType` enum | Not null — `DEPOSIT`, `WITHDRAWAL`, or `TRANSFER` |
| `status` | `TransactionStatus` enum | Not null — `SUCCESS` or `FAILED` |
| `createdAt` | `LocalDateTime` | Not null, set on insert |

### Relationships

- **User ↔ Account (one-to-one):** Each user has one account, created at registration with values generated by `AccountUtil`. `Account` owns the relationship via `@JoinColumn(name = "user_id")`; `User.account` is mapped with `@OneToOne(mappedBy = "user")`.
- **Account ↔ Transaction (many-to-one):** Each transaction links to a sender and a receiver account. For `DEPOSIT` and `WITHDRAWAL`, both references point to the same account.

## Authentication & Authorization

### Login

`POST /api/auth/login` accepts email and password. On success, returns a JWT plus user metadata (`id`, `fullName`, `email`, `createdAt`).

### JWT generation

`JwtUtil.generateToken()` builds an HMAC-SHA signed token with:
- Subject: user email
- Claim: `role` (`USER` or `ADMIN`)
- Expiration: configurable via `jwt.expiration-ms` (default 3,600,000 ms / 1 hour)

### JWT validation

`JwtAuthenticationFilter` extracts the Bearer token, verifies signature and expiration, loads the user by email, and populates `SecurityContextHolder` with the user principal and role authority.

### Password hashing

Registration encodes passwords with `BCryptPasswordEncoder`. Login uses `passwordEncoder.matches()`.

Password rules (backend validation): 8–64 characters, at least one uppercase letter, lowercase letter, digit, and special character (`@#$%^&+=!`).

### USER vs ADMIN authorization

| Access | USER | ADMIN |
|---|---|---|
| Register / Login | Yes | Yes |
| Account & transaction endpoints | Yes | Yes |
| Freeze / Unfreeze accounts | No | Yes |
| Admin list endpoints | No | Yes |

Spring Security enforces this via `hasAuthority("ADMIN")` on `/api/admin/**` and freeze/unfreeze routes.

### Protected routes (frontend)

- `ProtectedRoute` — redirects to `/login` if no token is in `localStorage`.
- `AdminRoute` — decodes the JWT payload and checks `role === 'ADMIN'`; non-admins are redirected to `/dashboard`.

## Banking Operations

### Deposit

1. Authenticated user submits an amount ≥ 0.01.
2. The service acquires a pessimistic write lock on the user's account row.
3. If status is `ACTIVE`, the balance is increased and a `DEPOSIT` transaction is saved (sender and receiver both set to the same account).

### Withdrawal

Same locking and status checks as deposit. The service verifies sufficient balance, subtracts the amount, and records a `WITHDRAWAL` transaction.

### Transfer

1. Sender account is locked with pessimistic write.
2. Recipient is resolved by account number **or** UPI ID (exactly one must be provided).
3. Recipient account is also locked with pessimistic write.
4. Validates both accounts are `ACTIVE`, not the same account, amount > 0, and sender has sufficient balance.
5. Debits sender, credits receiver, and saves a `TRANSFER` transaction.

### Freeze / Unfreeze

Admin-only operations on `/api/account/{accountNumber}/freeze` and `/unfreeze`. Freeze sets status to `FROZEN`; unfreeze restores `ACTIVE`. Accounts already in the target state or marked `CLOSED` are rejected.

### Concurrency control

Balance-changing operations (`deposit`, `withdraw`, `transfer`) run inside `@Transactional` service methods. `AccountRepository` exposes `findByUserIdForUpdate`, `findByAccountNumberForUpdate`, and `findByUpiIdForUpdate` with `@Lock(LockModeType.PESSIMISTIC_WRITE)` to prevent concurrent balance updates on the same account row.

## API Endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user and create an account | Public |
| POST | `/api/auth/login` | Authenticate and receive a JWT | Public |
| GET | `/api/account` | Get the authenticated user's account details | Authenticated |
| POST | `/api/account/deposit` | Deposit funds | Authenticated |
| POST | `/api/account/withdraw` | Withdraw funds | Authenticated |
| POST | `/api/account/{accountNumber}/freeze` | Freeze an account | Admin |
| POST | `/api/account/{accountNumber}/unfreeze` | Unfreeze an account | Admin |
| POST | `/api/transactions/transfer` | Transfer to another account | Authenticated |
| GET | `/api/transactions` | List the user's transactions | Authenticated |
| GET | `/api/admin/accounts` | List all accounts with owner info | Admin |
| GET | `/api/admin/transactions` | List all system transactions | Admin |
| GET | `/api/test` | Auth smoke-test endpoint | Authenticated |

Base URL: `http://localhost:8080`

## Frontend

The React app lives in `ledgerpay-frontend/` and talks to the backend at `http://localhost:8080` (configured in `src/services/api.js`).

### Pages

| Route | Component | Backend calls |
|---|---|---|
| `/login` | `Login` | `POST /api/auth/login` |
| `/register` | `Register` | `POST /api/auth/register` |
| `/dashboard` | `Dashboard` | `GET /api/account`, `GET /api/transactions`, deposit/withdraw modals |
| `/my-account` | `MyAccount` | `GET /api/account` |
| `/transfer` | `Transfer` | `GET /api/account`, `POST /api/transactions/transfer` |
| `/transactions` | `Transactions` | `GET /api/transactions` |
| `/admin` | `Admin` | `GET /api/admin/accounts`, `GET /api/admin/transactions`, freeze/unfreeze |

### Shared components

- **AppLayout** — Sidebar navigation, mobile menu, logout, conditional admin link.
- **ProtectedRoute / AdminRoute** — Route guards.
- **TransactionTable** — Reusable transaction list with optional party columns.
- **StatusBadge** — Account status display.
- **Modal** — Deposit and withdrawal dialogs on the dashboard.

Auth helpers in `src/utils/auth.js` handle JWT decoding, admin role checks, and token storage. Formatting utilities live in `src/utils/format.js`.

## Project Structure

```
ledgerpay/
├── pom.xml                          # Maven / Spring Boot config
├── mvnw, mvnw.cmd                   # Maven wrapper
├── src/
│   ├── main/
│   │   ├── java/com/ledgerpay/
│   │   │   ├── LedgerpayApplication.java
│   │   │   ├── config/              # SecurityConfig
│   │   │   ├── controller/          # REST controllers
│   │   │   ├── dto/                 # Request/response DTOs
│   │   │   ├── entity/              # JPA entities and enums
│   │   │   ├── exception/           # Custom exceptions + handler
│   │   │   ├── repository/          # Spring Data repositories
│   │   │   ├── security/            # JWT filter
│   │   │   ├── service/             # Business logic
│   │   │   └── util/                # JwtUtil, AccountUtil
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── ledgerpay-frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                  # Router setup
        ├── main.jsx
        ├── components/              # Layout, guards, UI primitives
        ├── pages/                   # Route-level views
        ├── services/api.js          # Axios instance
        ├── styles/                  # layout.css, components.css
        └── utils/                   # auth.js, format.js
```

## Getting Started

### 1. Requirements

- Java 21
- Maven (or use the included `./mvnw` wrapper)
- PostgreSQL
- Node.js and npm (for the frontend)

### 2. PostgreSQL setup

Create a database named `ledgerpay`:

```sql
CREATE DATABASE ledgerpay;
```

Ensure PostgreSQL is running on `localhost:5432`.

### 3. Backend configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ledgerpay
spring.datasource.username=<your-postgres-username>
spring.datasource.password=<your-postgres-password>
jwt.secret=<your-base64-jwt-secret>
jwt.expiration-ms=3600000
```

Provide your PostgreSQL credentials and a Base64-encoded `jwt.secret` for token signing (`JwtUtil` decodes this value at runtime).

**Creating an admin user:** Register through the app, then run:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

### 4. Backend startup

From the project root:

```bash
./mvnw spring-boot:run
```

The API starts on **http://localhost:8080**.

### 5. Frontend installation

```bash
cd ledgerpay-frontend
npm install
```

### 6. Frontend startup

```bash
npm run dev
```

The app runs on **http://localhost:5173** (Vite default). CORS is configured in `SecurityConfig` to allow this origin.

## Screenshots

Add screenshots here when available:

| Screen | Placeholder |
|---|---|
| Dashboard | `![Dashboard](docs/screenshots/dashboard.png)` |
| Login | `![Login](docs/screenshots/login.png)` |
| My Account | `![My Account](docs/screenshots/my-account.png)` |
| Transfer | `![Transfer](docs/screenshots/transfer.png)` |
| Transactions | `![Transactions](docs/screenshots/transactions.png)` |
| Admin Dashboard | `![Admin Dashboard](docs/screenshots/admin.png)` |

## Future Improvements

Possible enhancements—not currently implemented:

- Persist phone number (or remove the unused frontend field)
- Admin user management API and seed data
- Account closure workflow for the `CLOSED` status
- Failed transaction handling and retry logic
- Refresh tokens and token revocation
- Integration tests for banking operations under concurrency
- Environment-based configuration (e.g., externalized secrets via profiles)

## Author

See repository commit history for contributor information.
