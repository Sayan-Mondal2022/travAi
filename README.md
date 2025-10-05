# An AI Trip Planner
AI Trip Planner is an intelligent tool that creates personalized travel plans and itineraries based on user preferences.

---

## 🤝 For Contribution

We love your input! We want to make contributing to TravAi as easy and transparent as possible.

### 🚀 Getting Started

#### First Time Setup
```bash
# Clone the repository
git clone https://github.com/Sayan-Mondal2022/travAi.git
cd travAi

# Set up frontend (Terminal 1)
cd frontend
npm install

# Set up backend (Terminal 2)
cd backend
pip install -r requirements.txt

```

### For Existing Contributors

```bash
# Always pull latest changes before starting
git pull origin main

# Install any new dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Git
- npm or yarn
- pip (Python package manager)
- Any Preferred Code Editor
- MongoDB (For Trip Details)
- MySQL (For User Details)
- Ngrok (To expose Local Servers, mainly using for Network Tunneling)
- Dialogflow (To build a Conversational UI like a Chatbot)

1. **Clone the repository**

```bash
git clone https://github.com/your-username/travAi.git
cd travAi
```

2. **Install dependencies for Frontend**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- 📍 Frontend will be available at: http://localhost:3000

3. **Install dependencies for Backend**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
# or for Python 3 specific
python3 -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\activate
# On Windows (CMD):
venv\Scripts\activate.bat
# On Windows (Using Git Bash):
source venv/Scripts/activate

# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
or
# If using Mac or Linux:
pip3 install -r requirements.txt

# Start backend server
cd projectBackend   # Then start the server
py manage.py runserver
```
- 📍 Backend will be available at: http://localhost:8000 or http://127.0.0.1:8000/

4. **Environment Variables**

- Frontend (frontend/.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TravAi
```

- Backend (backend/.env)

```bash
GOOGLE_API_KEY=****
SQL_PASSWORD=****
```

5. **Database Setup (If Applicable)**

```bash
# Navigate to backend
cd backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
.\venv\Scripts\activate   # Windows

# If using Django
python manage.py migrate
python manage.py createsuperuser
```

---
