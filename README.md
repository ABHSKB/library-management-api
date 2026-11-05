# Library Management API

A RESTful Library Management API built with **Node.js, Express.js, and MySQL**. This project provides a backend system for managing library books, users, borrowing operations, audit logs, and library settings.

It includes authentication, role-based authorization, secure password hashing, JWT-based access control, and transaction-safe database operations.

## Features

### 1. Authentication and Authorization
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Token expiration.
- Protected API routes.
- Role-based authorization.
- User account status management (active/disabled).
- Users can register as members; privileged roles are assigned separately.

### 2. Book Management
- Retrieve all books.
- Retrieve a book by ID.
- Add new books.
- Update existing books.
- Delete books.
- ISBN uniqueness validation.
- Book copy availability management.

### 3. Borrowing Management
- Borrow books.
- Return borrowed books.
- Retrieve personal borrowing history.
- Retrieve borrowing details by ID.
- Retrieve all borrowing records for authorized staff.
- Prevent duplicate active borrowing of the same book.
- Prevent borrowing unavailable books.
- Enforce maximum active borrowing limits.
- Automatically calculate due dates using library settings.
- Transaction-safe borrowing and returning operations.

### 4. Audit Logs
- Record important library operations.
- Retrieve all audit logs.
- Retrieve audit logs for a specific user.
- Track actions and affected entities.

### 5. Library Settings
- Retrieve library settings.
- Update maximum active borrowings.
- Update default loan duration.

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MySQL / MariaDB | Relational database |
| mysql2 | Database connection and queries |
| bcrypt | Password hashing |
| jsonwebtoken | Authentication |
| dotenv | Environment variable management |
| Thunder Client | API testing |
| Git and GitHub | Version control |

## Project Structure

```text
library-management-api/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   ├── borrowingController.js
│   ├── auditLogController.js
│   └── settingsController.js
│
├── database/
│   └── schema.sql
│
├── middleware/
│   ├── authenticate.js
│   └── authorize.js
│
├── models/
│   ├── userModel.js
│   ├── bookModel.js
│   ├── borrowingModel.js
│   ├── auditLogModel.js
│   └── settingsModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── borrowingRoutes.js
│   ├── auditLogRoutes.js
│   └── settingsRoutes.js
│
├── .env.example
├── .gitignore
├── app.js
├── server.js
├── package.json
└── README.md
```

## Requirements

Before running this project, install:

- Node.js (18 or later)
- npm
- MySQL or MariaDB
- XAMPP (optional, for running MySQL locally)
- Thunder Client or another API testing tool

## Installation and Setup

### 1. Clone the Repository

```bash
https://github.com/ABHSKB/library-management-api.git
```

Navigate into the project directory:

```bash
cd library-management-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as your template:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_management_db

JWT_SECRET=your_own_random_secret
```

Replace the placeholder values with your local database credentials and a strong, randomly generated JWT secret.

**Important:** Never upload your actual `.env` file or expose your JWT secret.

### 4. Set Up the Database

Start your MySQL server using XAMPP or another MySQL service.

Open the following SQL file:

```text
database/schema.sql
```

Execute the SQL script.

The script creates the database:

```text
library_management_db
```

It also creates the following tables:

- `users`
- `books`
- `borrowings`
- `audit_logs`
- `library_settings`

It defines the necessary primary keys, foreign keys, constraints, and indexes.

The initial library settings are:

| Setting | Default value |
|---|---:|
| Maximum active borrowings | 3 |
| Default loan duration | 14 days |

### 5. Start the Server

For normal execution:

```bash
npm start
```

For development with automatic server restarts:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

## API Documentation

Base URL:

```text
http://localhost:3000/api
```

### 1. Authentication Routes

Base path: `/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new member |
| POST | `/login` | Log in |
| GET | `/me` | Retrieve authenticated user information |

**Registration example:**

```json
{
  "name": "Hana",
  "email": "hana@example.com",
  "password": "password123"
}
```

**Login example:**

```json
{
  "email": "hana@example.com",
  "password": "password123"
}
```

### 2. Book Routes

Base path: `/books`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Retrieve all books |
| GET | `/:id` | Retrieve a book by ID |
| POST | `/` | Add a new book |
| PUT | `/:id` | Update a book |
| DELETE | `/:id` | Delete a book |

**Example book:**

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Programming",
  "total_copies": 5
}
```

### 3. Borrowing Routes

Base path: `/borrowings`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Borrow a book |
| GET | `/me` | Retrieve personal borrowing history |
| GET | `/:id` | Retrieve borrowing details by ID |
| GET | `/` | Retrieve all borrowing records |
| PATCH | `/:id/return` | Return a borrowed book |

**Example borrowing request:**

```json
{
  "bookId": 1
}
```

The due date is calculated using the default loan duration configured in the library settings.

### 4. Audit Log Routes

Base path: `/audit-logs`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Retrieve all audit logs |
| GET | `/user/:id` | Retrieve audit logs for a specific user |

These endpoints require administrator authorization.

### 5. Library Settings Routes

Base path: `/settings`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Retrieve library settings |
| PUT | `/` | Update library settings |

**Example settings update:**

```json
{
  "max_active_borrowings": 4,
  "default_loan_days": 21
}
```

## Authentication and Authorization

This API uses JWT (JSON Web Token) for authentication.

After a successful login, the server returns an access token.

For protected endpoints, include the token in the HTTP request header:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### User Roles

The system supports three roles:

| Role | Description |
|---|---|
| Member | Borrow books and manage personal borrowing activities |
| Librarian | Manage books and access authorized library operations |
| Admin | Manage administrative operations, settings, and audit logs |

Registration always assigns the `member` role. To create an administrator or librarian account during local setup, register an account and change its role directly in the database as an authorized developer.

Example:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'hana@example.com';
```

Log in again after changing the role to receive a token containing the updated role.

## HTTP Status Codes

The API uses standard HTTP status codes:

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource successfully created |
| 400 | Invalid request |
| 401 | Authentication required or invalid token |
| 403 | Access forbidden |
| 404 | Resource or route not found |
| 409 | Resource conflict |
| 500 | Internal server error |

## Database Transactions

Database transactions are used in important borrowing and book management operations to maintain data consistency.

For example, when a member borrows a book, the system must:
- Verify book availability.
- Check the member's borrowing limit.
- Create a borrowing record.
- Update available book copies.
- Record the operation in the audit log.

If an operation fails, the transaction can be rolled back to prevent partial database updates.

## API Testing

The API can be tested using Thunder Client or Postman.

Recommended testing areas:

- User registration and login.
- Invalid credentials and duplicate emails.
- Missing, invalid, and expired JWT tokens.
- Access permissions for different roles.
- Book creation, updating, and deletion.
- Borrowing and returning books.
- Borrowing limits and book availability.
- Audit log retrieval.
- Library settings updates.
- Invalid input and database conflicts.

## Error Handling

The API handles common errors, including:

- Invalid request bodies.
- Missing required fields.
- Invalid IDs.
- Duplicate email addresses and ISBNs.
- Unauthorized requests.
- Forbidden operations.
- Missing resources.
- Database constraint violations.
- Unexpected server errors.

Sensitive internal error details are logged on the server rather than exposed in API responses.

## Security Considerations

- Passwords are hashed using bcrypt.
- Authentication uses JWT.
- Protected routes require valid access tokens.
- Role-based middleware restricts privileged operations.
- SQL queries use parameterized values.
- Environment variables protect sensitive configuration.
- Database operations use transactions where necessary.

## Future Improvements

Possible future improvements include:

- Automated testing with Jest or another testing framework.
- API documentation using Swagger / OpenAPI.
- Pagination and filtering.
- Search functionality for books.
- Automated overdue borrowing updates.
- Docker deployment.
- Production deployment and monitoring.

## Author

**Hana Asrate**

Software Engineering Student | Backend Development


If you find this project useful or have suggestions for improvement, feel free to contribute or share feedback.

**Thank you for checking out the Library Management API!**