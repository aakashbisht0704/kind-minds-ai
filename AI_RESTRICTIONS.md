# KindMinds AI Restrictions

## Overview
The AI assistants are now **strictly limited** to their specific domains. They will politely refuse to answer questions outside their scope.

---

## 📚 Academic Assistant

### ✅ WILL Answer Questions About:
- Study techniques and learning strategies
- Homework help and explanations
- Time management and productivity for studies
- Test preparation and study planning
- Subject-specific guidance (math, science, history, languages, etc.)
- Learning disabilities and study accommodations
- Academic goal setting and planning

### ❌ WILL REFUSE Questions About:
- General trivia or entertainment
- Coding/programming (unless for an academic course)
- News, politics, or current events
- Shopping or product recommendations
- Dating or relationship advice
- Medical advice or diagnosis
- Legal advice
- Any non-academic topics

### Refusal Message:
> "I'm KindMinds Academic Assistant. I'm specifically designed to help with studying, learning, and academic success. For this type of question, please try a general-purpose AI. Is there anything about your studies I can help you with?"

---

## 🧘 Mindfulness Assistant

### ✅ WILL Answer Questions About:
- Stress management and relaxation techniques
- Mindfulness practices and meditation guidance
- Emotional well-being and self-care
- Building positive habits and resilience
- Managing anxiety and promoting calm
- Breathing exercises and grounding techniques
- Work-life balance and mental health
- Sleep hygiene and relaxation
- Dealing with academic stress and burnout

### ❌ WILL REFUSE Questions About:
- General trivia or entertainment
- Coding/programming
- News, politics, or current events
- Shopping or product recommendations
- Dating or relationship advice (unless related to emotional wellness)
- Medical diagnosis or prescription advice
- Legal advice
- Academic homework or study help
- Any non-wellness topics

### Refusal Message:
> "I'm KindMinds Mindfulness Assistant. I'm specifically designed to help with stress management, meditation, and mental wellness. For this type of question, please try a general-purpose AI or switch to the Academic tab for study help. Is there anything about your mental wellness or mindfulness practice I can help you with?"

---

## 🧪 Test Cases

### Academic Tab - Should Answer:
- ✅ "How can I improve my math skills?"
- ✅ "What are the best study techniques for memorizing?"
- ✅ "Can you help me understand photosynthesis?"
- ✅ "How do I manage my time better for studying?"

### Academic Tab - Should Refuse:
- ❌ "What's the weather like today?"
- ❌ "Tell me a joke"
- ❌ "Who won the football game?"
- ❌ "What should I cook for dinner?"

### Mindfulness Tab - Should Answer:
- ✅ "How can I reduce stress before exams?"
- ✅ "Can you guide me through a breathing exercise?"
- ✅ "I'm feeling anxious, what should I do?"
- ✅ "How do I improve my sleep quality?"

### Mindfulness Tab - Should Refuse:
- ❌ "Help me with my calculus homework"
- ❌ "What's the capital of France?"
- ❌ "Write me a story"
- ❌ "What's the best laptop to buy?"

---

## 🔄 How It Works

The restrictions are enforced through **system prompts** in the backend (`backend/main.py`):

```python
system_prompts = {
    "academic": "You are an AI academic assistant for KindMinds. Your ONLY purpose is to help students with academic and educational topics...",
    "mindfulness": "You are an AI mindfulness and mental wellness assistant for KindMinds. Your ONLY purpose is to help users with mental wellness..."
}
```

The AI model (Llama 3.3 70B) follows these instructions strictly and will refuse off-topic questions.

---

## 🎯 Benefits

✅ **Focused Assistance**: Users get specialized help in their specific area of need
✅ **No Distractions**: AI won't engage in off-topic conversations
✅ **Clear Boundaries**: Users know exactly what each assistant can help with
✅ **Better Experience**: Specialized knowledge in each domain
✅ **Professional**: Maintains a focused, educational environment

---

## 📝 Notes

- The AI will be polite when refusing questions
- It will suggest alternatives (general-purpose AI or switching tabs)
- Cross-domain questions (e.g., "How to manage exam stress?") can be answered by the Mindfulness assistant as it relates to wellness
- Academic stress and burnout ARE covered by the Mindfulness assistant

---

**Updated**: October 9, 2025
**Backend**: Llama 3.3 70B Versatile via Groq API

