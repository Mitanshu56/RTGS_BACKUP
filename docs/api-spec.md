# RTGS Automation API Specification

## Overview
This document describes the REST API for the RTGS Automation application. The API is built with FastAPI and provides endpoints for user authentication, beneficiary management, transaction processing, and PDF generation.

## Base URL
- Development: `http://localhost:8000`
- Production: `https://your-domain.com/api`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow a consistent JSON format:

### Success Response
```json
{
  "status": "success",
  "data": {...},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {...}
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered
- `422 Unprocessable Entity`: Invalid input data

#### POST /auth/login
Authenticate user and receive access token.

**Request Body (Form Data):**
```
username=user@example.com
password=securepassword123
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `422 Unprocessable Entity`: Invalid input data

#### GET /auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

### Beneficiaries

#### GET /beneficiaries/
Get all beneficiaries for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 100)
- `offset` (optional): Number of results to skip (default: 0)
- `search` (optional): Search term for name or account number

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "account_number": "1234567890",
    "ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "branch_name": "Main Branch",
    "mobile_number": "9876543210",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /beneficiaries/
Create a new beneficiary.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch_name": "Main Branch",
  "mobile_number": "9876543210",
  "email": "john@example.com"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch_name": "Main Branch",
  "mobile_number": "9876543210",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid IFSC code or account number
- `422 Unprocessable Entity`: Validation errors

#### GET /beneficiaries/{beneficiary_id}
Get a specific beneficiary by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `beneficiary_id`: Integer ID of the beneficiary

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch_name": "Main Branch",
  "mobile_number": "9876543210",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Beneficiary not found

#### PUT /beneficiaries/{beneficiary_id}
Update a beneficiary.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `beneficiary_id`: Integer ID of the beneficiary

**Request Body:**
```json
{
  "name": "Jane Doe",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch_name": "Main Branch",
  "mobile_number": "9876543210",
  "email": "jane@example.com"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch_name": "Main Branch",
  "mobile_number": "9876543210",
  "email": "jane@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### DELETE /beneficiaries/{beneficiary_id}
Delete a beneficiary.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `beneficiary_id`: Integer ID of the beneficiary

**Response (204 No Content)**

**Error Responses:**
- `404 Not Found`: Beneficiary not found

### Transactions

#### GET /transactions/
Get all transactions for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 100)
- `offset` (optional): Number of results to skip (default: 0)
- `status` (optional): Filter by transaction status
- `date_from` (optional): Filter transactions from date (YYYY-MM-DD)
- `date_to` (optional): Filter transactions to date (YYYY-MM-DD)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "beneficiary_id": 1,
    "amount": 10000.00,
    "purpose": "Payment for services",
    "status": "completed",
    "pdf_path": "/uploads/rtgs_20240115_001.pdf",
    "created_at": "2024-01-15T10:30:00Z",
    "beneficiary": {
      "id": 1,
      "name": "John Doe",
      "account_number": "1234567890",
      "bank_name": "State Bank of India"
    }
  }
]
```

#### POST /transactions/
Create a new transaction.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "beneficiary_id": 1,
  "amount": 10000.00,
  "purpose": "Payment for services"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "beneficiary_id": 1,
  "amount": 10000.00,
  "purpose": "Payment for services",
  "status": "pending",
  "pdf_path": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### GET /transactions/{transaction_id}
Get a specific transaction by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `transaction_id`: Integer ID of the transaction

**Response (200 OK):**
```json
{
  "id": 1,
  "beneficiary_id": 1,
  "amount": 10000.00,
  "purpose": "Payment for services",
  "status": "completed",
  "pdf_path": "/uploads/rtgs_20240115_001.pdf",
  "created_at": "2024-01-15T10:30:00Z",
  "beneficiary": {
    "id": 1,
    "name": "John Doe",
    "account_number": "1234567890",
    "ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "branch_name": "Main Branch"
  }
}
```

### PDF Generation

#### POST /pdf/generate
Generate RTGS PDF for a transaction.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "transaction_id": 1
}
```

**Response (200 OK):**
```json
{
  "filename": "rtgs_20240115_001.pdf",
  "download_url": "/pdf/download/rtgs_20240115_001.pdf",
  "generated_at": "2024-01-15T10:30:00Z"
}
```

#### GET /pdf/download/{filename}
Download a generated PDF file.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `filename`: Name of the PDF file to download

**Response (200 OK):**
Returns the PDF file as a binary stream with appropriate headers.

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid email or password |
| `USER_EXISTS` | User with this email already exists |
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `BENEFICIARY_NOT_FOUND` | Beneficiary with given ID not found |
| `TRANSACTION_NOT_FOUND` | Transaction with given ID not found |
| `INVALID_IFSC` | IFSC code format is invalid |
| `INVALID_ACCOUNT_NUMBER` | Account number format is invalid |
| `INVALID_MOBILE` | Mobile number format is invalid |
| `PDF_GENERATION_FAILED` | Failed to generate PDF document |
| `FILE_NOT_FOUND` | Requested file does not exist |

## Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- Other endpoints: 100 requests per minute per user
- PDF generation: 10 requests per minute per user

## Validation Rules

### Email
- Must be a valid email format
- Maximum length: 255 characters

### Password
- Minimum length: 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one digit

### IFSC Code
- Must be 11 characters long
- Format: 4 letters + 0 + 6 alphanumeric characters
- Example: SBIN0001234

### Account Number
- Length: 9-18 digits
- Only numeric characters allowed

### Mobile Number
- Length: 10 digits
- Must start with 6, 7, 8, or 9

### Amount
- Must be positive
- Maximum: 10,00,000 (10 lakh)
- Precision: 2 decimal places
