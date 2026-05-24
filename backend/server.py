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
            "videoUrl": "https://www.youtube.com/embed/CC2mjGgmJjM"
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

# ============ LIP SYNC WORKSHOP DATA ============
LIPSYNC_STEPS_DATA = [
    {
        "order": 1,
        "icon": "T",
        "title": "Method 1: Text to Lip Sync",
        "subtitle": "~VEO 3.1",
        "description": "Generate lip-synced video directly from text input using VEO 3.1.",
        "actionItems": [
            "Access VEO 3.1 dashboard.",
            "Input script text directly into the generator.",
            "Select voice model and character profile.",
            "Download this now Option: Copy and use the SAMPLE JSON Script provided below.",
            "Generate video."
        ],
        "resources": [
            {"label": "Google Vids", "url": "https://workspace.google.com/intl/en_in/products/vids/"}
        ],
        "prompts": [
            {
                "title": "SAMPLE JSON Script",
                "body": "{\n  \"video_generation\": {\n    \"model\": \"Veo\",\n    \"prompt\": \"A high-fidelity 3D animated video featuring the boy from image_748e1f.png. He is walking confidently toward the camera along a sunlit park path as seen in watermarked_img_6168924431539087097.png. He maintains direct eye contact with the camera, gesturing naturally with his hands as he speaks. His facial expressions are lively and synchronized with the provided script. The lighting is bright and cinematic, capturing the textures of his blue and teal hoodie and messy brown hair. Smooth camera tracking maintains a medium shot of the character as he moves.\",\n    \"aspect_ratio\": \"16:9\",\n    \"audio\": {\n      \"mode\": \"text-to-speech\",\n      \"script\": \"Hey there! Welcome to Ai Film Making Workshop DAY 2. I am so glad to seeing you all creating stunning ai films & taking yourself to next level\",\n      \"voice_profile\": \"cheerful_young_boy\",\n      \"language\": \"en-US\"\n    },\n    \"character_consistency\": {\n      \"reference_image\": \"image_748e1f.png\",\n      \"maintain_features\": [\"messy brown hair\", \"blue and teal hoodie\", \"orange t-shirt\", \"brown eyes\"]\n    }\n  }\n}"
            }
        ],
        "modules": None,
        "interactive": None
    },
    {
        "order": 2,
        "icon": "IMG",
        "title": "Method 2: Image to Lip Sync",
        "subtitle": "VEO, Infinite Talks, Google Flow",
        "description": "Multi-tool workflows for animating a static image. Select the appropriate module based on your required output.",
        "actionItems": [],
        "resources": [],
        "prompts": [],
        "interactive": {
            "type": "choose_character",
            "title": "Choose your Character",
            "links": [
                {"label": "Cartoon Character", "url": "#"},
                {"label": "Human Character", "url": "#"}
            ]
        },
        "geminiAssistant": True,
        "modules": [
            {
                "id": "veo31",
                "title": "Module 1: VEO 3.1",
                "locked": False,
                "actionItems": [
                    "Take your frame.",
                    "Write/restructure the JSON prompt.",
                    "Go to Google VIDs.",
                    "Enter the prompt & Insert the Image.",
                    "Hit Generate."
                ],
                "resources": [
                    {"label": "Google VIDs", "url": "https://workspace.google.com/intl/en_in/products/vids/"}
                ]
            },
            {
                "id": "infinite_talks",
                "title": "Module 2: Infinite Talks for Long Videos",
                "locked": True,
                "actionItems": [],
                "resources": []
            },
            {
                "id": "google_flow",
                "title": "Module 3: GOOGLE FLOW (Advance LipSync)",
                "locked": True,
                "actionItems": [],
                "resources": []
            }
        ]
    },
    {
        "order": 3,
        "icon": "MIC",
        "title": "Method 3: Audio to Lip Sync",
        "subtitle": "Wan.video",
        "description": "The primary workflow for creating lip-synced videos from a still character image and an audio file using Wan.video.",
        "actionItems": [
            "Navigate to Wan.video (https://create.wan.video/).",
            "Check in to the platform to earn your free daily credits.",
            "In the dashboard, click on 'Avatar' and select 'Speech to Video'.",
            "Upload your chosen Character image.",
            "Upload or record your target Audio file.",
            "Review settings and hit 'Export'."
        ],
        "resources": [
            {"label": "Wan.video", "url": "https://create.wan.video/"},
            {"label": "Sample Character Image", "url": "#"},
            {"label": "Sample Audio", "url": "#"}
        ],
        "prompts": [],
        "modules": None,
        "interactive": None
    },
    {
        "order": 4,
        "icon": "VID",
        "title": "Method 4: Video to Lip Sync",
        "subtitle": "Seedance 2.0, LTX, Runway Aleph",
        "description": "Advanced video-to-video lip sync techniques. Replace the dialogue and lip movements of an existing video using three powerful tools.",
        "actionItems": [],
        "resources": [],
        "prompts": [],
        "modules": [
            {
                "id": "seedance",
                "title": "Sub-Module: Seedance 2.0",
                "locked": False,
                "description": "ByteDance's multimodal video generator. Best for talking-head clips, singing avatars, and audio-driven motion with character consistency.",
                "actionItems": [
                    "Go to Seedance 2.0 platform.",
                    "Upload a clear, front-facing character image or short video clip.",
                    "Upload your target audio file (dialogue, voiceover, or song).",
                    "Write a focused prompt describing the character, action, camera angle, and reference the audio for lip sync.",
                    "Hit Generate and wait for the output.",
                    "Review the result \u2014 if sync is off, re-record with clearer pacing or try a tighter crop."
                ],
                "resources": [
                    {"label": "Seedance 2.0", "url": "https://seedance2.ai"},
                    {"label": "Seedance (ByteDance)", "url": "https://seed.bytedance.com/en/seedance2_0"}
                ],
                "prompts": [
                    {
                        "title": "Seedance Lip Sync Prompt Template",
                        "body": "Use @Image1 as the character reference, @Audio1 for lip sync.\n\nPortrait of the character speaking directly to camera in a softly lit room. Natural lip sync with subtle facial expressions, gentle head movement, and natural blinking. Steady close-up framing, cinematic realism, shallow depth of field.\n\nTips:\n- Keep audio clean and well-paced\n- Use front-facing or 3/4 angle shots\n- Short sentences sync better than long ones\n- Leave natural pauses in the audio"
                    }
                ]
            },
            {
                "id": "ltx",
                "title": "Sub-Module: LTX Studio",
                "locked": False,
                "description": "LTX Studio's Audio-to-Video pipeline. Supports multi-speaker scenes, automatic phoneme analysis, and built-in voice library.",
                "actionItems": [
                    "Open LTX Studio and go to Gen Space.",
                    "Select Video tab \u2192 Audio-to-Video.",
                    "Upload your audio file (MP3, WAV, AAC supported).",
                    "Add a visual prompt describing: character appearance, scene, camera angle, and environment.",
                    "Optionally upload a start frame image for character consistency.",
                    "Generate the video \u2014 LTX analyzes audio phonemes and creates matching mouth movement.",
                    "For multi-speaker scenes: define each character in Elements, assign distinct voices, and generate separately."
                ],
                "resources": [
                    {"label": "LTX Studio", "url": "https://ltx.studio"},
                    {"label": "LTX Lip Sync Guide", "url": "https://ltx.studio/blog/lip-sync-ai"}
                ],
                "prompts": [
                    {
                        "title": "LTX Audio-to-Video Prompt",
                        "body": "Character: [Describe character appearance in detail]\nScene: [Describe environment and lighting]\nCamera: Close-up, front-facing, steady shot\nAction: Speaking directly to camera with natural expressions\nAudio Reference: [Your uploaded audio file]\n\nNotes:\n- Keep face large in frame for best sync\n- Use consistent lighting between source and output\n- For dubbed content: generate translated audio with TTS first, then apply lip sync"
                    }
                ]
            },
            {
                "id": "runway",
                "title": "Sub-Module: Runway Aleph",
                "locked": False,
                "description": "Runway's Aleph for video editing + Lip Sync tool combo. Edit real video with text prompts, then apply precise lip sync. Supports up to 4 faces.",
                "actionItems": [
                    "Prep your source clip: clear face, good lighting, front-facing or 3/4 angle.",
                    "Use Aleph to clean up and reframe the shot (remove distractions, fix lighting, create tighter framing).",
                    "Open Runway Lip Sync tool from Dashboard \u2192 Create \u2192 Generate Audio \u2192 Lip Sync.",
                    "Upload your edited clip or still image. Wait for face detection.",
                    "Add dialogue audio: use Text-to-Speech (pick a voice + enter script) or Upload Audio (your own file).",
                    "Generate and review for mouth timing, face stability, and expression matching.",
                    "If results are off: go back to Aleph to zoom closer, reduce motion, or simplify background, then re-run Lip Sync."
                ],
                "resources": [
                    {"label": "Runway", "url": "https://runwayml.com"},
                    {"label": "Runway Lip Sync Guide", "url": "https://help.runwayml.com/hc/en-us/articles/31941427186323-Creating-with-Lip-Sync"}
                ],
                "prompts": [
                    {
                        "title": "Aleph Cleanup Prompt (Before Lip Sync)",
                        "body": "Create a clean close-up of the subject speaking. Keep original lighting and skin tones natural. Reduce background clutter. Cinematic realism. Minimal motion. Preserve subject identity and background composition.\n\nThen in Lip Sync:\n- Upload the Aleph-edited clip\n- Select detected face(s)\n- Add your dialogue via TTS or upload audio\n- Generate\n\nPipeline: Footage \u2192 Aleph cleanup/reframe \u2192 Lip Sync voice match \u2192 Export \u2192 Edit in timeline"
                    }
                ]
            }
        ],
        "interactive": None
    }
]

# ============ VFX WORKSPACE DATA ============
VFX_STEPS_DATA = [
    {
        "order": 1,
        "title": "#1 Product Placement WorkFlow",
        "description": "Use Gemini's 'Draw to Edit' feature to seamlessly integrate and manipulate the product onto the subject.",
        "locked": False,
        "actionItems": [
            "Go to Gemini.",
            "Add your hero photo containing the product.",
            "Select the 'Draw' option.",
            "Draw exactly on the area that needs to be edited (direction, product integration).",
            "Write your editing instructions in the prompt box.",
            "Hit Enter and wait for generation."
        ],
        "prompts": [
            {
                "title": "Jewellery Replacement Prompt",
                "body": "Can you replace the jewellery in image 2 [the lady is wearing in her neck] with jewellery in image 1.\n\n1920*1080"
            }
        ],
        "resources": [
            {"label": "Sample Jewellery set", "url": "https://drive.google.com/file/d/1wA5hiUxuIR9RMhAZUbE91K_rpiWAyBYI/view?usp=sharing"},
            {"label": "Sample Female Model", "url": "https://drive.google.com/file/d/189NvKA15IbA3d1twQ47RHvbtwoFGZE7w/view?usp=sharing"}
        ]
    },
    {
        "order": 2,
        "title": "#2 Character Replacement Workflow",
        "description": "Transform your base image into a cinematic sequence by matching reference Hollywood shots.",
        "locked": False,
        "actionItems": [
            "Check your reference Hollywood shot for mood, lighting, and composition.",
            "Click/capture your photo inside the camera mimicking a similar shot angle.",
            "Import into Gemini or ChatGPT.",
            "Replace the background with your photo using the prompt below."
        ],
        "prompts": [
            {
                "title": "Cinematic Background Replacement",
                "body": "Extract the main subject from image 2 and place them into a dramatic cinematic Hollywood scene of image 1. Match the ambient lighting, color grading, and depth of field of the provided reference."
            }
        ],
        "resources": [
            {"label": "#1 Reference Shot - BuckBeak", "url": "https://drive.google.com/file/d/1TnT1vQMbrQY5yHbqs4nhssj65qnszHz-/view?usp=sharing"},
            {"label": "#2 Reference Shot - Group Finalize", "url": "https://drive.google.com/file/d/1drXEy19vd4hpJ5G1ro8BKOJBwpndJRus/view?usp=sharing"},
            {"label": "#3 Reference Shot - Wand Scene", "url": "https://drive.google.com/file/d/1wkC25uVrJcbK7df9ruoMLAFOnJ5J1WKM/view?usp=sharing"},
            {"label": "ChatGPT", "url": "https://chatgpt.com/"}
        ]
    },
    {
        "order": 3,
        "title": "#3 Background Replacement Workflow",
        "description": "This advanced background replacement section is strictly confidential.",
        "locked": True,
        "actionItems": [],
        "prompts": [],
        "resources": []
    },
    {
        "order": 4,
        "title": "Step 2: Animate Frames",
        "description": "Feed your newly generated, perfectly framed still images into the designated video model for animation.",
        "locked": False,
        "actionItems": [
            "Export the completed images from Gemini.",
            "Upload the images into our primary Video Model.",
            "Configure the motion parameters to match the scene.",
            "Initiate the video generation process."
        ],
        "prompts": [],
        "resources": []
    },
    {
        "order": 5,
        "title": "Step 3: Shot to Timeline",
        "description": "Integrate the output into the master timeline and loop the process for subsequent shots.",
        "locked": False,
        "actionItems": [
            "Add the generated video clip to our master Workflow timeline.",
            "Review the clip for continuity and quality.",
            "Repeat the same steps (1 through 4) for the next shot."
        ],
        "prompts": [],
        "resources": []
    }
]

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
    
    # Seed lip sync steps
    for step in LIPSYNC_STEPS_DATA:
        await db.lipsync_steps.update_one(
            {"order": step["order"]},
            {"$set": step},
            upsert=True
        )
    logger.info(f"Seeded/updated {len(LIPSYNC_STEPS_DATA)} lip sync steps")

    # Seed VFX workspace steps
    for step in VFX_STEPS_DATA:
        await db.vfx_steps.update_one(
            {"order": step["order"]},
            {"$set": step},
            upsert=True
        )
    logger.info(f"Seeded/updated {len(VFX_STEPS_DATA)} VFX steps")

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

# ============ LIP SYNC ROUTES ============
@api_router.get("/lipsync/steps")
async def get_lipsync_steps():
    """Get minimal lip sync step data for sidebar"""
    steps = await db.lipsync_steps.find(
        {},
        {"_id": 0, "order": 1, "icon": 1, "title": 1, "subtitle": 1}
    ).sort("order", 1).to_list(20)
    return steps

@api_router.get("/lipsync/steps/{order}")
async def get_lipsync_step(order: int):
    """Get full lip sync step content"""
    step = await db.lipsync_steps.find_one({"order": order}, {"_id": 0})
    if not step:
        raise HTTPException(status_code=404, detail="Lip sync step not found")
    return step

# ============ VFX WORKSPACE ROUTES ============
@api_router.get("/vfx/steps")
async def get_vfx_steps():
    """Get minimal VFX step data for sidebar"""
    steps = await db.vfx_steps.find(
        {},
        {"_id": 0, "order": 1, "title": 1, "locked": 1}
    ).sort("order", 1).to_list(20)
    return steps

@api_router.get("/vfx/steps/{order}")
async def get_vfx_step(order: int):
    """Get full VFX step content"""
    step = await db.vfx_steps.find_one({"order": order}, {"_id": 0})
    if not step:
        raise HTTPException(status_code=404, detail="VFX step not found")
    return step

# ============ PROGRESS SYNC ROUTES ============
class ProgressPayload(BaseModel):
    sessionId: str
    completedSteps: List[int] = []
    step1Choice: Optional[str] = None
    currentStep: int = 1

@api_router.post("/progress")
async def save_progress(payload: ProgressPayload):
    """Save user progress for cross-device sync"""
    await db.progress.update_one(
        {"sessionId": payload.sessionId},
        {
            "$set": {
                "sessionId": payload.sessionId,
                "completedSteps": payload.completedSteps,
                "step1Choice": payload.step1Choice,
                "currentStep": payload.currentStep,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True
    )
    return {"status": "ok"}

@api_router.get("/progress/{session_id}")
async def get_progress(session_id: str):
    """Load user progress by session ID"""
    progress = await db.progress.find_one(
        {"sessionId": session_id},
        {"_id": 0}
    )
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found for this session")
    return progress

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
