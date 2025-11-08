# =====================================================================================
# 📦 Pharma SupplyChain Backend - Adminnew-main
# ✅ Phiên bản gộp hoàn chỉnh (MongoDB + FastAPI + Web3 + JWT)
# =====================================================================================

import os
import json
import re
import uvicorn
import random
import jwt
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from web3 import Web3
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime, timedelta

# -----------------------------------------------------------------------------------
# MONGODB + AUTH
# -----------------------------------------------------------------------------------
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
from bson.objectid import ObjectId
from eth_account import Account
import secrets

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-should-be-very-long-and-secure-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

if not MONGO_URI:
    raise RuntimeError("Set MONGO_URI in .env")

# Parse database name from URI or use default
db_name = "admin_pharma_db"
try:
    # Nếu MONGO_URI có database name, extract nó
    # MongoDB Atlas URI format: mongodb+srv://user:pass@cluster.mongodb.net/dbname?options
    uri_parts = MONGO_URI.split("?")[0]  # Remove query parameters
    if "/" in uri_parts:
        # Split by / and get the last part before ?
        parts = uri_parts.split("/")
        if len(parts) > 1:
            potential_db = parts[-1]
            # Check if it's not empty and not a connection parameter
            if potential_db and potential_db not in ["", "admin", "test"] and "@" not in potential_db:
                db_name = potential_db
except Exception as e:
    print(f"Warning: Could not parse database name from URI, using default: {db_name}")
    pass

# Initialize MongoDB connection variables
client = None
db = None
users_collection = None
temp_sessions_collection = None
transactions_collection = None
login_history_collection = None

try:
    # Kết nối với MongoDB Atlas hoặc MongoDB local
    # MongoDB Atlas URI format: mongodb+srv://user:pass@cluster.mongodb.net/dbname?options
    # MongoDB local URI format: mongodb://localhost:27017/dbname
    
    # Cấu hình connection options cho MongoDB Atlas
    connection_options = {
        "serverSelectionTimeoutMS": 5000,  # Timeout 5 giây
        "connectTimeoutMS": 10000,  # Connection timeout 10 giây
        "socketTimeoutMS": 30000,  # Socket timeout 30 giây
        "retryWrites": True,  # Retry writes cho MongoDB Atlas
        "w": "majority"  # Write concern
    }
    
    # Nếu là MongoDB Atlas (mongodb+srv://), thêm tlsAllowInvalidCertificates=False
    if "mongodb+srv://" in MONGO_URI:
        connection_options["tls"] = True
        connection_options["tlsAllowInvalidCertificates"] = False
    
    # Tạo MongoDB client
    client = MongoClient(MONGO_URI, **connection_options)
    
    # Chọn database
    db = client[db_name]
    
    # Khởi tạo collections
    users_collection = db.users
    temp_sessions_collection = db.temp_sessions
    transactions_collection = db.transactions
    login_history_collection = db.login_history

    # Test connection bằng ping command
    client.admin.command('ping')
    
    # Hiển thị thông tin kết nối
    if "mongodb+srv://" in MONGO_URI:
        print(f"✅ MongoDB Atlas connected | DB: {db.name}")
    else:
        print(f"✅ MongoDB connected to {client.address[0]} | DB: {db.name}")
        
except Exception as e:
    print(f"⚠️ Warning: MongoDB connection error: {e}")
    print(f"   URI: {MONGO_URI[:50]}..." if len(MONGO_URI) > 50 else f"   URI: {MONGO_URI}")
    
    # Reset variables nếu không kết nối được
    try:
        if client is not None:
            client.close()
    except:
        pass
    client = None
    db = None
    users_collection = None
    temp_sessions_collection = None
    transactions_collection = None
    login_history_collection = None
    print(f"❌ MongoDB không kết nối được. Backend sẽ chạy nhưng các chức năng cần MongoDB sẽ không hoạt động.")
    print(f"   Vui lòng kiểm tra:")
    print(f"   1. MongoDB Atlas đang chạy và URI đúng")
    print(f"   2. Network Access trong MongoDB Atlas cho phép IP của bạn")
    print(f"   3. Username và password trong URI đúng")
    print(f"   4. Database user có quyền truy cập")

# -----------------------------------------------------------------------------------
# WEB3 + SMART CONTRACT (Optional)
# -----------------------------------------------------------------------------------
WEB3_PROVIDER = os.getenv("WEB3_PROVIDER", "http://localhost:8545")
WEB3_ENABLED = os.getenv("WEB3_ENABLED", "false").lower() == "true"  # Chỉ kết nối nếu bật
w3 = None

# Chỉ kết nối Web3 nếu được bật trong .env
if WEB3_ENABLED:
    try:
        w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
        if w3.is_connected():
            print(f"✅ Web3 connected to {WEB3_PROVIDER}")
        else:
            print(f"ℹ️  Web3 provider available but not connected: {WEB3_PROVIDER}")
            w3 = None
    except Exception as e:
        print(f"ℹ️  Web3 not available: {e}")
        w3 = None
# Web3 is optional, không hiển thị thông báo nếu không bật (silent mode)

# -----------------------------------------------------------------------------------
# FASTAPI SETUP + CORS
# -----------------------------------------------------------------------------------
app = FastAPI(title="Pharma SupplyChain Backend - Adminnew")

# CORS configuration - Allow multiple origins for development
# Using allow_origin_regex to support dynamic IPs and ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.33:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# -----------------------------------------------------------------------------------
# MODELS
# -----------------------------------------------------------------------------------
class PhoneRequest(BaseModel):
    phone: str


class OTPRequest(BaseModel):
    phone: str
    otp_code: str


class LoginRequest(BaseModel):
    phone: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    phone: str
    password: str


class PasswordRequest(BaseModel):
    phone: str
    password: str
    temp_token: str


class AddDrugPayload(BaseModel):
    name: str
    batch: str
    price: float | None = None


class TransferPayload(BaseModel):
    id: int
    next_stage: int
    to_address: str | None = None


# -----------------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------------
def create_access_token(user_id: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"user_id": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        if users_collection is None:
            raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Token không hợp lệ - thiếu user_id")
        
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=401, detail="Token không hợp lệ - user_id không đúng format")

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="Người dùng không tồn tại")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Token không hợp lệ: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xác thực: {str(e)}")


# -----------------------------------------------------------------------------------
# AUTHENTICATION API (OTP + PASSWORD + LOGIN)
# -----------------------------------------------------------------------------------
@app.post("/api/auth/start")
def start_auth(request_data: PhoneRequest):
    if users_collection is None or temp_sessions_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
    
    phone = request_data.phone
    if not re.fullmatch(r"\d{10,11}", phone):
        raise HTTPException(status_code=400, detail="Số điện thoại không hợp lệ")

    # Kiểm tra user đã tồn tại chưa
    if users_collection.count_documents({"phone": phone}) > 0:
        return {"status": "success", "message": "Đã có tài khoản", "action": "LOGIN"}

    # Tạo OTP và lưu vào MongoDB
    otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    temp_sessions_collection.update_one(
        {"phone": phone},
        {
            "$set": {
                "otp_code": otp_code,
                "attempts": 0,
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(minutes=5),
            }
        },
        upsert=True,
    )

    return {
        "status": "success",
        "message": f"Mã OTP của bạn: {otp_code}",
        "otp_displayed": otp_code,
        "action": "VERIFY_OTP",
    }


@app.post("/api/auth/verify_otp")
def verify_otp(data: OTPRequest):
    if temp_sessions_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
    
    try:
        session = temp_sessions_collection.find_one({"phone": data.phone})
        if not session:
            raise HTTPException(status_code=404, detail="Không tìm thấy phiên xác thực")

        # Xử lý expires_at an toàn
        expires_at = session.get("expires_at")
        if not expires_at:
            temp_sessions_collection.delete_one({"phone": data.phone})
            raise HTTPException(status_code=400, detail="Phiên xác thực không hợp lệ")
        
        # So sánh datetime an toàn
        if isinstance(expires_at, datetime):
            if expires_at < datetime.utcnow():
                temp_sessions_collection.delete_one({"phone": data.phone})
                raise HTTPException(status_code=400, detail="OTP đã hết hạn")
        else:
            # Nếu không phải datetime, xóa session
            temp_sessions_collection.delete_one({"phone": data.phone})
            raise HTTPException(status_code=400, detail="Phiên xác thực không hợp lệ")

        if session.get("attempts", 0) >= 3:
            temp_sessions_collection.delete_one({"phone": data.phone})
            raise HTTPException(status_code=400, detail="Đã vượt quá số lần thử. Vui lòng yêu cầu OTP mới")

        if session.get("otp_code") != data.otp_code:
            temp_sessions_collection.update_one({"phone": data.phone}, {"$inc": {"attempts": 1}})
            raise HTTPException(status_code=401, detail="Sai mã OTP")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xác thực OTP: {str(e)}")

    # Xóa session sau khi verify thành công
    temp_sessions_collection.delete_one({"phone": data.phone})
    
    # Tạo temp token
    token_payload = {
        "phone": data.phone,
        "action": "set_password_allowed",
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }
    temp_token = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)

    return {"status": "success", "message": "Xác thực thành công", "temp_token": temp_token}


@app.post("/api/auth/set_password")
def set_password(data: PasswordRequest):
    if users_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
    
    try:
        # Validate password
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Mật khẩu phải có ít nhất 6 ký tự")
        
        # Validate phone
        if not re.fullmatch(r"\d{10,11}", data.phone):
            raise HTTPException(status_code=400, detail="Số điện thoại không hợp lệ")
        
        # Kiểm tra user đã tồn tại chưa
        if users_collection.count_documents({"phone": data.phone}) > 0:
            raise HTTPException(status_code=400, detail="Số điện thoại đã được đăng ký")
        
        # Verify temp token
        try:
            payload = jwt.decode(data.temp_token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("phone") != data.phone:
                raise HTTPException(status_code=401, detail="Token không hợp lệ")
            if payload.get("action") != "set_password_allowed":
                raise HTTPException(status_code=401, detail="Token không hợp lệ")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token đã hết hạn")
        except jwt.PyJWTError as e:
            raise HTTPException(status_code=401, detail=f"Token không hợp lệ: {str(e)}")

        # Tạo blockchain wallet cho user
        try:
            account = Account.create(secrets.token_hex(32))
            wallet_address = account.address
        except Exception as e:
            # Fallback nếu không tạo được wallet
            wallet_address = f"0x{secrets.token_hex(20)}"
            print(f"Warning: Could not create wallet: {e}")

        # Hash password và lưu user vào MongoDB
        hashed_pw = hashpw(data.password.encode("utf-8"), gensalt()).decode("utf-8")
        user_data = {
            "phone": data.phone,
            "password": hashed_pw,
            "wallet_address": wallet_address,
            "created_at": datetime.utcnow(),
            "role": "admin"
        }
        users_collection.insert_one(user_data)
        
        return {"status": "success", "message": "Đăng ký thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi đăng ký: {str(e)}")


@app.post("/api/register")
def register_user(data: RegisterRequest):
    if users_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
    
    try:
        # Validate phone number
        if not re.fullmatch(r"\d{10,11}", data.phone):
            raise HTTPException(status_code=400, detail="Số điện thoại không hợp lệ")
        
        # Validate username
        if len(data.username) < 3:
            raise HTTPException(status_code=400, detail="Tên đăng nhập phải có ít nhất 3 ký tự")
        
        # Validate password
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="Mật khẩu phải có ít nhất 6 ký tự")
        
        # Kiểm tra số điện thoại đã tồn tại chưa
        if users_collection.count_documents({"phone": data.phone}) > 0:
            raise HTTPException(status_code=400, detail="Số điện thoại đã được đăng ký")
        
        # Kiểm tra tên đăng nhập đã tồn tại chưa
        if users_collection.count_documents({"username": data.username}) > 0:
            raise HTTPException(status_code=400, detail="Tên đăng nhập đã được sử dụng")
        
        # Tạo blockchain wallet cho user
        try:
            account = Account.create(secrets.token_hex(32))
            wallet_address = account.address
        except Exception as e:
            wallet_address = f"0x{secrets.token_hex(20)}"
            print(f"Warning: Could not create wallet: {e}")
        
        # Hash password và lưu user vào MongoDB
        hashed_pw = hashpw(data.password.encode("utf-8"), gensalt()).decode("utf-8")
        user_data = {
            "username": data.username,
            "phone": data.phone,
            "password": hashed_pw,
            "wallet_address": wallet_address,
            "created_at": datetime.utcnow(),
            "role": "admin"
        }
        users_collection.insert_one(user_data)
        
        return {"status": "success", "message": "Đăng ký thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi đăng ký: {str(e)}")


@app.post("/api/login")
def login_user(data: LoginRequest):
    if users_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
    
    try:
        user = users_collection.find_one({"phone": data.phone})
        if not user:
            raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")
        
        # Kiểm tra password
        if "password" not in user:
            raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")
        
        try:
            if not checkpw(data.password.encode("utf-8"), user["password"].encode("utf-8")):
                raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")
        except (ValueError, TypeError) as e:
            # Lỗi khi decode password (có thể do format không đúng)
            raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi đăng nhập: {str(e)}")

    # Lưu lịch sử đăng nhập vào MongoDB
    if login_history_collection is not None:
        try:
            login_history = {
                "user_id": str(user["_id"]),
                "phone": data.phone,
                "login_time": datetime.utcnow(),
                "ip_address": None,
                "user_agent": None
            }
            login_history_collection.insert_one(login_history)
        except Exception as e:
            print(f"Warning: Could not save login history: {e}")

    # Tạo token với user_id
    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/me")
def get_me(current_user: dict = Depends(get_current_user)):
    try:
        # Xử lý _id an toàn
        user_id = current_user.get("_id", "")
        if user_id:
            user_id = str(user_id)
        
        # Xử lý created_at an toàn
        created_at = current_user.get("created_at", "")
        if created_at:
            if hasattr(created_at, "isoformat"):
                created_at = created_at.isoformat()
            elif hasattr(created_at, "strftime"):
                created_at = created_at.strftime("%Y-%m-%d %H:%M:%S")
            else:
                created_at = str(created_at)
        else:
            created_at = ""
        
        return {
            "id": user_id,
            "phone": current_user.get("phone", ""),
            "wallet_address": current_user.get("wallet_address", ""),
            "username": current_user.get("username", ""),
            "role": current_user.get("role", "admin"),
            "created_at": created_at,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy thông tin user: {str(e)}")


# -----------------------------------------------------------------------------------
# DRUG SEARCH API
# -----------------------------------------------------------------------------------
@app.get("/api/drugs/search")
def search_drugs(q: str = "", limit: int = 50):
    """
    Tìm kiếm thuốc theo tên. Nếu query rỗng, trả về tất cả thuốc.
    """
    if db is None:
        return {"items": [], "total": 0, "error": "MongoDB không kết nối được"}
    
    query = q.strip().lower() if q else ""
    
    try:
        # Nếu query rỗng, lấy tất cả thuốc
        if not query:
            drugs = list(db.drugs.find({}, limit=limit))
            # Nếu không có trong drugs, thử products
            if not drugs:
                drugs = list(db.products.find({}, limit=limit))
        else:
            # Tìm kiếm trong collection drugs với regex (case-insensitive)
            drugs = list(db.drugs.find(
                {"name": {"$regex": query, "$options": "i"}},
                limit=limit
            ))
            
            # Nếu không tìm thấy trong drugs, thử tìm trong products
            if not drugs:
                drugs = list(db.products.find(
                    {"name": {"$regex": query, "$options": "i"}},
                    limit=limit
                ))
        
        # Format kết quả
        items = []
        for drug in drugs:
            items.append({
                "id": str(drug.get("_id", "")),
                "name": drug.get("name", ""),
                "batch": drug.get("batch", ""),
                "owner": drug.get("owner", ""),
                "price": drug.get("price", 0),
                "stage": drug.get("stage", 0),
                "description": drug.get("description", "")
            })
        
        return {"items": items, "total": len(items)}
    except Exception as e:
        # Nếu có lỗi, trả về danh sách rỗng
        return {"items": [], "total": 0, "error": str(e)}


# -----------------------------------------------------------------------------------
# TRANSACTION API - Lưu giao dịch
# -----------------------------------------------------------------------------------
@app.post("/api/purchase")
async def add_purchase(request: Request):
    """
    Lưu thông tin giao dịch (mua thuốc) vào MongoDB.
    """
    if transactions_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
    
    try:
        data = await request.json()
        data["timestamp"] = datetime.utcnow()

        if "price_eth" not in data or "medicine" not in data:
            raise HTTPException(status_code=400, detail="Thiếu thông tin giao dịch")

        transactions_collection.insert_one({
            "customer": data.get("customer", "unknown"),
            "medicine": data["medicine"],
            "price_eth": float(data["price_eth"]),
            "price_usd": float(data.get("price_usd", 0)),
            "tx_hash": data.get("tx_hash"),
            "chain_id": data.get("chain_id"),
            "block_number": data.get("block_number"),
            "timestamp": data["timestamp"],
            "status": data.get("status", "completed")
        })

        return {"message": "✅ Purchase recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/revenue")
def get_revenue(month: int, year: int):
    """
    Tính tổng doanh thu trong tháng (đơn vị ETH)
    """
    if transactions_collection is None:
        raise HTTPException(status_code=503, detail="MongoDB không kết nối được")
    
    try:
        start = datetime(year, month, 1)
        # Xử lý cuối tháng -> sang tháng kế tiếp
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        results = list(transactions_collection.find({
            "timestamp": {"$gte": start, "$lt": end}
        }))

        total_revenue = sum(tx.get("price_eth", 0) for tx in results)

        formatted = []
        for tx in results:
            ts = tx.get("timestamp")
            date_str = ts.strftime("%Y-%m-%d %H:%M:%S") if hasattr(ts, "strftime") else str(ts)
            formatted.append({
                "customer": tx.get("customer"),
                "medicine": tx.get("medicine"),
                "price_eth": tx.get("price_eth"),
                "price_usd": tx.get("price_usd"),
                "tx_hash": tx.get("tx_hash"),
                "chain_id": tx.get("chain_id"),
                "block_number": tx.get("block_number"),
                "date": date_str,
            })

        return {"total": total_revenue, "transactions": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------------------
# HEALTH CHECK
# -----------------------------------------------------------------------------------
@app.get("/health")
def health_check():
    mongodb_status = "disconnected"
    if client is not None and users_collection is not None:
        try:
            # Test connection
            client.admin.command('ping')
            mongodb_status = "connected"
        except:
            mongodb_status = "disconnected"
    
    web3_status = "disconnected"
    if w3 is not None:
        try:
            if w3.is_connected():
                web3_status = "connected"
        except:
            pass
    
    return {
        "status": "ok",
        "mongodb": mongodb_status,
        "web3": web3_status,
        "timestamp": datetime.utcnow().isoformat()
    }


# -----------------------------------------------------------------------------------
# CORS TEST ENDPOINT
# -----------------------------------------------------------------------------------
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}


# -----------------------------------------------------------------------------------
# KHỞI CHẠY SERVER
# -----------------------------------------------------------------------------------
if __name__ == "__main__":
    # Use 0.0.0.0 to accept connections from any IP address
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
