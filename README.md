# Voice-Enabled Task Tracker

## 1. Project Setup

### a. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm (v9+) or yarn
- **Database**: SQLite (built-in, no external setup required)
- **API Keys**:
  - `AI_API_KEY`: Key for the LLM provider (e.g., OpenAI/Gemini) used for natural language parsing.

### b. Install Steps

**1. Backend**
```bash
cd backend
npm install
```

**2. Frontend**
```bash
cd frontend
npm install
```

### c. Configure Email Sending/Receiving
The application uses **Nodemailer** for email services.
1. Create a `.env` file in the `backend` directory.
2. Add the following variables:
   ```env
   EMAIL_SERVICE=gmail # or your provider
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-app-specific-password
   ```
   *Note: For development, the system defaults to logging emails to the console if no credentials are provided.*

### d. How to Run Everything Locally
1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Start the Frontend Application**:
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:5173
   ```

### e. Seed Data / Initial Scripts
- The database is automatically initialized on the first run of the backend server.
- To populate with sample data (optional):
  ```bash
  cd backend
  npm run seed
  ```

---

## 2. Tech Stack

- **Frontend**: 
  - **Framework**: React (Vite)
  - **Styling**: Tailwind CSS (for modern, responsive design)
  - **State Management**: React Context / Hooks
  - **Voice Input**: Web Speech API (Browser native)

- **Backend**: 
  - **Runtime**: Node.js
  - **Framework**: Express.js
  - **Database**: SQLite (with Sequelize/Prisma ORM)
  - **Validation**: Zod / Joi

- **AI Provider**: 
  - **Service**: Google Gemini / OpenAI (configurable)
  - **Purpose**: Parsing natural language voice transcripts into structured task data (Title, Due Date, Priority).

- **Email Solution**: 
  - **Library**: Nodemailer
  - **Features**: Sending task reminders, Daily summaries.

---

## 3. API Documentation

### Main Endpoints

#### `POST /api/tasks`
Creates a new task from raw text (voice transcript).
- **Body**: 
  ```json
  { "transcript": "Remind me to submit the report by Friday at 5pm" }
  ```
- **Success Response (201)**:
  ```json
  {
    "id": 1,
    "title": "Submit the report",
    "dueDate": "2024-12-08T17:00:00.000Z",
    "priority": "normal",
    "status": "pending"
  }
  ```
- **Error Response (400)**:
  ```json
  { "error": "Could not parse task details" }
  ```

#### `GET /api/tasks`
Retrieves all tasks.
- **Query Params**: `?status=pending` (optional)
- **Success Response (200)**:
  ```json
  [
    { "id": 1, "title": "...", ... }
  ]
  ```

#### `PUT /api/tasks/:id`
Updates a task (e.g., mark as done).
- **Body**: `{ "status": "completed" }`
- **Success Response (200)**: Updated task object.

---

## 4. Decisions & Assumptions

### a. Key Design Decisions
- **Voice Processing**: Decided to use the **Web Speech API** on the frontend instead of sending audio blobs to the backend. This reduces bandwidth, improves latency, and respects user privacy by not storing raw audio.
- **AI Task Parsing**: The backend acts as an agent that takes the raw string and asks an LLM to "extract JSON". This creates a flexible interface where users can speak naturally.
- **SQLite Database**: Chosen for the assignment to ensure the project is easy to run locally without requiring the user to install PostgreSQL or MongoDB.

### b. Assumptions
- **Email**: Assumed that for the purpose of this assignment, logging email content to the server console is acceptable if valid SMTP credentials are not provided.
- **Language**: English is the primary language supported for voice recognition and parsing.
- **Single User**: The current iteration assumes a single-user environment (no complex authentication implementation required for the demo, though structure allows for it).

---

## 5. AI Tools Usage

### a. Tools Used
- **Google Deepmind Agent**: As the primary pair programmer/assistant.

### b. How they helped
- **Scaffolding**: Quickly set up the project structure (Frontend/Backend folders).
- **Documentation**: Generated this README based on the requirements.
- **Boilerplate**: Wrote the initial Express server code and React hooks for voice recognition.

### c. Notable Prompts/Approaches
- "Create a README structure for an SDE assignment with these specific sections."
- "Scaffold a React app with Tailwind and an Express backend."

### d. What was learned
- Leveraging AI for "boring" setup tasks (configs, basic CRUD) allows focusing on the core logic (Voice-to-JSON parsing) immediately.
