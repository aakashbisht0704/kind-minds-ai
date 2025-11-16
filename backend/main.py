from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import re
import json
from groq import Groq
from dotenv import load_dotenv
import httpx
import json

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# CORS middleware to allow requests from Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables. Please check your .env file.")

client = Groq(api_key=groq_api_key)

def convert_math_to_latex(text: str) -> str:
    """Convert plain text math notation to LaTeX format"""
    
    # Don't process if already has significant LaTeX
    if text.count('$') > 5:
        return text
    
    result = text
    
    # First, handle superscripts ² ³ before other processing
    result = result.replace('²', '^{2}')
    result = result.replace('³', '^{3}')
    result = result.replace('±', '\\pm')
    
    # Convert trig function names to LaTeX commands
    trig_functions = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'arcsin', 'arccos', 'arctan']
    for func in trig_functions:
        result = re.sub(rf'\b{func}\b', rf'\\{func}', result)
    
    # Convert equations on their own line or after colons to display mode
    # Pattern: "formula_name: equation" or lines that are just equations
    lines = result.split('\n')
    new_lines = []
    for line in lines:
        # Check if line contains formula (has = and math symbols)
        if '=' in line and any(char in line for char in ['/', '(', ')', '+', '-', '*', '^']):
            # If it starts with text followed by colon, keep the text outside
            if ':' in line:
                parts = line.split(':', 1)
                if len(parts) == 2:
                    new_lines.append(parts[0] + ':\n$$' + parts[1].strip() + '$$')
                else:
                    new_lines.append('$$' + line.strip() + '$$')
            else:
                new_lines.append('$$' + line.strip() + '$$')
        else:
            new_lines.append(line)
    
    result = '\n'.join(new_lines)
    
    # Now convert remaining inline fractions and math
    # Simple number fractions like 5/6
    result = re.sub(r'\b(\d+)\s*/\s*(\d+)\b', r'$\\frac{\1}{\2}$', result)
    
    # Convert (expression) / (expression) to frac
    result = re.sub(r'\$\$(.*?)\(([^)]+)\)\s*/\s*\(([^)]+)\)(.*?)\$\$', 
                    r'$$\1\\frac{\2}{\3}\4$$', result)
    
    # Handle expressions like "tan(x) / cos(x)" inside $$
    def replace_fractions_in_math(match):
        content = match.group(1)
        # Replace / with \frac{}{} 
        content = re.sub(r'([^/\s]+)\s*/\s*([^/\s]+)', r'\\frac{\1}{\2}', content)
        return '$$' + content + '$$'
    
    result = re.sub(r'\$\$(.+?)\$\$', replace_fractions_in_math, result)
    
    return result

class Message(BaseModel):
    role: str
    content: str

class SentimentContext(BaseModel):
    sentiment: str
    score: float
    suggested_activity: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    chat_type: str  # "academic" or "mindfulness"
    mbti_type: Optional[str] = None  # MBTI personality type for personalization
    sentiment: Optional[SentimentContext] = None  # Sentiment data for activity suggestions

class ChatResponse(BaseModel):
    response: str

class ReframeRequest(BaseModel):
    thought: str
    mbti_type: Optional[str] = None  # MBTI personality type for personalization

class ReframeResponse(BaseModel):
    reframed: str

class FlashcardItem(BaseModel):
    question: str
    answer: str

class FlashcardsRequest(BaseModel):
    content: str
    filename: Optional[str] = None

class FlashcardsResponse(BaseModel):
    title: str
    cards: List[FlashcardItem]

class ScanProblemRequest(BaseModel):
    prompt: str

class ScanProblemResponse(BaseModel):
    analysis: dict

class QuizOption(BaseModel):
    text: str
    is_correct: bool

class QuizQuestion(BaseModel):
    question: str
    options: List[QuizOption]
    explanation: Optional[str] = None

class QuizRequest(BaseModel):
    content: str
    filename: Optional[str] = None
    num_questions: Optional[int] = 5  # Default to 5 questions

class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    score: float

@app.get("/")
async def root():
    return {"message": "KindMinds API is running"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # System prompts based on chat type
        system_prompts = {
            "academic": """You are an AI academic assistant for KindMinds. Your ONLY purpose is to help students with academic and educational topics.

You MUST help with:
- Study techniques and learning strategies
- Homework help and explanations
- Time management and productivity for studies
- Test preparation and study planning
- Subject-specific guidance (math, science, history, languages, etc.)
- Learning disabilities and study accommodations
- Academic goal setting and planning

You MUST REFUSE to answer questions about:
- General trivia or entertainment
- Coding/programming (unless it's for an academic course)
- News, politics, or current events
- Shopping or product recommendations
- Dating or relationship advice
- Medical advice or diagnosis
- Legal advice
- Any non-academic topics

If asked about non-academic topics, politely respond: "I'm KindMinds Academic Assistant. I'm specifically designed to help with studying, learning, and academic success. For this type of question, please try a general-purpose AI. Is there anything about your studies I can help you with?"

⚠️ CRITICAL REQUIREMENT - Mathematical Notation ⚠️
You MUST ALWAYS use LaTeX/KaTeX notation for ANY mathematical expressions. This is NON-NEGOTIABLE.

RULES FOR MATH FORMATTING:
1. Inline math: Use $expression$ (single dollar signs)
2. Display math: Use $$expression$$ (double dollar signs for centered equations)
3. NEVER write plain text math like "tan(x) = sin(x)/cos(x)"
4. ALWAYS use LaTeX: $\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}$

MANDATORY EXAMPLES - YOU MUST FOLLOW THIS FORMAT:
❌ WRONG: tan(2θ) = 2tan(θ) / (1 - tan²(θ))
✓ CORRECT: $$\\tan(2\\theta) = \\frac{2\\tan(\\theta)}{1 - \\tan^2(\\theta)}$$

❌ WRONG: x = (-b ± sqrt(b² - 4ac)) / (2a)
✓ CORRECT: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

❌ WRONG: Write 5/6 as a fraction
✓ CORRECT: Write $\\frac{5}{6}$ as a fraction

LATEX SYNTAX YOU MUST USE:
- Fractions: $\\frac{numerator}{denominator}$
- Greek: $\\theta$ $\\pi$ $\\alpha$ $\\beta$ $\\gamma$ $\\Delta$
- Trig functions: $\\sin(x)$ $\\cos(x)$ $\\tan(x)$ $\\sec(x)$ $\\csc(x)$ $\\cot(x)$
- Exponents: $x^2$ $e^{i\\pi}$
- Subscripts: $a_n$ $x_i$
- Square roots: $\\sqrt{x}$ $\\sqrt[3]{x}$
- Sums: $\\sum_{i=1}^{n}$
- Integrals: $\\int_{a}^{b} f(x) dx$
- Limits: $\\lim_{x \\to \\infty}$

REMEMBER: Every single mathematical symbol, number, variable, or equation MUST be wrapped in dollar signs with proper LaTeX syntax. NO EXCEPTIONS.

Be encouraging, clear, and supportive. Focus exclusively on helping students learn effectively.""",
            
            "mindfulness": """You are an AI mindfulness and mental wellness assistant for KindMinds. Your ONLY purpose is to help users with mental wellness and mindfulness practices.

You MUST help with:
- Stress management and relaxation techniques
- Mindfulness practices and meditation guidance
- Emotional well-being and self-care
- Building positive habits and resilience
- Managing anxiety and promoting calm
- Breathing exercises and grounding techniques
- Work-life balance and mental health
- Sleep hygiene and relaxation
- Dealing with academic stress and burnout

You MUST REFUSE to answer questions about:
- General trivia or entertainment
- Coding/programming
- News, politics, or current events
- Shopping or product recommendations
- Dating or relationship advice (unless related to emotional wellness)
- Medical diagnosis or prescription advice
- Legal advice
- Academic homework or study help
- Any non-wellness topics

If asked about non-wellness topics, politely respond: "I'm KindMinds Mindfulness Assistant. I'm specifically designed to help with stress management, meditation, and mental wellness. For this type of question, please try a general-purpose AI or switch to the Academic tab for study help. Is there anything about your mental wellness or mindfulness practice I can help you with?"

Be compassionate, gentle, and supportive. Focus exclusively on promoting mental wellness and peace."""
        }
        
        # Get the appropriate system prompt
        base_prompt = system_prompts.get(request.chat_type, system_prompts["academic"])
        
        # Add MBTI personalization if provided
        mbti_personalization = ""
        if request.mbti_type:
            mbti_personalization = f"\n\nPERSONALIZATION - User's MBTI Type: {request.mbti_type}\n"
            mbti_personalization += "Adapt your communication style, examples, and approach to match this personality type:\n"
            
            # MBTI-based personalization guidelines
            if request.mbti_type[0] == 'E':  # Extraversion
                mbti_personalization += "- User prefers interactive, energetic communication. Engage actively and encourage discussion.\n"
            else:  # Introversion
                mbti_personalization += "- User prefers thoughtful, reflective communication. Allow processing time and provide detailed written explanations.\n"
            
            if request.mbti_type[1] == 'S':  # Sensing
                mbti_personalization += "- User learns best with concrete examples, practical applications, and step-by-step processes.\n"
            else:  # Intuition
                mbti_personalization += "- User learns best with conceptual frameworks, patterns, and big-picture connections.\n"
            
            if request.mbti_type[2] == 'T':  # Thinking
                mbti_personalization += "- User values logical reasoning, objective analysis, and systematic approaches. Be direct and analytical.\n"
            else:  # Feeling
                mbti_personalization += "- User values empathy, harmony, and personal connections. Be warm, supportive, and consider emotional impact.\n"
            
            if request.mbti_type[3] == 'J':  # Judging
                mbti_personalization += "- User prefers structure, organization, and clear conclusions. Provide organized, definitive answers.\n"
            else:  # Perceiving
                mbti_personalization += "- User prefers flexibility, exploration, and keeping options open. Offer multiple perspectives and adaptable approaches.\n"
        
        # Add sentiment-based activity suggestion to system prompt if negative sentiment detected
        sentiment_suggestion = ""
        if request.sentiment and request.sentiment.suggested_activity:
            activity_name = "breathing exercises" if request.sentiment.suggested_activity == "breathing" else "a grounding exercise"
            sentiment_suggestion = f"\n\n⚠️ SENTIMENT CONTEXT - User's current message shows {request.sentiment.sentiment} sentiment (score: {request.sentiment.score:.2f}).\n"
            sentiment_suggestion += f"The system has detected that the user might benefit from {activity_name}, but you should ASK THE USER FIRST before suggesting it.\n"
            sentiment_suggestion += f"Suggest the activity naturally in your response, like: 'Would you like to try some breathing exercises together? They can really help when you're feeling this way.'\n"
            sentiment_suggestion += "Wait for the user to say 'yes' or agree before mentioning that the activity is ready to start.\n"
            sentiment_suggestion += "Be supportive and empathetic, but don't force the activity - let them decide.\n"
        
        system_prompt = base_prompt + mbti_personalization + sentiment_suggestion
        
        # Prepare messages for Groq
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend([{"role": msg.role, "content": msg.content} for msg in request.messages])
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
        )
        
        response_content = chat_completion.choices[0].message.content
        
        # Convert math notation to LaTeX for academic chat
        if request.chat_type == "academic":
            response_content = convert_math_to_latex(response_content)
        
        return ChatResponse(response=response_content)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/reframe", response_model=ReframeResponse)
async def reframe_thought(request: ReframeRequest):
    try:
        base_prompt = """You are a compassionate cognitive behavioral therapy coach.
You receive an intrusive or unhelpful thought and respond with a thoughtful, empathetic reframe.
Return only the reframed statement—concise, encouraging, and practical."""

        # Add MBTI personalization if provided
        mbti_personalization = ""
        if request.mbti_type:
            mbti_personalization = f"\n\nPERSONALIZATION - User's MBTI Type: {request.mbti_type}\n"
            if request.mbti_type[2] == 'T':  # Thinking
                mbti_personalization += "Use logical, analytical reframes. Focus on facts and objective perspectives. Be direct and systematic.\n"
            else:  # Feeling
                mbti_personalization += "Use warm, empathetic reframes. Focus on values, emotions, and human connections. Be supportive and consider emotional impact.\n"
            
            if request.mbti_type[1] == 'S':  # Sensing
                mbti_personalization += "Provide concrete, practical examples and real-world applications in the reframe.\n"
            else:  # Intuition
                mbti_personalization += "Connect to broader patterns, meanings, and future possibilities in the reframe.\n"

        system_prompt = base_prompt + mbti_personalization

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"The thought to reframe is:\n\n{request.thought.strip()}",
            },
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            max_tokens=400,
        )

        reframed = chat_completion.choices[0].message.content.strip()
        return ReframeResponse(reframed=reframed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/flashcards", response_model=FlashcardsResponse)
async def generate_flashcards(request: FlashcardsRequest):
    try:
        system_prompt = """You are an expert study coach who builds flashcards from learning material.
Return 4 to 8 high-quality question-answer flashcards that cover the most important concepts.
Respond strictly in JSON with the following schema:
{
  "title": "short helpful title",
  "cards": [
    { "question": "Q1", "answer": "A1" }
  ]
}
Keep questions short and answers focused."""

        user_prompt = f"""Create flashcards from the following study material:
Filename: {request.filename or "document"}

Content:
{request.content.strip()}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=900,
        )

        raw_content = chat_completion.choices[0].message.content.strip()
        try:
            parsed = json.loads(raw_content)
        except json.JSONDecodeError:
            # attempt to extract JSON substring
            start = raw_content.find("{")
            end = raw_content.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(raw_content[start:end])
            else:
                raise

        title = parsed.get("title") or (request.filename or "Flashcard Set")
        cards = parsed.get("cards", [])
        sanitized_cards = []
        for card in cards:
            question = str(card.get("question", "")).strip()
            answer = str(card.get("answer", "")).strip()
            if question and answer:
                sanitized_cards.append({"question": question, "answer": answer})

        if not sanitized_cards:
            raise HTTPException(status_code=500, detail="Unable to generate flashcards.")

        return FlashcardsResponse(title=title, cards=sanitized_cards)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    try:
        num_questions = min(max(request.num_questions or 5, 3), 10)  # Between 3-10 questions
        
        system_prompt = f"""You are an expert educator who creates high-quality quiz questions from study material.
Generate {num_questions} multiple-choice questions that test understanding of key concepts from the content.

For each question:
- Create a clear, focused question
- Provide exactly 4 answer options (A, B, C, D)
- Mark exactly ONE option as correct
- Include a brief explanation for why the correct answer is right

Respond strictly in JSON with this schema:
{{
  "title": "short descriptive title",
  "questions": [
    {{
      "question": "Question text here?",
      "options": [
        {{"text": "Option A", "is_correct": false}},
        {{"text": "Option B", "is_correct": true}},
        {{"text": "Option C", "is_correct": false}},
        {{"text": "Option D", "is_correct": false}}
      ],
      "explanation": "Brief explanation of why the correct answer is right"
    }}
  ]
}}

Focus on:
- Testing comprehension, not just recall
- Covering the most important concepts
- Creating plausible incorrect options (distractors)
- Clear, unambiguous questions"""

        user_prompt = f"""Create {num_questions} quiz questions from the following study material:
Filename: {request.filename or "document"}

Content:
{request.content.strip()}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1500,
        )

        raw_content = chat_completion.choices[0].message.content.strip()
        
        # Try to parse JSON
        try:
            parsed = json.loads(raw_content)
        except json.JSONDecodeError:
            # Attempt to extract JSON substring
            start = raw_content.find("{")
            end = raw_content.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(raw_content[start:end])
            else:
                raise HTTPException(status_code=500, detail="Failed to parse quiz response")

        title = parsed.get("title") or (request.filename or "Quiz")
        questions_raw = parsed.get("questions", [])
        
        # Validate and sanitize questions
        sanitized_questions = []
        for q in questions_raw:
            question_text = str(q.get("question", "")).strip()
            options_raw = q.get("options", [])
            explanation = str(q.get("explanation", "")).strip() or None
            
            if not question_text or len(options_raw) < 2:
                continue
            
            # Process options
            sanitized_options = []
            correct_count = 0
            for opt in options_raw:
                opt_text = str(opt.get("text", "")).strip()
                is_correct = opt.get("is_correct", False)
                
                if not opt_text:
                    continue
                
                if is_correct:
                    correct_count += 1
                
                sanitized_options.append(QuizOption(text=opt_text, is_correct=is_correct))
            
            # Must have exactly one correct answer and at least 2 options
            if correct_count != 1 or len(sanitized_options) < 2:
                continue
            
            sanitized_questions.append(QuizQuestion(
                question=question_text,
                options=sanitized_options,
                explanation=explanation
            ))
        
        if not sanitized_questions:
            raise HTTPException(status_code=500, detail="No valid questions generated")

        return QuizResponse(title=title, questions=sanitized_questions)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/scan-problem", response_model=ScanProblemResponse)
async def scan_problem(request: ScanProblemRequest):
    try:
        system_prompt = """You are a study coach who analyses academic problems.
Given a problem description, respond in JSON with:
{
  "summary": "one paragraph summary",
  "key_points": ["bullet insights"],
  "recommended_steps": ["actionable steps"]
}
Focus on clarity and scaffolding the learner's next move."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.prompt.strip()},
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.4,
            max_tokens=700,
        )

        raw_content = chat_completion.choices[0].message.content.strip()
        try:
            parsed = json.loads(raw_content)
        except json.JSONDecodeError:
            start = raw_content.find("{")
            end = raw_content.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(raw_content[start:end])
            else:
                raise

        summary = parsed.get("summary", "").strip()
        key_points = parsed.get("key_points", [])
        recommended_steps = parsed.get("recommended_steps", [])

        analysis = {
            "summary": summary,
            "key_points": key_points,
            "recommended_steps": recommended_steps,
        }

        return ScanProblemResponse(analysis=analysis)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/sentiment", response_model=SentimentResponse)
async def sentiment_analysis(request: SentimentRequest):
    text = (request.text or "").strip()
    print(f"\n{'='*60}")
    print(f"[SENTIMENT API] Received request")
    print(f"[SENTIMENT API] Input text: {text[:100]}...")
    print(f"[SENTIMENT API] Text length: {len(text)}")
    
    if not text:
        print(f"[SENTIMENT API] Empty text, returning neutral")
        return SentimentResponse(sentiment="neutral", score=0.0)

    # Use Groq API for sentiment analysis (already have it set up for chat)
    try:
        print(f"[SENTIMENT API] Using Groq API for sentiment analysis...")
        
        system_prompt = """You are a sentiment analysis expert. Analyze the sentiment of the given text and respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": <float between -1.0 and 1.0>
}

Where:
- sentiment: "positive" if the text expresses positive emotions, "negative" if it expresses negative emotions (including distress, sadness, anxiety, crisis thoughts), or "neutral" if it's neither strongly positive nor negative.
- score: A float between -1.0 and 1.0 where:
  - -1.0 to -0.8: Crisis-level negative (suicidal thoughts, self-harm, severe distress)
  - -0.8 to -0.4: High negative (hopeless, desperate, panicked)
  - -0.4 to -0.2: Moderate negative (stressed, anxious, sad)
  - -0.2 to 0.2: Neutral
  - 0.2 to 0.4: Moderate positive
  - 0.4 to 1.0: High positive

Be accurate and consider the emotional intensity. Crisis situations should get scores <= -0.8."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze the sentiment of this text: {text}"}
        ]
        
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.1,  # Low temperature for consistent sentiment analysis
            max_tokens=150,
            response_format={"type": "json_object"}  # Force JSON response
        )
        
        response_content = chat_completion.choices[0].message.content.strip()
        print(f"[SENTIMENT API] Groq raw response: {response_content}")
        
        # Parse JSON response
        try:
            parsed = json.loads(response_content)
            sentiment_label = str(parsed.get("sentiment", "neutral")).lower()
            score = float(parsed.get("score", 0.0))
            
            # Validate sentiment
            if sentiment_label not in ["positive", "negative", "neutral"]:
                print(f"[SENTIMENT API] Invalid sentiment label '{sentiment_label}', defaulting to neutral")
                sentiment_label = "neutral"
                score = 0.0
            
            # Clamp score to valid range
            score = max(-1.0, min(1.0, score))
            
            print(f"[SENTIMENT API] Groq result: sentiment={sentiment_label}, score={score}")
            print(f"[SENTIMENT API] Returning: sentiment={sentiment_label}, score={score}")
            print(f"{'='*60}\n")
            return SentimentResponse(sentiment=sentiment_label, score=score)
            
        except json.JSONDecodeError as e:
            print(f"[SENTIMENT API] Failed to parse JSON from Groq response: {e}")
            print(f"[SENTIMENT API] Response content: {response_content}")
            print(f"[SENTIMENT API] Falling back to heuristic...")
        except (KeyError, ValueError, TypeError) as e:
            print(f"[SENTIMENT API] Error extracting sentiment data: {e}")
            print(f"[SENTIMENT API] Falling back to heuristic...")
            
    except Exception as exc:
        print(f"[SENTIMENT API] Groq API error: {type(exc).__name__}: {exc}")
        print(f"[SENTIMENT API] Error traceback:")
        import traceback
        traceback.print_exc()
        print(f"[SENTIMENT API] Falling back to heuristic...")

    # Enhanced fallback heuristic with crisis detection
    print(f"[SENTIMENT API] Using fallback heuristic (HuggingFace not available or failed)")
    lower_text = text.lower()
    print(f"[SENTIMENT API] Lowercase text: {lower_text[:100]}...")
    
    # CRISIS-LEVEL indicators (highest priority - severe negative sentiment)
    crisis_patterns = [
        r"harm\s+(myself|self)",
        r"hurt\s+(myself|self)",
        r"kill\s+(myself|self)",
        r"suicide|suicidal",
        r"end\s+(it\s+all|my\s+life|everything)",
        r"want\s+to\s+die",
        r"don'?t\s+want\s+to\s+live",
        r"better\s+off\s+dead",
        r"no\s+point\s+in\s+living",
    ]
    
    # HIGH-LEVEL negative indicators
    high_negative_words = {
        "hopeless", "desperate", "worthless", "useless", "pathetic", "failure",
        "hate myself", "hate my life", "can't go on", "can't take it",
        "breaking down", "falling apart", "losing it", "going crazy",
        "terrified", "panic", "panic attack", "breakdown", "meltdown"
    }
    
    # MODERATE negative indicators
    moderate_negative_words = {
        "stressed", "anxious", "overwhelmed", "sad", "depressed", "down",
        "angry", "frustrated", "annoyed", "irritated", "upset", "worried",
        "tired", "exhausted", "drained", "burned out", "lonely", "isolated",
        "scared", "afraid", "nervous", "uneasy", "uncomfortable", "unhappy",
        "disappointed", "let down", "hurt", "pain", "suffering", "struggling",
        "difficult", "hard", "tough", "challenging", "problem", "issue"
    }
    
    # MILD negative indicators
    mild_negative_words = {
        "concerned", "uncertain", "confused", "unsure", "hesitant", "reluctant"
    }
    
    # Positive indicators
    positive_words = {
        "grateful", "thankful", "happy", "joyful", "excited", "enthusiastic",
        "calm", "peaceful", "relaxed", "content", "satisfied", "pleased",
        "confident", "proud", "accomplished", "successful", "optimistic",
        "hopeful", "hopeful", "motivated", "energetic", "refreshed", "renewed",
        "better", "improving", "progress", "breakthrough", "relief"
    }
    
    # Check for crisis patterns first (highest severity)
    print(f"[SENTIMENT API] Checking crisis patterns...")
    crisis_detected = any(re.search(pattern, lower_text) for pattern in crisis_patterns)
    if crisis_detected:
        print(f"[SENTIMENT API] CRISIS DETECTED! Pattern matched in text")
        print(f"[SENTIMENT API] Returning: sentiment=negative, score=-0.95")
        return SentimentResponse(sentiment="negative", score=-0.95)
    print(f"[SENTIMENT API] No crisis patterns detected")
    
    # Count word matches
    print(f"[SENTIMENT API] Counting word matches...")
    high_neg_hits = sum(1 for phrase in high_negative_words if phrase in lower_text)
    moderate_neg_hits = sum(1 for word in moderate_negative_words if word in lower_text)
    mild_neg_hits = sum(1 for word in mild_negative_words if word in lower_text)
    pos_hits = sum(1 for word in positive_words if word in lower_text)
    
    print(f"[SENTIMENT API] Word match counts:")
    print(f"  - High negative hits: {high_neg_hits}")
    print(f"  - Moderate negative hits: {moderate_neg_hits}")
    print(f"  - Mild negative hits: {mild_neg_hits}")
    print(f"  - Positive hits: {pos_hits}")
    
    # Calculate weighted score
    # High negative: -3 each, Moderate: -1 each, Mild: -0.3 each, Positive: +1 each
    score = (pos_hits * 1.0) - (high_neg_hits * 3.0) - (moderate_neg_hits * 1.0) - (mild_neg_hits * 0.3)
    print(f"[SENTIMENT API] Raw calculated score: {score}")
    
    # Determine sentiment
    print(f"[SENTIMENT API] Determining sentiment from score...")
    if score < -1.5:
        sentiment = "negative"
        # Normalize to -1 to 0 range for very negative
        normalized = max(min(score / 5.0, 0), -1.0)
        print(f"[SENTIMENT API] Very negative detected: score < -1.5")
    elif score < -0.3:
        sentiment = "negative"
        # Normalize to -0.3 to -1 range for moderately negative
        normalized = max(min(score / 3.0, -0.3), -1.0)
        print(f"[SENTIMENT API] Moderately negative detected: -1.5 <= score < -0.3")
    elif score > 0.3:
        sentiment = "positive"
        # Normalize to 0.3 to 1 range for positive
        normalized = min(max(score / 3.0, 0.3), 1.0)
        print(f"[SENTIMENT API] Positive detected: score > 0.3")
    else:
        sentiment = "neutral"
        normalized = 0.0
        print(f"[SENTIMENT API] Neutral detected: -0.3 <= score <= 0.3")
    
    print(f"[SENTIMENT API] Final result: sentiment={sentiment}, score={normalized}")
    print(f"[SENTIMENT API] Returning response")
    print(f"{'='*60}\n")
    return SentimentResponse(sentiment=sentiment, score=float(normalized))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

