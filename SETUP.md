# KindMinds - Setup Guide

## 🎯 Chat Integration Complete!

The chat feature is now integrated with Groq AI for both Academic and Mindfulness tabs.

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)
```bash
./start-dev.sh
```

### Option 2: Manual startup

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📝 Testing the Chat

1. **Start both servers** (backend on port 8000, frontend on port 3000)

2. **Navigate to Academic or Mindfulness page**
   - Academic: http://localhost:3000/academic
   - Mindfulness: http://localhost:3000/mindfulness

3. **Start chatting!**
   - Type a message in the chatbox at the bottom
   - Press Enter or click the send button
   - The AI will respond based on the page type:
     - **Academic**: Study help, homework, time management
     - **Mindfulness**: Stress relief, meditation, wellness

## 🔑 Features

### Academic Chat Assistant
- Study techniques and learning strategies
- Homework help and explanations
- Time management and productivity tips
- Test preparation guidance
- Subject-specific help

### Mindfulness Chat Assistant
- Stress management techniques
- Meditation and breathing guidance
- Emotional wellness support
- Building positive habits
- Anxiety management

## 🛠 Technical Details

- **Backend**: Python FastAPI with Groq AI (Llama 3.3 70B)
- **Frontend**: Next.js 15 with TypeScript
- **API Endpoint**: `POST http://localhost:8000/api/chat`
- **Chat Context**: Maintains conversation history
- **Real-time**: Instant AI responses

## 🔧 Troubleshooting

**Chat not responding?**
1. Check if backend is running: `http://localhost:8000/`
2. Check browser console for errors
3. Verify `.env` files exist with proper API keys

**Backend errors?**
1. Activate virtual environment: `source backend/venv/bin/activate`
2. Check Groq API key in `backend/.env`
3. Reinstall dependencies: `pip install -r backend/requirements.txt`

## 📁 Project Structure

```
kindminds_website/
├── backend/
│   ├── main.py              # FastAPI backend
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Groq API key
│   └── venv/               # Virtual environment
├── src/
│   └── app/
│       ├── components/
│       │   ├── ChatInputDock.tsx  # Chat input with AI integration
│       │   └── ChatDisplay.tsx    # Chat message display
│       └── contexts/
│           └── ChatContext.tsx    # Chat state management
├── .env.local              # Next.js environment variables
└── start-dev.sh           # Startup script
```

## 🎨 Next Steps

The basic chat integration is complete! You can now:
- Test conversations in both modes
- Customize AI personalities in `backend/main.py`
- Add more features like file uploads
- Integrate with Supabase for chat history
- Add voice input/output

Enjoy your AI-powered KindMinds! 🧠✨

