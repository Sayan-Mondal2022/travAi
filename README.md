# TravAi

**TravAi** is an AI-powered travel assistant that helps users plan personalized trips with dynamic itineraries, real-time updates, and smart recommendations. It simplifies travel by combining route optimization, budgeting, and conversational assistance into one seamless platform.

## 🧭 Project Overview

Planning a trip often means juggling multiple apps for routes, weather, budgets, and bookings — a process that’s time-consuming and fragmented. TravAI was built to solve this.

It’s an AI-powered Trip Planner that simplifies travel by generating smart itineraries, managing budgets, tracking weather, and suggesting nearby essentials like restaurants, petrol bunks, and hospitals — all in one place.

With its AI Travel Assistant, TravAI offers natural language trip planning, real-time translation, and personalized recommendations, helping users travel smarter, safer, and stress-free across both web and mobile platforms.

## 🧠 Tech Stack

- **Frontend:** Next.js (*Web*), React Native (*Mobile*), Tailwind CSS  
- **Backend:** Django (*Python*)  
- **Databases:** MySQL (*User Data*), MongoDB (*Trip Data*), Redis (*Caching & Token Management*)  
- **APIs & AI Services:** Google Places API, Google Weather API, Google Gemini API, Hugging Face API, Google Dialogflow  
- **Deployment & DevOps:** Docker, Kubernetes (*Cloud Deployment*)  
- **Version Control:** Git & GitHub


## 🛠️ Installation & Setup

### Prerequisites

- Node.js 
- Python 
- Git
- npm (Node package manager)
- pip (Python package manager)
- Any Preferred Code Editor
- MongoDB (For Trip Details)
- MySQL (For User Details)
- Redis (For Caching Trip details)
- Ngrok (To expose Local Servers, mainly using for Network Tunneling)
- Dialogflow (To build a Conversational UI like a Chatbot)

1. **Clone or Pull the repository**

    ```bash
    git clone https://github.com/your-username/travAi.git
    cd travAi
    
    # If Cloned or the Project already exist then
    git pull
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

- 📍 Frontend will be available at: [`http://localhost:3000`](http://localhost:3000)

3. **Install dependencies for Backend**
    
    ```bash
    # Navigate to backend directory
    cd backend

    # Create virtual environment
    python -m venv .venv
    or
    # For Python 3 specific
    python3 -m venv .venv
    
    # Activate virtual environment
    # On Windows (PowerShell):
    .\.venv\Scripts\activate
    or
    # On Windows (Using Git Bash):
    source .venv/Scripts/activate
    
    # On macOS/Linux:
    source .venv/bin/activate

    
    # Install Python dependencies
    pip install -r requirements.txt
    or
    # If using Mac or Linux:
    pip3 install -r requirements.txt
    
    
    # Start backend server
    cd projectBackend   # Then start the server
    py manage.py runserver
    ```

- 📍 Backend will be available at: [`http://localhost:8000`](http://127.0.0.1:8000)

4. **Environment Variables**

- Frontend (frontend/.env.local)

    ```bash
    NEXT_PUBLIC_API_URL=http://localhost:8000
    NEXT_PUBLIC_APP_NAME=TravAi
    ```

- Backend (backend/.env)

    ```bash
    # For getting the Places, Weather, etc.
    GOOGLE_API_KEY=GOOGLE_API_KEY

    # For storing the USER details in DB
    SQL_PASSWORD=MYSQL_PASSWORD

    # For itinerary generation
    HUGGING_FACE_API=HUGGING_FACE_API_KEY
    GEMINI_API_KEY=GEMINI_API_KEY
    ```

5. **MySQL Database Setup**

- Create a new database named `USER_DB` and a new user named `root` within MySQL 
    
  ```bash
  -- Create the database
  CREATE DATABASE USER_DB;

  -- Create the user (replace 'host' with 'localhost' or specific host)
  CREATE USER 'root'@'localhost' IDENTIFIED BY 'MYSQL_PASSWORD';

  -- Grant privileges to the user for the database
  GRANT ALL PRIVILEGES ON USER_DB.* TO 'root'@'localhost';

  -- Apply the privilege changes
  FLUSH PRIVILEGES;
  ```


## 👥 Contributors

- **Sayan Mondal**  
- **Pavithra**  
- **Shailini**  
- **Ajay**
