from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'afm_workshop')]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ SEED DATA ============
STEPS_DATA = [
    {
        "order": 1,
        "emoji": "\U0001f3af",
        "title": "Find Your Target",
        "subtitle": "STEP 1",
        "heading": "AI Film Making Blueprint",
        "description": "This step is about finding who exactly you want to create your AI film for. Choose your audience first \u2014 everything else flows from this.",
        "badgeName": "Client Hunter",
        "badgeIcon": "\U0001f3af",
        "interactive": {
            "type": "choice_cards",
            "prompt": "Who exactly are you creating this AI Film for?",
            "subtext": "Lock in your audience first. Pick one and commit \u2014 your storyline depends on it.",
            "choices": [
                {"id": "own_brand", "emoji": "\U0001f3e2", "title": "Your Own Brand", "desc": "Build a film for your business"},
                {"id": "client", "emoji": "\U0001f4bc", "title": "Your Client", "desc": "Agency or freelance work"},
                {"id": "friend", "emoji": "\u2764\ufe0f", "title": "Your Closest Friend", "desc": "Film for someone you love"},
                {"id": "jewellery", "emoji": "\U0001f48e", "title": "Any Jewellery Brand", "desc": "No idea? Default to this"}
            ]
        },
        "actionItems": [
            "Lock in WHO you're creating this film for (pick one above and commit).",
            "Open ChatGPT in a new tab.",
            "Copy the prompt below and fill in your [LOCALITY CITY].",
            "Review the generated list and shortlist your top 5 leads to approach."
        ],
        "prompts": [
            {
                "title": "Client Research Prompt",
                "body": "Hey ChatGPT, Assume you are a world class level of research analyst.\n\nI want you to research through google my business and find me the top 15 local jewellery stores near me who have their website listed with some jewellery pics.\n\nFurther I want you to also find their phone numbers, website link, name, best platform and method with script to approach them and list it all to me in a tabular format. I live in [LOCALITY CITY]"
            }
        ],
        "resources": [
            {"label": "Open ChatGPT", "url": "https://chatgpt.com/"}
        ]
    },
    {
        "order": 2,
        "emoji": "\U0001f4a1",
        "title": "Million-Dollar Concept",
        "subtitle": "STEP 2",
        "heading": "AI Short Film Concept",
        "description": "Craft a 30-second cinematic brand storyline using the GPT below. This is where your film idea comes to life \u2014 from concept to script.",
        "badgeName": "Concept Crafter",
        "badgeIcon": "\U0001f4a1",
        "interactive": None,
        "actionItems": [
            "Open the Custom GPT below (Video AI by Invideo).",
            "Share who you're making the film for (from Step 1).",
            "Let the GPT generate a cinematic concept, storyline, and script.",
            "Review and refine until you're happy with the direction."
        ],
        "prompts": [
            {
                "title": "Creative Director Concept",
                "body": "Assume you are a world class level of creative director and a visual story teller. Who is extremely good at prompting as well. Help me craft a 30 seconds Brand Video Storyline for a [INDUSTRY NAME] brand named \"[PUT THE NAME HERE]\"\n\nI want you to come up with an extremely short and beautiful concept that can help my brand accomplish its goal.\n\nREMEMBER there should be a VoiceOver. The Voiceover should be in the form of a goosebumps-level POETRY/RAP/SONG/NARRATION version. Rest visuals should consist of NO DIALOGUES between people talking to each other.\n\nYou are allowed to ask me top 5 questions that can help you to craft the best story possible. Question like, What emotion of the video do you want the viewer to feel?, Style of video (3D, HyperRealistic etc). Make sure you give options to each question, so that i can copy and paste."
            }
        ],
        "resources": [
            {"label": "Custom GPT: Video AI by Invideo", "url": "https://chatgpt.com/g/g-1PYz1gKIm-video-ai-by-invideo"}
        ]
    },
    {
        "order": 3,
        "emoji": "\u2699\ufe0f",
        "title": "JSON Prompt Structure",
        "subtitle": "STEP 3",
        "heading": "Story \u2192 Scenes \u2192 JSON Prompts",
        "description": "Convert your script into detailed, character-consistent JSON prompts for each scene. This ensures visual consistency across your entire film.",
        "badgeName": "JSON Architect",
        "badgeIcon": "\u2699\ufe0f",
        "interactive": None,
        "actionItems": [
            "Open ChatGPT (or continue the conversation from Step 2).",
            "Paste the prompt below with your script.",
            "Answer the GPT's clarifying questions.",
            "Get your JSON prompts and VoiceOver script in tabular format."
        ],
        "prompts": [
            {
                "title": "JSON Prompt Generator",
                "body": "Assume you are a world class level of creative director and a visual story teller. Who is extremely good at prompting as well. You prompt in a way that you get desired output of a videos that stuns the viewers with its quality and extreme attention to the details of video generation.\n\nI want you to go ahead and study my entire script for me [script is already discussed before in our conversation]. Then help me craft customizable JSON Prompts for each scene. First I want you to understand the scene and then plot how many videos we might require to bring that scene to reality. Then I want you to write the JSON prompt for all the plotted scenes in a tabular format.\n\nSo, that i can give to a VEO 3.1 Video Generation Model so that i can generate those stunning visual videos. Just make sure you maintain the same characters, actors, faces, fonts, music theme throughout the Ai Film. color grade & tonality of the characters should be consistent. (Do not give me a separate master prompt or such for consistency include that inside all of the prompts already)\n\nGo through it & You can Ask me TOP 3 questions that you might need answer to inorder to make sure that it turns out to be the creative prompts that executes the storyline. Once you get the answers. Further generate JSON Prompt for each scenes in a tabular format and give it to me. At the end attach the complete VoiceOver Separately that i can give to LYRIA Google Gemini and turn it into a music+vo for my ai film."
            }
        ],
        "resources": [
            {"label": "Open ChatGPT", "url": "https://chatgpt.com/"}
        ]
    },
    {
        "order": 4,
        "emoji": "\U0001f3a8",
        "title": "Visual Storyboard",
        "subtitle": "STEP 4",
        "heading": "Turn Scenes into Storyboard Frames",
        "description": "Use Gemini to generate hyper-realistic storyboard frames from your JSON prompts. Each frame should match your film's visual DNA.",
        "badgeName": "Frame Master",
        "badgeIcon": "\U0001f3a8",
        "interactive": None,
        "actionItems": [
            "Open Google Gemini.",
            "Paste the Storyboard Frame Generator prompt below.",
            "Feed your JSON prompts one scene at a time.",
            "Save each generated frame for your visual storyboard."
        ],
        "prompts": [
            {
                "title": "Storyboard Frame Generator",
                "body": "Now, Assume you are a world class level of creative story teller who very well knows designing prompts and getting the right output (EXTREME HYPER-REALISTIC) from image generation models like Gemini.\n\nHERE IS MY ENTIRE SCRIPT: [Paste Script Here]\n\nBased on the storyline attached above, I want you to brainstorm for me an imaginary character sheet of the essential characters in my storyline. Then, I want you to help me generate images that reveal the entire storyline frame by frame. So, I can create a Visual StoryBoard for my Ai Film.\n\nOnce you have understood it. Simply ask me for the next JSON Prompt. I've already designed my JSON Prompts. You can take my JSON Prompt convert it into the BEST Possible Image & Then. I will simply keep on pasting the next scenes and i want you to follow the same process, that you take the JSON Prompt and convert it into the next frame of the story\n\nImportant (How you will create the frames)\nEvery image you give should have:\n- Consistent character DNA (all characters/products/environments involved)\n- Consistent Cinematic camera metadata (lens, lighting, depth, grain)\n- Matches my style of video generation, Output that matches to my script (NOT AI-looking/slop)\n\nHere is the FIRST SCENE =\n[PASTE YOUR FIRST JSON PROMPT HERE]"
            }
        ],
        "resources": [
            {"label": "Open Google Gemini", "url": "https://gemini.google.com/"}
        ]
    },
    {
        "order": 5,
        "emoji": "\U0001f3ac",
        "title": "First Draft Visuals",
        "subtitle": "STEP 5",
        "heading": "Craft Your Visuals \u2014 First Draft",
        "description": "Convert your storyboard frames into actual videos using Google Vids and Veo. This is where your film starts moving.",
        "badgeName": "Scene Builder",
        "badgeIcon": "\U0001f3ac",
        "interactive": None,
        "actionItems": [
            "Go to Google Vids.",
            "Sign up, click 'Start from Scratch', and select 'Animate Image to a Video'.",
            "Input your image and paste the corresponding JSON prompt.",
            "Click Generate.",
            "Drag and drop the result to the timeline. Click '+' and repeat for all scenes."
        ],
        "prompts": [],
        "resources": [
            {"label": "Google Vids Engine", "url": "https://labs.google/fx/tools/video-fx"},
            {"label": "Google Flow", "url": "https://labs.google/fx/tools/flow"}
        ]
    },
    {
        "order": 6,
        "emoji": "\U0001f3b5",
        "title": "Music & Voiceover",
        "subtitle": "STEP 6",
        "heading": "Craft Your AI Film Music & VO",
        "description": "Generate the voiceover narration and emotional music track that brings your film to life.",
        "badgeName": "Sound Maestro",
        "badgeIcon": "\U0001f3b5",
        "interactive": {
            "type": "info_card",
            "title": "VoiceOver / Lyrics",
            "content": "You should already have your VoiceOver / Lyrics script from Step 3. If not, go back and get it first."
        },
        "actionItems": [
            "Write or generate your voiceover script (from Step 3 output).",
            "Choose your engine: Gemini (Lyria) for beginners, Suno for song format, Minimax for advanced control.",
            "Paste your lyrics / voiceover script into the tool.",
            "Apply the necessary style prompts and generate.",
            "Download the final audio track."
        ],
        "prompts": [
            {
                "title": "Lyria Prompt (Gemini)",
                "body": "Assume you are a world class level of emotional music creator who is also very well versed with prompting and can write prompts for Google Gemini (Lyria) To help me generate the perfect music with voiceover narrative that can help my ai film acheive it's goal. Here is the lyrics of the ai film:\n\n[PASTE YOUR LYRICS HERE]"
            },
            {
                "title": "Lyria Continuation Prompt",
                "body": "Continue in the same tone music & tonality. the lyrics attached below."
            }
        ],
        "resources": [
            {"label": "Lyria (Google DeepMind)", "url": "https://aitestkitchen.withgoogle.com/tools/music-fx"},
            {"label": "Suno (Songs)", "url": "https://suno.com/"},
            {"label": "Minimax (Advanced Audio)", "url": "https://minimax.chat/"},
            {"label": "Eleven Labs", "url": "https://elevenlabs.io/"}
        ]
    },
    {
        "order": 7,
        "emoji": "\u2702\ufe0f",
        "title": "Editing & Sequencing",
        "subtitle": "STEP 7",
        "heading": "Editing Mastery",
        "description": "Bring it all together. Edit, sequence, and polish your AI film into a cinematic masterpiece.",
        "badgeName": "Master Editor",
        "badgeIcon": "\u2702\ufe0f",
        "interactive": None,
        "actionItems": [
            "Cut unwanted elements from your story.",
            "Align music and visuals according to the beats.",
            "Apply J-Cuts and L-Cuts for smooth, professional transitions.",
            "Add effects, transitions, texts, and titles.",
            "Export \u2014 and get ready to celebrate."
        ],
        "prompts": [],
        "resources": [
            {"label": "Learn J-Cut / L-Cuts (YouTube)", "url": "https://www.youtube.com/results?search_query=j+cut+l+cut+editing"}
        ]
    },
    {
        "order": 8,
        "emoji": "\U0001f3c6",
        "title": "Finale",
        "subtitle": "FINALE",
        "heading": "CONGRATULATIONS, Director.",
        "description": "You've completed the entire AI Film Making workflow. You now have the skills, tools, and prompts to create cinematic AI films for any brand.",
        "badgeName": "Executive Director",
        "badgeIcon": "\U0001f3c6",
        "interactive": None,
        "actionItems": [],
        "prompts": [],
        "resources": [],
        "finaleExtras": {
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
    }
]

DIRECTOR_LEVELS = [
    {"min_steps": 0, "title": "Aspiring Filmmaker", "subtitle": "The journey begins", "emoji": "\U0001f3ac"},
    {"min_steps": 1, "title": "Story Scout", "subtitle": "Finding your narrative", "emoji": "\U0001f50d"},
    {"min_steps": 2, "title": "Concept Creator", "subtitle": "Ideas take shape", "emoji": "\U0001f4a1"},
    {"min_steps": 3, "title": "Prompt Engineer", "subtitle": "Mastering the craft", "emoji": "\u2699\ufe0f"},
    {"min_steps": 4, "title": "Visual Director", "subtitle": "Framing the vision", "emoji": "\U0001f3a8"},
    {"min_steps": 5, "title": "Scene Architect", "subtitle": "Building worlds", "emoji": "\U0001f3ac"},
    {"min_steps": 6, "title": "Sound Designer", "subtitle": "Composing emotion", "emoji": "\U0001f3b5"},
    {"min_steps": 7, "title": "Senior Director", "subtitle": "Almost there", "emoji": "\u2702\ufe0f"},
    {"min_steps": 8, "title": "Executive Director", "subtitle": "The complete filmmaker", "emoji": "\U0001f3c6"}
]

# ============ MODELS ============
class StepSidebar(BaseModel):
    order: int
    emoji: str
    title: str
    subtitle: str

class StepFull(BaseModel):
    model_config = ConfigDict(extra="allow")
    order: int
    emoji: str
    title: str
    subtitle: str
    heading: str
    description: str
    badgeName: str
    badgeIcon: str
    interactive: Optional[dict] = None
    actionItems: List[str] = []
    prompts: List[dict] = []
    resources: List[dict] = []
    finaleExtras: Optional[dict] = None

class DirectorLevel(BaseModel):
    min_steps: int
    title: str
    subtitle: str
    emoji: str

# ============ SEED ON STARTUP ============
@app.on_event("startup")
async def seed_data():
    """Seed steps data on startup (idempotent)"""
    existing = await db.steps.count_documents({})
    if existing == 0:
        logger.info("Seeding steps data...")
        await db.steps.insert_many(STEPS_DATA)
        logger.info(f"Seeded {len(STEPS_DATA)} steps")
    else:
        # Update existing data to ensure consistency
        for step in STEPS_DATA:
            await db.steps.update_one(
                {"order": step["order"]},
                {"$set": step},
                upsert=True
            )
        logger.info(f"Updated {len(STEPS_DATA)} steps")
    
    # Seed director levels
    existing_levels = await db.director_levels.count_documents({})
    if existing_levels == 0:
        await db.director_levels.insert_many(DIRECTOR_LEVELS)
        logger.info(f"Seeded {len(DIRECTOR_LEVELS)} director levels")
    else:
        for level in DIRECTOR_LEVELS:
            await db.director_levels.update_one(
                {"min_steps": level["min_steps"]},
                {"$set": level},
                upsert=True
            )
        logger.info(f"Updated {len(DIRECTOR_LEVELS)} director levels")

# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "AFM Workshop API"}

@api_router.get("/steps")
async def get_steps_sidebar():
    """Get minimal step data for sidebar"""
    steps = await db.steps.find(
        {},
        {"_id": 0, "order": 1, "emoji": 1, "title": 1, "subtitle": 1}
    ).sort("order", 1).to_list(20)
    return steps

@api_router.get("/steps/{order}")
async def get_step(order: int):
    """Get full step content"""
    step = await db.steps.find_one({"order": order}, {"_id": 0})
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    return step

@api_router.get("/director-levels")
async def get_director_levels():
    """Get all director levels"""
    levels = await db.director_levels.find({}, {"_id": 0}).sort("min_steps", 1).to_list(20)
    return levels

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
