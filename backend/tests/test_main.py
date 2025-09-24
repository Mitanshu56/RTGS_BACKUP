import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }


@pytest.fixture
def authenticated_user(test_user_data):
    # Register user
    response = client.post("/auth/register", json=test_user_data)
    assert response.status_code == 201
    
    # Login user
    login_data = {
        "username": test_user_data["email"],
        "password": test_user_data["password"]
    }
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestAuth:
    def test_register_user(self, test_user_data):
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert "id" in data

    def test_register_duplicate_email(self, test_user_data):
        # Register first user
        client.post("/auth/register", json=test_user_data)
        
        # Try to register with same email
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 400

    def test_login_valid_credentials(self, test_user_data):
        # Register user first
        client.post("/auth/register", json=test_user_data)
        
        # Login
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self):
        login_data = {
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 401

    def test_get_current_user(self, authenticated_user):
        response = client.get("/auth/me", headers=authenticated_user)
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "id" in data

    def test_get_current_user_invalid_token(self):
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 401


class TestBeneficiaries:
    @pytest.fixture
    def beneficiary_data(self):
        return {
            "name": "John Doe",
            "account_number": "1234567890",
            "ifsc_code": "SBIN0001234",
            "bank_name": "State Bank of India",
            "branch_name": "Main Branch",
            "mobile_number": "9876543210",
            "email": "john@example.com"
        }

    def test_create_beneficiary(self, authenticated_user, beneficiary_data):
        response = client.post(
            "/beneficiaries/", 
            json=beneficiary_data, 
            headers=authenticated_user
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == beneficiary_data["name"]
        assert data["account_number"] == beneficiary_data["account_number"]

    def test_get_beneficiaries(self, authenticated_user, beneficiary_data):
        # Create a beneficiary first
        client.post("/beneficiaries/", json=beneficiary_data, headers=authenticated_user)
        
        # Get beneficiaries
        response = client.get("/beneficiaries/", headers=authenticated_user)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        assert data[0]["name"] == beneficiary_data["name"]

    def test_get_beneficiary_by_id(self, authenticated_user, beneficiary_data):
        # Create beneficiary
        create_response = client.post(
            "/beneficiaries/", 
            json=beneficiary_data, 
            headers=authenticated_user
        )
        beneficiary_id = create_response.json()["id"]
        
        # Get beneficiary by ID
        response = client.get(f"/beneficiaries/{beneficiary_id}", headers=authenticated_user)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == beneficiary_data["name"]

    def test_update_beneficiary(self, authenticated_user, beneficiary_data):
        # Create beneficiary
        create_response = client.post(
            "/beneficiaries/", 
            json=beneficiary_data, 
            headers=authenticated_user
        )
        beneficiary_id = create_response.json()["id"]
        
        # Update beneficiary
        updated_data = beneficiary_data.copy()
        updated_data["name"] = "Jane Doe"
        
        response = client.put(
            f"/beneficiaries/{beneficiary_id}", 
            json=updated_data, 
            headers=authenticated_user
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Jane Doe"

    def test_delete_beneficiary(self, authenticated_user, beneficiary_data):
        # Create beneficiary
        create_response = client.post(
            "/beneficiaries/", 
            json=beneficiary_data, 
            headers=authenticated_user
        )
        beneficiary_id = create_response.json()["id"]
        
        # Delete beneficiary
        response = client.delete(f"/beneficiaries/{beneficiary_id}", headers=authenticated_user)
        assert response.status_code == 204
        
        # Verify deletion
        response = client.get(f"/beneficiaries/{beneficiary_id}", headers=authenticated_user)
        assert response.status_code == 404

    def test_unauthorized_access(self, beneficiary_data):
        response = client.post("/beneficiaries/", json=beneficiary_data)
        assert response.status_code == 401


class TestTransactions:
    @pytest.fixture
    def transaction_data(self, authenticated_user, beneficiary_data):
        # Create beneficiary first
        beneficiary_response = client.post(
            "/beneficiaries/", 
            json=beneficiary_data, 
            headers=authenticated_user
        )
        beneficiary_id = beneficiary_response.json()["id"]
        
        return {
            "beneficiary_id": beneficiary_id,
            "amount": 10000.00,
            "purpose": "Payment for services"
        }

    def test_create_transaction(self, authenticated_user, transaction_data):
        response = client.post(
            "/transactions/", 
            json=transaction_data, 
            headers=authenticated_user
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == transaction_data["amount"]
        assert data["purpose"] == transaction_data["purpose"]

    def test_get_transactions(self, authenticated_user, transaction_data):
        # Create transaction first
        client.post("/transactions/", json=transaction_data, headers=authenticated_user)
        
        # Get transactions
        response = client.get("/transactions/", headers=authenticated_user)
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0

    def test_get_transaction_by_id(self, authenticated_user, transaction_data):
        # Create transaction
        create_response = client.post(
            "/transactions/", 
            json=transaction_data, 
            headers=authenticated_user
        )
        transaction_id = create_response.json()["id"]
        
        # Get transaction by ID
        response = client.get(f"/transactions/{transaction_id}", headers=authenticated_user)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == transaction_data["amount"]


def teardown_module():
    """Clean up after tests"""
    import os
    if os.path.exists("test.db"):
        os.remove("test.db")