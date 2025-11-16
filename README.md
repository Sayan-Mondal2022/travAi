# TravAI

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


## 🧾 Prerequisites
Before running this project, please make sure the required tools and technologies are installed.  
➡️ [View Full Prerequisites](./PREREQUISITES.md)

## 🌍 Key Features
- 🧠 **AI-Powered Travel Assistant** – Generates personalized itineraries using natural language input.  
- 🗺️ **Dynamic Itinerary Generation** – Adjusts trip details based on user preferences and time.  
- 💬 **Conversational Interface** – Built using Dialogflow for human-like chatbot interactions.  
- 🌦️ **Real-Time Updates** – Fetches weather, routes, and local recommendations dynamically.  
- 💾 **Hybrid Database Design** – MySQL for user details, MongoDB for trip data, Redis for caching.  
- 🚀 **Cross-Platform Support** – Works seamlessly on both web and mobile.  


## 🛠️ Installation & Setup

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

Thanks to these amazing people for their contributions!  

<a href="https://github.com/sayan-mondal2022/travAi/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sayan-mondal2022/travAi" />
</a>


## 🙏 Acknowledgement

This project was built using several open-source technologies and APIs that made development efficient and scalable.

Special thanks to:
- **Node.js**, **Next.js**, and **React Native** for the powerful frontend ecosystem  
- **Django** for the robust backend architecture  
- **MySQL**, **MongoDB**, and **Redis** for reliable data storage and caching  
- **Dialogflow** and **Google APIs** for enabling natural conversations and real-time data access  


<h2 align="center">❤️ Thank You</h2>

<p align="center">
  Thank you for checking out <b>TravAi</b>! <br>
  Your interest and support mean a lot to us. <br><br>
  If you found this project helpful, don’t forget to ⭐ <b>star the repository</b> and share it with others who love AI and travel! 🌍✨
</p>


