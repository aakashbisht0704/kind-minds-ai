# KindMinds Chat Features

## Chat Separation by Type

The KindMinds application now has **completely separated chat histories** for Academic and Mindfulness tabs.

### How It Works

1. **Separate Chat Storage**: 
   - Academic chats are only visible in the Academic tab
   - Mindfulness chats are only visible in the Mindfulness tab
   - Both types are stored in the same localStorage but filtered by type

2. **Automatic Switching**:
   - When you switch from Academic to Mindfulness tab (or vice versa), the current chat automatically switches to match the tab type
   - If there are no chats of that type, the hero section is displayed

3. **Visual Indicators**:
   - The sidebar shows a header indicating which type of chats you're viewing
   - Chat count is displayed for each type
   - Empty state message when no chats exist for a tab

### User Experience

#### Academic Tab (`/academic`)
- Shows only academic chats with the 📚 icon
- Creates new academic chats when you start a conversation
- AI uses the academic system prompt (study help, homework, time management)

#### Mindfulness Tab (`/mindfulness`)
- Shows only mindfulness chats with the 🧘 icon
- Creates new mindfulness chats when you start a conversation
- AI uses the mindfulness system prompt (stress management, meditation, wellness)

### Technical Implementation

#### Components Modified:
1. **ChatContext.tsx**: Added `getFilteredChats()` and `setCurrentChatByType()` functions
2. **Sidebar.tsx**: Enhanced to show chat type header and count
3. **academic/page.tsx**: Auto-switches to academic chat type on mount
4. **mindfulness/page.tsx**: Auto-switches to mindfulness chat type on mount

#### Key Functions:

```typescript
// Filter chats by type
const getFilteredChats = (type: 'academic' | 'mindfulness') => {
    return chats.filter(chat => chat.type === type);
};

// Automatically switch current chat when changing tabs
const setCurrentChatByType = (type: 'academic' | 'mindfulness') => {
    if (currentChat && currentChat.type !== type) {
        const chatsOfType = chats.filter(chat => chat.type === type);
        if (chatsOfType.length > 0) {
            setCurrentChat(chatsOfType[0]); // Switch to first chat of that type
        } else {
            setCurrentChat(null); // Clear chat and show hero
        }
    }
};
```

### Benefits

✅ **Better Organization**: Keep academic and mindfulness conversations separate
✅ **Context Preservation**: Each chat type maintains its own context and history
✅ **Clear Navigation**: Easy to see which type of chat you're in
✅ **No Confusion**: Can't accidentally mix academic questions in mindfulness chats

### Storage

- All chats are stored in `localStorage` under `kindminds-chats`
- Each chat object has a `type` field: `'academic' | 'mindfulness'`
- Chats persist across browser sessions
- Deleting a chat removes it from storage permanently

