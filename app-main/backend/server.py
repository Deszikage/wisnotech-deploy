from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
import stripe  # <--- NEW IMPORT
import google.generativeai as genai
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'wisnotech_jwt_secret')

# CHANGE THIS BACK: Read from the file again
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY') 
stripe.api_key = STRIPE_API_KEY

# AI CONFIG
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ PYDANTIC MODELS ============

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    token: str

class CourseCreate(BaseModel):
    title: str
    slug: str
    description: str
    long_description: str = ""
    price: float
    currency: str = "NGN"
    duration: str = ""
    level: str = "Beginner"
    instructor: str = "WISNOTECH Team"
    image: str = ""
    category: str = ""
    curriculum: List[str] = []
    highlights: List[str] = []

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str = ""
    content: str
    image: str = ""
    category: str = ""
    author: str = "WISNOTECH"

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

class CheckoutRequest(BaseModel):
    course_id: str
    origin_url: str

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt(user_id: str, email: str, role: str = "student") -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(request: Request) -> dict:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user

    # Check Authorization header (JWT)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # Check if it's a session token
        session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user
        # Try JWT
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
            if user:
                return user
        except jwt.ExpiredSignatureError:
            pass
        except jwt.InvalidTokenError:
            pass

    raise HTTPException(status_code=401, detail="Not authenticated")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": "student",
        "picture": "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_jwt(user_id, data.email, "student")
    return {
        "token": token,
        "user": {
            "user_id": user_id,
            "name": data.name,
            "email": data.email,
            "role": "student",
            "picture": ""
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not user.get("password"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_jwt(user["user_id"], user["email"], user.get("role", "student"))
    user_safe = {k: v for k, v in user.items() if k != "password"}
    return {"token": token, "user": user_safe}

@api_router.post("/auth/google")
async def google_login(data: GoogleLoginRequest, response: Response):
    # 1. Verify the ACCESS TOKEN via Google UserInfo API
    # We use httpx to call Google and ask "Who does this token belong to?"
    try:
        async with httpx.AsyncClient() as client:
            google_res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {data.token}"}
            )
        
        # If Google rejects the token, we reject the login
        if google_res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google Token")
            
        id_info = google_res.json()

        # 2. Get User Info from the response
        email = id_info.get('email')
        name = id_info.get('name', '')
        picture = id_info.get('picture', '')

        if not email:
             raise HTTPException(status_code=400, detail="Google account has no email")

        # 3. Find or Create User in Your Database
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing:
            user_id = existing["user_id"]
            # Update their picture/name if it changed
            await db.users.update_one(
                {"email": email}, 
                {"$set": {"name": name, "picture": picture}}
            )
            role = existing.get("role", "student")
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            role = "student"
            user_doc = {
                "user_id": user_id,
                "name": name,
                "email": email,
                "picture": picture,
                "role": role,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)

        # 4. Create Session (Log them in)
        session_token = f"sess_{uuid.uuid4().hex}"
        
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        # Set Cookie
        response.set_cookie(
            key="session_token", value=session_token,
            httponly=True, secure=True, samesite="lax", path="/",
            max_age=7*24*60*60
        )

        # Return User Data
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        user_safe = {k: v for k, v in user.items() if k != "password"}
        return {"user": user_safe, "token": session_token}

    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Could not connect to Google")

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    user_safe = {k: v for k, v in user.items() if k != "password"}
    return user_safe

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

# ============ COURSES ROUTES ============

@api_router.get("/courses")
async def get_courses():
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    return courses

@api_router.get("/courses/{slug}")
async def get_course(slug: str):
    course = await db.courses.find_one({"slug": slug}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@api_router.post("/courses")
async def create_course(data: CourseCreate, request: Request):
    admin = await get_admin_user(request)
    course_id = f"course_{uuid.uuid4().hex[:8]}"
    doc = data.model_dump()
    doc["course_id"] = course_id
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["students_count"] = 0
    await db.courses.insert_one(doc)
    created = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    return created

@api_router.put("/courses/{course_id}")
async def update_course(course_id: str, data: CourseCreate, request: Request):
    admin = await get_admin_user(request)
    update_data = data.model_dump()
    result = await db.courses.update_one({"course_id": course_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    updated = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    return updated

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, request: Request):
    admin = await get_admin_user(request)
    result = await db.courses.delete_one({"course_id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted"}

# ============ ENROLLMENT ROUTES ============

@api_router.get("/enrollments")
async def get_my_enrollments(request: Request):
    user = await get_current_user(request)
    enrollments = await db.enrollments.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return enrollments

@api_router.get("/enrollments/check/{course_id}")
async def check_enrollment(course_id: str, request: Request):
    user = await get_current_user(request)
    enrollment = await db.enrollments.find_one(
        {"user_id": user["user_id"], "course_id": course_id}, {"_id": 0}
    )
    return {"enrolled": enrollment is not None}

# ============ STRIPE PAYMENT ROUTES ============

@api_router.post("/payments/checkout")
async def create_checkout(data: CheckoutRequest, request: Request):
    user = await get_current_user(request)
    
    # 1. Get Course Info
    course = await db.courses.find_one({"course_id": data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # 2. Check if already enrolled
    existing = await db.enrollments.find_one(
        {"user_id": user["user_id"], "course_id": data.course_id}, {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    # 3. Setup URLs
    origin = data.origin_url.rstrip("/")
    success_url = f"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/courses/{course['slug']}"

    try:
        # 4. Create Real Stripe Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'ngn',
                    'product_data': {
                        'name': course['title'],
                        'description': course['description'][:100],
                        'images': [course['image']] if course.get('image') else [],
                    },
                    'unit_amount': int(course['price'] * 100), # Amount in kobo (x100)
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user['email'],
            metadata={
                "user_id": user["user_id"],
                "course_id": data.course_id
            }
        )

        # 5. Save Pending Transaction
        tx_id = f"tx_{uuid.uuid4().hex[:12]}"
        await db.payment_transactions.insert_one({
            "tx_id": tx_id,
            "session_id": checkout_session.id,
            "user_id": user["user_id"],
            "course_id": data.course_id,
            "amount": course["price"],
            "currency": "NGN",
            "payment_status": "pending",
            "status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        return {"url": checkout_session.url, "session_id": checkout_session.id}

    except Exception as e:
        logger.error(f"Stripe Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    try:
        # 1. Ask Stripe for status
        session = stripe.checkout.Session.retrieve(session_id)
        payment_status = session.payment_status  # 'paid' or 'unpaid'
        
        # 2. Update DB if paid
        if payment_status == 'paid':
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "status": "complete"}}
            )
            # Find the transaction to get user/course info
            tx = await db.payment_transactions.find_one({"session_id": session_id})
            
            # Enroll Student if not already enrolled
            if tx:
                existing_enrollment = await db.enrollments.find_one(
                    {"user_id": tx["user_id"], "course_id": tx["course_id"]}
                )
                if not existing_enrollment:
                    enrollment_id = f"enroll_{uuid.uuid4().hex[:8]}"
                    await db.enrollments.insert_one({
                        "enrollment_id": enrollment_id,
                        "user_id": tx["user_id"],
                        "course_id": tx["course_id"],
                        "payment_session_id": session_id,
                        "status": "active",
                        "progress": 0,
                        "enrolled_at": datetime.now(timezone.utc).isoformat()
                    })
                    await db.courses.update_one(
                        {"course_id": tx["course_id"]},
                        {"$inc": {"students_count": 1}}
                    )

        return {
            "status": session.status,
            "payment_status": payment_status,
            "amount_total": session.amount_total / 100 if session.amount_total else 0,
            "currency": session.currency
        }
    except Exception as e:
        logger.error(f"Verification Error: {e}")
        raise HTTPException(status_code=500, detail="Could not verify payment")

# @api_router.post("/webhook/stripe")
# async def stripe_webhook(request: Request):
#     payload = await request.body()
#     sig_header = request.headers.get("Stripe-Signature")
    
#     # You would need to add this to your .env later for real webhooks
#     endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

#     event = None

#     try:
#         # If we have a secret, verify the message is actually from Stripe
#         if endpoint_secret:
#             event = stripe.Webhook.construct_event(
#                 payload, sig_header, endpoint_secret
#             )
#         else:
#             # If no secret is set (local testing), just skip verification logic
#             return {"status": "ignored", "reason": "no_webhook_secret"}
#     except ValueError as e:
#         # Invalid payload
#         raise HTTPException(status_code=400, detail="Invalid payload")
#     except stripe.error.SignatureVerificationError as e:
#         # Invalid signature
#         raise HTTPException(status_code=400, detail="Invalid signature")

#     # Handle the event
#     if event and event['type'] == 'checkout.session.completed':
#         session = event['data']['object']
#         # Here you would repeat the enrollment logic (find user, enroll them)
#         # For now, we just acknowledge receipt
#         logger.info(f"Payment received for session: {session.get('id')}")

#     return {"status": "success"}

@api_router.get("/payments/history")
async def get_payment_history(request: Request):
    user = await get_current_user(request)
    transactions = await db.payment_transactions.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return transactions

# ============ BLOG ROUTES ============

@api_router.get("/blog")
async def get_blog_posts():
    posts = await db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/blog")
async def create_blog_post(data: BlogPostCreate, request: Request):
    admin = await get_admin_user(request)
    post_id = f"post_{uuid.uuid4().hex[:8]}"
    doc = data.model_dump()
    doc["post_id"] = post_id
    doc["published"] = True
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.blog_posts.insert_one(doc)
    created = await db.blog_posts.find_one({"post_id": post_id}, {"_id": 0})
    return created

@api_router.put("/blog/{post_id}")
async def update_blog_post(post_id: str, data: BlogPostCreate, request: Request):
    admin = await get_admin_user(request)
    update_data = data.model_dump()
    result = await db.blog_posts.update_one({"post_id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    updated = await db.blog_posts.find_one({"post_id": post_id}, {"_id": 0})
    return updated

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, request: Request):
    admin = await get_admin_user(request)
    result = await db.blog_posts.delete_one({"post_id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}

# ============ AI CHATBOT ROUTES ============

@api_router.post("/chat")
async def chat_endpoint(data: ChatMessage):
    # 1. Check if Key exists
    if not os.environ.get('GEMINI_API_KEY'):
        return {"response": "AI is currently sleeping (No API Key).", "session_id": "error"}

    # 2. Prepare Context (The AI's "Brain")
    # We fetch courses so the AI knows what you sell
    courses = await db.courses.find({}, {"_id": 0}).to_list(20)
    course_list = "\n".join([
        f"- {c['title']} (₦{c['price']:,.0f}): {c['description']}"
        for c in courses
    ])
    
    system_instruction = f"""You are WISNO AI, the helpful assistant for WISNOTECH Digital Academy in Nigeria.
    Your tone is encouraging, professional, and friendly.
    
    Here are our available courses:
    {course_list}
    
    Rules:
    - Only answer questions about digital skills, careers, and our courses.
    - If asked about enrollment, tell them to click the 'Enroll' button on the course page.
    - Keep answers concise (under 3 sentences) unless asked for more detail.
    """

    try:
        # 3. Call Google Gemini
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # We start a chat with history (simplified for now to just 1 turn)
        chat = model.start_chat(history=[
            {"role": "user", "parts": system_instruction},
            {"role": "model", "parts": "Understood. I am ready to help students."}
        ])
        
        response = chat.send_message(data.message)
        
        # 4. Save to Database (Optional - good for history)
        # (You can uncomment the DB saving lines from your old code if you want history)
        
        return {"response": response.text, "session_id": data.session_id or "new_session"}

    except Exception as e:
        logger.error(f"AI Error: {e}")
        return {"response": "I'm having trouble connecting to the brain right now. Please try again.", "session_id": "error"}

@api_router.get("/chat/recommend")
async def recommend_courses(request: Request):
    if not os.environ.get('GEMINI_API_KEY'):
        return {"recommendations": [], "message": "AI configuration missing."}

    user = await get_current_user(request)
    
    # Get what they already bought
    enrollments = await db.enrollments.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(50)
    enrolled_ids = [e["course_id"] for e in enrollments]
    
    # Get what is available
    all_courses = await db.courses.find({}, {"_id": 0}).to_list(20)
    available = [c for c in all_courses if c.get("course_id") not in enrolled_ids]

    if not available:
        return {"recommendations": [], "message": "You are a superstar! You enrolled in everything."}

    # Ask Gemini to pick the best ones
    prompt = f"""
    Based on this list of available courses: {[c['title'] for c in available]},
    Recommend 2 courses that are best for a student looking to start a tech career.
    Return ONLY a JSON array of strings, e.g. ["Course A", "Course B"].
    """
    
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        result = model.generate_content(prompt)
        # Simple cleanup to ensure we get just the text list
        text = result.text.replace('```json', '').replace('```', '').strip()
        import json
        recommendations = json.loads(text)
        
        return {"recommendations": recommendations, "available_courses": [c["title"] for c in available]}
    except Exception:
        # Fallback if AI fails: just return the first 2 available courses
        return {"recommendations": [c["title"] for c in available[:2]], "available_courses": [c["title"] for c in available]}

# ============ CONTACT ROUTE ============

@api_router.post("/contact")
async def submit_contact(data: ContactForm):
    contact_id = f"contact_{uuid.uuid4().hex[:8]}"
    doc = data.model_dump()
    doc["contact_id"] = contact_id
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["read"] = False
    await db.contacts.insert_one(doc)
    return {"message": "Message sent successfully", "contact_id": contact_id}

# ============ ADMIN ROUTES ============

@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    admin = await get_admin_user(request)
    total_users = await db.users.count_documents({})
    total_courses = await db.courses.count_documents({})
    total_enrollments = await db.enrollments.count_documents({})
    total_revenue_cursor = db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0, "amount": 1})
    paid_txs = await total_revenue_cursor.to_list(10000)
    total_revenue = sum(t.get("amount", 0) for t in paid_txs)
    total_posts = await db.blog_posts.count_documents({})
    unread_contacts = await db.contacts.count_documents({"read": False})
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": total_revenue,
        "total_posts": total_posts,
        "unread_contacts": unread_contacts
    }

@api_router.get("/admin/users")
async def admin_get_users(request: Request):
    admin = await get_admin_user(request)
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def admin_update_role(user_id: str, request: Request):
    admin = await get_admin_user(request)
    body = await request.json()
    new_role = body.get("role", "student")
    await db.users.update_one({"user_id": user_id}, {"$set": {"role": new_role}})
    return {"message": "Role updated"}

@api_router.get("/admin/enrollments")
async def admin_get_enrollments(request: Request):
    admin = await get_admin_user(request)
    enrollments = await db.enrollments.find({}, {"_id": 0}).to_list(1000)
    return enrollments

@api_router.get("/admin/payments")
async def admin_get_payments(request: Request):
    admin = await get_admin_user(request)
    payments = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return payments

@api_router.get("/admin/contacts")
async def admin_get_contacts(request: Request):
    admin = await get_admin_user(request)
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

# ============ SEED DATA ============

@app.on_event("startup")
async def seed_data():
    count = await db.courses.count_documents({})
    if count == 0:
        courses = [
            {
                "course_id": "course_webdev01",
                "title": "Web Development",
                "slug": "web-development",
                "description": "Master HTML5, CSS3, JavaScript, and modern frameworks to build professional websites.",
                "long_description": "This comprehensive web development course takes you from beginner to professional. You'll learn HTML5, CSS3, JavaScript, React, Node.js, and deployment strategies. Build real-world projects including e-commerce sites, portfolios, and web applications. Our hands-on approach ensures you're job-ready upon completion.",
                "price": 200000.00,
                "currency": "NGN",
                "duration": "3 Months",
                "level": "Beginner to Advanced",
                "instructor": "WISNOTECH Team",
                "image": "https://images.unsplash.com/photo-1753998943918-dd2dfc4ee6ed?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Development",
                "curriculum": ["HTML5 & CSS3 Fundamentals", "JavaScript ES6+", "React.js & Frontend Frameworks", "Backend with Node.js", "Git & GitHub", "Database Integration", "Hosting & Deployment", "Portfolio Project"],
                "highlights": ["Build 5+ real projects", "Industry-standard tools", "Certificate on completion", "Job placement support"],
                "students_count": 35,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "course_id": "course_appdev01",
                "title": "App Development",
                "slug": "app-development",
                "description": "Build cross-platform mobile apps with Flutter for iOS and Android.",
                "long_description": "Learn to create stunning mobile applications using Flutter and Dart. This course covers UI design, state management, API integration, and publishing to both the App Store and Google Play. Build real apps that users love.",
                "price": 200000.00,
                "currency": "NGN",
                "duration": "3 Months",
                "level": "Beginner to Advanced",
                "instructor": "WISNOTECH Team",
                "image": "https://images.unsplash.com/photo-1753998941540-081eed4f6397?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Development",
                "curriculum": ["Dart Programming", "Flutter Fundamentals", "UI/UX for Mobile", "State Management", "API Integration", "iOS & Android Build", "App Testing", "Store Publishing"],
                "highlights": ["Cross-platform skills", "2 published apps", "Certificate on completion", "Mentorship access"],
                "students_count": 20,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "course_id": "course_uiux01",
                "title": "UI/UX & Graphics Design",
                "slug": "ui-ux-graphics",
                "description": "Master design principles, Figma, Adobe XD, and create stunning visual experiences.",
                "long_description": "Become a professional designer with hands-on training in UI/UX design and graphic design. Learn design thinking, wireframing, prototyping, and create beautiful interfaces. Master tools like Figma, Adobe XD, Photoshop, and Illustrator.",
                "price": 100000.00,
                "currency": "NGN",
                "duration": "2 Months",
                "level": "Beginner",
                "instructor": "WISNOTECH Team",
                "image": "https://images.unsplash.com/photo-1739300293396-9ad79111c8e4?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Design",
                "curriculum": ["Design Principles", "Color Theory & Typography", "Figma Mastery", "Adobe XD & Photoshop", "Logo & Brand Identity", "UI Design Patterns", "UX Research & Testing", "Portfolio Creation"],
                "highlights": ["Industry tools training", "10+ design projects", "Certificate on completion", "Freelancing guidance"],
                "students_count": 28,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "course_id": "course_video01",
                "title": "Video Editing & Production",
                "slug": "video-editing",
                "description": "Learn professional video editing with Premiere Pro, After Effects, and DaVinci Resolve.",
                "long_description": "Master the art of video production from shooting to final edit. Learn industry-standard tools like Adobe Premiere Pro, After Effects, and DaVinci Resolve. Create content for YouTube, social media, and professional productions.",
                "price": 150000.00,
                "currency": "NGN",
                "duration": "2 Months",
                "level": "Beginner",
                "instructor": "WISNOTECH Team",
                "image": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Media",
                "curriculum": ["Video Production Basics", "Adobe Premiere Pro", "After Effects Animation", "DaVinci Resolve", "Color Grading", "Audio Editing", "Social Media Content", "Client Projects"],
                "highlights": ["Professional editing skills", "5+ video projects", "Certificate on completion", "Studio access"],
                "students_count": 15,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "course_id": "course_marketing01",
                "title": "Digital Marketing",
                "slug": "digital-marketing",
                "description": "Master SEO, social media marketing, Google Ads, and grow any business online.",
                "long_description": "Become a digital marketing expert. Learn how to drive traffic, generate leads, and grow businesses using SEO, social media, email marketing, and paid advertising. Build campaigns that deliver real results.",
                "price": 150000.00,
                "currency": "NGN",
                "duration": "2 Months",
                "level": "Beginner",
                "instructor": "WISNOTECH Team",
                "image": "https://images.unsplash.com/photo-1739303987830-ca19742b19bc?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Marketing",
                "curriculum": ["SEO Fundamentals", "Social Media Strategy", "Google Ads & Analytics", "Email Marketing", "Content Strategy", "Brand Building", "Analytics & Reporting", "Campaign Management"],
                "highlights": ["Real campaign experience", "Google certification prep", "Certificate on completion", "Agency insights"],
                "students_count": 22,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "course_id": "course_content01",
                "title": "Content Creation",
                "slug": "content-creation",
                "description": "Create engaging content for social media, blogs, and digital platforms.",
                "long_description": "Learn the art and science of content creation. From writing compelling copy to creating visual content, this course covers everything you need to become a successful content creator. Master tools for photography, writing, and social media management.",
                "price": 100000.00,
                "currency": "NGN",
                "duration": "6 Weeks",
                "level": "Beginner",
                "instructor": "WISNOTECH Team",
                "image": "https://images.unsplash.com/photo-1651796704084-a115817945b2?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Media",
                "curriculum": ["Content Strategy", "Copywriting Essentials", "Photography Basics", "Social Media Management", "Blog Writing", "Video Content", "Analytics", "Monetization"],
                "highlights": ["Build your brand", "Content portfolio", "Certificate on completion", "Networking events"],
                "students_count": 18,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.courses.insert_many(courses)
        logger.info("Seeded 6 courses")

    # Seed blog posts
    blog_count = await db.blog_posts.count_documents({})
    if blog_count == 0:
        posts = [
            {
                "post_id": "post_001",
                "title": "Why Every Nigerian Youth Should Learn Digital Skills in 2026",
                "slug": "why-learn-digital-skills-2026",
                "excerpt": "The digital economy is booming. Here's why now is the best time to invest in your tech skills.",
                "content": "The Nigerian digital economy is experiencing unprecedented growth. With over 100 million internet users, the demand for skilled tech professionals has never been higher. From web development to digital marketing, the opportunities are endless. At WISNOTECH, we've seen firsthand how digital skills transform lives. Our graduates are building successful careers, launching startups, and creating solutions that impact communities. Whether you're a fresh graduate or looking to switch careers, digital skills are your gateway to financial independence. The key is starting now—the industry moves fast, and those who invest in learning today will lead tomorrow.",
                "image": "https://images.unsplash.com/photo-1739300293396-9ad79111c8e4?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Career",
                "author": "WISNOTECH",
                "published": True,
                "created_at": "2026-01-15T10:00:00+00:00"
            },
            {
                "post_id": "post_002",
                "title": "Web Development vs Mobile Development: Which Should You Learn?",
                "slug": "web-vs-mobile-development",
                "excerpt": "Choosing between web and mobile development? We break down the pros, cons, and career prospects.",
                "content": "One of the most common questions we get at WISNOTECH is: Should I learn web development or mobile app development? The answer depends on your goals. Web development offers broader opportunities—every business needs a website. You'll learn HTML, CSS, JavaScript, and frameworks like React. The barrier to entry is lower, and freelancing opportunities are abundant. Mobile development with Flutter lets you build apps for both iOS and Android. The demand is growing rapidly in Nigeria as more businesses need mobile solutions. Our recommendation? Start with web development to build a strong foundation, then expand to mobile. Both paths lead to excellent career opportunities.",
                "image": "https://images.unsplash.com/photo-1753998943918-dd2dfc4ee6ed?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Tech",
                "author": "WISNOTECH",
                "published": True,
                "created_at": "2026-01-10T10:00:00+00:00"
            },
            {
                "post_id": "post_003",
                "title": "5 Design Principles Every UI/UX Beginner Must Know",
                "slug": "design-principles-beginners",
                "excerpt": "Master these fundamental design principles to create interfaces that users love.",
                "content": "Great design isn't just about making things look pretty—it's about solving problems and creating delightful experiences. Here are 5 essential principles: 1. Hierarchy: Guide users' attention with size, color, and spacing. 2. Consistency: Use the same patterns throughout your design. 3. Whitespace: Give elements room to breathe. Less is more. 4. Contrast: Ensure readability with proper color contrast. 5. Feedback: Every action should have a visible response. These principles form the foundation of everything we teach in our UI/UX & Graphics Design course at WISNOTECH.",
                "image": "https://images.unsplash.com/photo-1651796704084-a115817945b2?crop=entropy&cs=srgb&fm=jpg&q=85",
                "category": "Design",
                "author": "WISNOTECH",
                "published": True,
                "created_at": "2026-01-05T10:00:00+00:00"
            }
        ]
        await db.blog_posts.insert_many(posts)
        logger.info("Seeded 3 blog posts")

    # Create admin user if not exists
    admin_exists = await db.users.find_one({"email": "admin@wisnotech.com"}, {"_id": 0})
    if not admin_exists:
        admin_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": admin_id,
            "name": "WISNOTECH Admin",
            "email": "admin@wisnotech.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "picture": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Created admin user: admin@wisnotech.com / admin123")

# ============ APP SETUP ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
