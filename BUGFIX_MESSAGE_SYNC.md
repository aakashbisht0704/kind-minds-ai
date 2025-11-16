# Bug Fix: Chat Message State Synchronization

## Issue Description
Users experienced two problems when sending chat messages:
1. **First message (new chat)**: Message displayed on screen but AI didn't respond
2. **Second message (existing chat)**: AI responded but the user's message wasn't shown

## Root Cause
The issue was caused by React's asynchronous state updates creating a race condition:

### First Message Problem
1. `createNewChat()` was called, which set `currentChat` via `setCurrentChat(newChat)`
2. State update happened asynchronously
3. When AI response arrived, `addMessage(response, 'assistant')` was called
4. Inside `addMessage()`, the check `if (!currentChat) return;` failed because state hadn't updated yet
5. **Result**: AI response was lost

### Second Message Problem  
1. `addMessage(userMessage, 'user')` was called
2. State updated asynchronously
3. The message array being sent to backend used stale `currentChat.messages`
4. Timing issues with state synchronization

## Solution
Modified the chat context and input handling to use explicit chat IDs instead of relying on state:

### Changes Made

1. **ChatContext.tsx** - Updated `addMessage` function:
   - Added optional `chatId` parameter
   - Function now accepts: `addMessage(content, role, chatId?)`
   - Uses provided `chatId` or falls back to `currentChat?.id`
   - Updates chat by ID in the `chats` array instead of relying on `currentChat` state
   - Updates `currentChat` state only if it matches the target chat ID

2. **ChatInputDock.tsx** - Updated message sending logic:
   - Stores reference to `activeChat` object (returned from `createNewChat` or current `currentChat`)
   - Passes explicit `activeChat.id` when calling `addMessage()` for both user and AI messages
   - Ensures messages always go to the correct chat regardless of state update timing

## Benefits
- ✅ Messages are always added to the correct chat
- ✅ No dependency on async state updates
- ✅ Eliminates race conditions
- ✅ Works reliably for both new and existing chats
- ✅ AI responses are never lost

## Testing Recommendations
1. Send first message in a new chat - verify both user message and AI response appear
2. Send second message in existing chat - verify both user message and AI response appear
3. Rapidly send multiple messages - verify all messages appear in correct order
4. Switch between Academic and Mindfulness tabs - verify messages go to correct chat

