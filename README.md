# 🤖 AI Interview Engine

An AI-powered interview preparation platform that analyzes a candidate's **resume, job description, and self-description** to generate a personalized interview report.

The platform uses Generative AI to evaluate the candidate's profile, generate interview questions, identify skill gaps, and create a personalized **7-day preparation roadmap**.

---

## 🚀 Features

* 🔐 User Authentication

  * Register / Login / Logout
  * JWT-based authentication
  * HTTP-only cookies
  * Protected routes

* 📄 Resume Upload

  * Upload resume for AI analysis
  * Resume-based interview preparation

* 💼 Job Description Analysis

  * Analyze job requirements
  * Compare candidate skills with the target role

* 🤖 AI-Powered Interview Analysis

  * Candidate-job match score
  * Technical interview questions
  * Behavioral interview questions
  * Question intention and expected answer
  * Skill gap identification
  * Personalized preparation roadmap

* 📊 Interview Reports

  * Save generated reports
  * View previous interviews
  * View detailed interview report
  * Latest interviews displayed first

* 🧠 Personalized Preparation

  * Identifies missing or weak skills
  * Provides a 7-day preparation plan
  * Focuses preparation according to the target job role

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Context API
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Cookie Parser
* Multer
* CORS

### AI

* Google Gemini API
* `@google/genai`
* Zod
* Zod-to-JSON-Schema

### Development & Deployment

* Git
* GitHub
* Vite
* Nodemon
* Environment Variables

---

## 🏗️ Project Architecture

```text
AI Interview Engine
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── context
│   │   ├── hooks
│   │   └── services
│   │
│   └── package.json
│
└── backend
    ├── src
    │   ├── controllers
    │   ├── routes
    │   ├── models
    │   ├── middleware
    │   ├── services
    │   ├── config
    │   └── app.js
    │
    ├── server.js
    └── package.json
```

---

## 🔄 How It Works

```text
User
  │
  ├── Upload Resume
  │
  ├── Enter Job Description
  │
  └── Enter Self Description
          │
          ▼
    Backend API
          │
          ▼
     Gemini AI
          │
          ▼
   AI Interview Analysis
          │
          ├── Match Score
          ├── Technical Questions
          ├── Behavioral Questions
          ├── Skill Gaps
          └── 7-Day Roadmap
          │
          ▼
      MongoDB
          │
          ▼
   Interview Report UI
```

---

## 📋 Generated Interview Report

Each interview report contains:

### Match Score

Evaluates how closely the candidate's profile matches the provided job description.

### Technical Questions

Generates **5 technical questions** based on:

* Job requirements
* Candidate resume
* Candidate skills
* Target technologies

Each question contains:

* Question
* Intention
* Expected Answer

### Behavioral Questions

Generates **3 behavioral questions** relevant to the candidate and target role.

### Skill Gaps

Identifies skills that require improvement.

Each skill gap contains:

* Skill
* Severity
* Type

### 7-Day Preparation Roadmap

Creates a personalized preparation plan covering:

* Day
* Focus
* Tasks

---

## 🔑 API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/get-me
```

### Interview

```text
POST /api/interview/generate
GET  /api/interview
GET  /api/interview/report/:interviewId
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

> Never commit your `.env` file to GitHub.

Add this to `.gitignore`:

```text
node_modules
.env
```

---

## 💻 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-interview-engine.git
```

```bash
cd ai-interview-engine
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create the `.env` file and add the required environment variables.

Start the backend:

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:3000
```

---

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## 🔒 Authentication & Security

The application uses:

* JWT authentication
* HTTP-only cookies
* Protected backend routes
* Authentication middleware
* Token blacklist for logout
* CORS configuration
* Environment variables for secrets

---

## 🎯 Use Case

AI Interview Engine is designed for students and developers preparing for technical interviews.

Instead of following a generic preparation plan, candidates can provide a specific job description and their resume to receive preparation focused on the actual role requirements.

For example:

```text
Job Role:
Software Engineer

Input:
Resume + Job Description + Self Description

Output:
✓ Match Score
✓ Technical Questions
✓ Behavioral Questions
✓ Skill Gaps
✓ 7-Day Preparation Roadmap
```

---

## 🔮 Future Improvements

* 🎤 AI-powered mock interview
* 🗣️ Voice-based interview
* 📈 Interview performance tracking
* 📄 AI Resume Generator
* 🎯 Job-specific resume optimization
* 💬 Real-time AI interviewer
* 📊 Advanced analytics dashboard
* 🔗 Job portal integrations
* 🧠 Adaptive interview difficulty

---

## 👨‍💻 Author

**Ashish Rawat**

BTech Student | Software Developer | AI & Full-Stack Enthusiast

---

## ⭐ Project

If you find this project useful, consider giving it a ⭐ on GitHub.
