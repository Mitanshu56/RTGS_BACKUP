# RTGS Automation Web Application

A comprehensive full-stack web application that automates the process of filling out RTGS (Real Time Gross Settlement) forms for bank transfers. Built with FastAPI backend, React frontend, and PostgreSQL database.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Beneficiary Management**: Add, edit, delete, and manage beneficiary bank details
- **RTGS Form Generation**: Automated PDF generation for RTGS transfer forms
- **Transaction History**: View and filter past transactions with export functionality
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Docker Deployment**: One-command deployment with Docker Compose

## 📋 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping
- **PostgreSQL** - Robust relational database
- **JWT** - JSON Web Tokens for authentication
- **Pydantic** - Data validation using Python type annotations
- **python-docx** - Create and manipulate Word documents for PDF generation

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Declarative routing for React applications
- **Axios** - Promise-based HTTP client

### Deployment
- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Web server and reverse proxy
- **PostgreSQL Container** - Dockerized database

## 🛠️ Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)

### Quick Start with Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd rtgs-automation-app
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp ../.env.example .env
   # Configure your database and other settings
   ```

5. **Run the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### User Model
- `id`: Primary key
- `email`: Unique email address
- `hashed_password`: Bcrypt hashed password
- `is_active`: User status flag
- `created_at`: Registration timestamp

### Remitter Model (User's Bank Details)
- `id`: Primary key
- `user_id`: Foreign key to User
- `account_holder_name`: Account holder's full name
- `account_number`: Bank account number
- `ifsc_code`: Bank IFSC code
- `bank_name`: Name of the bank
- `branch_name`: Bank branch name

### Beneficiary Model
- `id`: Primary key
- `user_id`: Foreign key to User
- `name`: Beneficiary's name
- `account_number`: Beneficiary's account number
- `ifsc_code`: Beneficiary's bank IFSC code
- `bank_name`: Beneficiary's bank name
- `branch_name`: Beneficiary's branch name
- `mobile_number`: Contact number
- `email`: Email address (optional)

### Transaction Model
- `id`: Primary key
- `user_id`: Foreign key to User
- `beneficiary_id`: Foreign key to Beneficiary
- `amount`: Transfer amount
- `purpose`: Purpose of transfer
- `pdf_path`: Generated PDF file path
- `status`: Transaction status
- `created_at`: Transaction timestamp

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Beneficiaries
- `GET /beneficiaries/` - List user's beneficiaries
- `POST /beneficiaries/` - Create new beneficiary
- `GET /beneficiaries/{id}` - Get beneficiary details
- `PUT /beneficiaries/{id}` - Update beneficiary
- `DELETE /beneficiaries/{id}` - Delete beneficiary

### Transactions
- `GET /transactions/` - List user's transactions
- `POST /transactions/` - Create new transaction
- `GET /transactions/{id}` - Get transaction details

### PDF Generation
- `POST /pdf/generate` - Generate RTGS PDF
- `GET /pdf/download/{filename}` - Download generated PDF

## 🎨 Frontend Components

### Pages
- **Login** (`/login`) - User authentication
- **Dashboard** (`/`) - Overview with statistics
- **New RTGS** (`/new-rtgs`) - Create new RTGS transfer
- **Beneficiaries** (`/beneficiaries`) - Manage beneficiaries
- **History** (`/history`) - View transaction history

### Key Components
- **Navbar** - Top navigation with user menu
- **Sidebar** - Side navigation menu
- **TransactionCard** - Individual transaction display
- **FilterControls** - History filtering options

## 🐳 Docker Configuration

The application uses a multi-container Docker setup:

### Services
- **db** - PostgreSQL database container
- **backend** - FastAPI application container
- **frontend** - React app served by Nginx

### Networking
- Internal Docker network for service communication
- Nginx reverse proxy for API routing
- Port 3000 exposed for frontend access

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Environment Variables

Key environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (change in production)
- `REACT_APP_API_URL` - Backend API URL for frontend

## 🔧 Configuration

### JWT Settings
- Token expiration: 30 minutes (configurable)
- Algorithm: HS256
- Secure password hashing with bcrypt

### File Upload
- Maximum upload size: 10MB
- Supported formats: PDF documents
- Storage: Local filesystem (configurable for cloud storage)

### CORS Configuration
- Development origins: localhost:3000, localhost:5173
- Production: Configure based on deployment domain

## 🚀 Deployment

### Production Deployment

1. **Set production environment variables**:
   - Generate strong `SECRET_KEY`
   - Configure production `DATABASE_URL`
   - Set appropriate `CORS_ORIGINS`

2. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Security Considerations
- Change default secret keys
- Use environment-specific database credentials
- Enable HTTPS in production
- Configure proper CORS origins
- Regular security updates

## 📊 Features Overview

### User Management
- Secure registration and login
- JWT-based session management
- Password encryption with bcrypt

### Beneficiary Management
- CRUD operations for beneficiaries
- Bank detail validation (IFSC, account numbers)
- Search and filter functionality

### RTGS Processing
- Automated form filling
- PDF generation with user and beneficiary details
- Amount to words conversion
- Transaction history tracking

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Modern UI with TailwindCSS
- Intuitive navigation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the troubleshooting section
- Create an issue in the repository

---

**Built with ❤️ for automating RTGS transfers**
