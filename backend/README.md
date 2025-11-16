# KindMinds Backend API

Python FastAPI backend for KindMinds chat functionality using Groq AI.

## Setup

1. **Create a virtual environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment variables:**
   The `.env` file should already exist with your Groq API key.

4. **Run the server:**
   
   **Option 1: Using the start script (recommended):**
   ```bash
   ./start.sh
   ```
   This will automatically kill any existing processes on port 8000 and start the server.
   
   **Option 2: Manually:**
   ```bash
   python main.py
   ```
   
   **Option 3: With uvicorn:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /api/chat
Chat with the AI assistant.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "chat_type": "academic"  // or "mindfulness"
}
```

**Response:**
```json
{
  "response": "AI response here"
}
```

## Features

- **Academic Chat**: Helps with studying, homework, time management
- **Mindfulness Chat**: Assists with stress management, meditation, wellness
- **CORS Enabled**: Works with Next.js frontend on any local port
- **Groq AI Integration**: Uses **Llama 3.3 70B Versatile** model for intelligent responses

## AI Model

This backend uses **Llama 3.3 70B Versatile** via Groq API, which provides:
- Fast response times
- High-quality, contextual answers
- Support for long conversations
- Temperature: 0.7 (balanced creativity and accuracy)
- Max tokens: 1024

## Troubleshooting

### "Failed to get response from AI" error
1. Make sure the backend server is running on port 8000
2. Check that your GROQ_API_KEY is set in the `.env` file
3. Verify the API key is valid at https://console.groq.com
4. Use `./start.sh` to restart the server cleanly

### Port 8000 already in use
The `start.sh` script automatically kills existing processes. If you get this error manually, run:
```bash
lsof -ti:8000 | xargs kill -9
```

