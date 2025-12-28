# Spur AI Support Agent - Take-Home Assignment

A robust, full-stack AI support agent for a live chat widget, built as part of the Spur founding engineer take-home assignment.

> [!NOTE]
> The backend for the deployed version is running on a free instance. It may spin down after a few minutes of inactivity, causing the first message to take a few seconds to process as the server "wakes up". This is a limitation of the free hosting and not an architectural trade-off.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** database (Local instance or remote e.g., Supabase/Render)
- **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Update `DATABASE_URL` with your PostgreSQL connection string.
   - Set `GEMINI_API_KEY` with your API key.
4. Setup Database (Prisma):
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:3000`.*

### 2. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Ensure `VITE_BACKEND_API_URL` is set correctly (default: `http://localhost:3000/api`).
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

---

## 🏗️ Architecture Overview

The project follows a clean, modular architecture:

### Backend (Node.js + TypeScript + Express)
- **Routes**: Define the API endpoints (`/api/chat/message`, `/api/chat/history/:sessionId`).
- **Controllers**: Handle incoming requests, validation, and orchestrate services.
- **Services**:
    - `db.ts`: Manages data persistence using Prisma ORM.
    - `llm.ts`: Encapsulates the Google Gemini API integration and prompt logic.
- **Data Model**: Uses PostgreSQL with two main models: `Conversation` (sessions) and `Message` (chat history).

### Frontend (React + TypeScript + Vite)
- **ChatWidget**: A self-contained, responsive component managing chat state, UI, and backend communication.
- **Persistence**: Uses `localStorage` to keep the `sessionId` persistent across page reloads.
- **Rich Text**: Supports Markdown in AI responses via `react-markdown`.

---

## 🧠 LLM Integration & Prompting

- **Provider**: Google Gemini (`gemma-2-27b-it`).
- **Context Management**:
    - The backend retrieves the last 10 messages of the conversation history for every LLM call to maintain context.
    - A **System Prompt** defines the persona of "Spur Store" support agent.
- **Domain Knowledge**: Knowledge about shipping, returns, products, and support hours is seeded directly into the system prompt for reliable answering.
- **Guardrails**:
    - Input validation for empty or excessively long messages.
    - Graceful error handling for API timeouts or failures, returning friendly messages to the user.
    - `maxOutputTokens` limit to control costs.

---

## 🛠️ Trade-offs & "If I Had More Time..."

### Trade-offs
- **Gemini over OpenAI/Claude**: Chosen for its generous free tier and ease of setup for this exercise.
- **LocalStorage Session**: Simple and effective for a "no-auth" requirement, though a proper JWT-based auth would be better for a production product.
- **Basic Styling**: Used Vanilla CSS to keep the bundle size small and avoid heavy design system overhead, while maintaining a clean look.

### If I Had More Time...
- **WebSockets**: Implement real-time "typing..." indicators and instant message delivery.
- **RAG (Retrieval-Augmented Generation)**: Instead of hardcoding domain knowledge in the prompt, store FAQ data in a vector DB for better scalability.
- **Testing**: Add Jest/Supertest for backend integration tests and Playwright for E2E frontend testing.
- **Streaming**: Implement streaming responses from the LLM for a better UX.
- **Advanced Guardrails**: Use a library like `zod` more extensively for validation and implement PII filtering.
