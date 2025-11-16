# KindMinds Changelog

## Latest Changes - Chat Separation Feature

### ✅ What's New

**Separate Chat Histories for Academic and Mindfulness Tabs**

Your chats are now completely separated based on whether you're in the Academic or Mindfulness tab:

- **Academic Tab** (`/academic`): Only shows academic-related chats with 📚 icon
- **Mindfulness Tab** (`/mindfulness`): Only shows mindfulness chats with 🧘 icon

### 🎯 How It Works

1. **Automatic Switching**: When you navigate between tabs, the app automatically:
   - Shows only chats of that tab's type
   - Switches to the first available chat of that type
   - Shows the hero section if no chats exist yet

2. **Visual Indicators**:
   - Sidebar header shows which type of chat you're viewing
   - Chat count displayed for each type (e.g., "📚 Academic Chats (3)")
   - Empty state message when no chats exist

3. **Independent Chat Creation**:
   - Creating a chat in Academic tab → creates an academic chat
   - Creating a chat in Mindfulness tab → creates a mindfulness chat
   - Each chat remembers its type permanently

### 📝 Example Use Case

**Scenario**: You have 5 chats total
- 3 academic chats (homework help, study planning, test prep)
- 2 mindfulness chats (meditation guidance, stress management)

**What you see**:
- In Academic tab: Only the 3 academic chats
- In Mindfulness tab: Only the 2 mindfulness chats
- Each tab maintains its own conversation history

### 🔧 Technical Changes

**Modified Files**:
1. `src/app/contexts/ChatContext.tsx`
   - Added `getFilteredChats()` function
   - Added `setCurrentChatByType()` function
   
2. `src/app/components/Sidebar.tsx`
   - Added chat type header with emoji icons
   - Added chat count display
   - Added empty state message
   
3. `src/app/(pagesLayout)/academic/page.tsx`
   - Auto-switches to academic chat type on mount
   
4. `src/app/(pagesLayout)/mindfulness/page.tsx`
   - Auto-switches to mindfulness chat type on mount

### 🚀 Backend (Llama3 Integration)

**AI Model**: Llama 3.3 70B Versatile via Groq API

**Features**:
- Fast response times
- Context-aware conversations
- Separate system prompts for each chat type
- Temperature: 0.7 (balanced creativity)
- Max tokens: 1024

**Endpoints**:
- `GET /` - Health check
- `POST /api/chat` - Chat with AI

**Start Backend**:
```bash
cd backend
./start.sh
```

Or use the unified start script:
```bash
./start-dev.sh
```

### 📦 Storage

- All chats stored in browser's `localStorage`
- Key: `kindminds-chats`
- Chats persist across browser sessions
- Each chat has a `type` field: `'academic' | 'mindfulness'`

### 🐛 Bug Fixes

- Fixed backend server not starting properly
- Added automatic process cleanup on port 8000
- Improved error handling for AI connection failures

### 📚 Documentation

New documentation files:
- `CHAT_FEATURES.md` - Detailed chat separation documentation
- `backend/start.sh` - Easy backend startup script
- Updated `backend/README.md` with Llama3 details

---

**Date**: October 9, 2025
**Version**: 1.1.0

