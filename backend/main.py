from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from typing import Dict, List
from dotenv import load_dotenv
from pydantic import BaseModel, Field, field_validator, conint
from google import genai
from fastapi import Body

# Initialize OpenAI client
load_dotenv()
#client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client=genai.Client()

app = FastAPI(
    title="AI Website Generator",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Page(BaseModel):
    name: str
    html: str
    css: str

class WebsiteRequest(BaseModel):
    description: str = "A portfolio website with 3 pages"

class EditRequest(BaseModel):
    page_id: int = Field(..., ge=0)
    edit_prompt: str = Field(..., min_length=5)
    current_html: str
    current_css: str

    @field_validator('page_id')
    @classmethod
    def validate_page_id(cls, v):
        if v >= len(website_data.get("pages", [])):
            raise ValueError("Page does not exist")
        return v
    
    @field_validator('edit_prompt')
    @classmethod
    def validate_edit_prompt(cls, v):
        if len(v) < 5:
            raise ValueError("Edit prompt must be at least 5 characters")
        return v

# In-memory storage
website_data: Dict = {
    "pages": [],
    "global_css": ""
}

@app.post("/generate")
async def generate_website(request: WebsiteRequest):
    """Generate a complete website from description"""
    prompt = f"""You are an expert web developer. Create a complete, modern website based on this description: {request.description}

    Requirements:
    - Use semantic HTML5 tags (header, nav, main, section, article, footer)
    - Include responsive design with CSS Grid/Flexbox
    - Add hover effects and smooth transitions
    - Use modern CSS properties (custom properties, backdrop-filter, etc.)
    - Ensure accessibility (ARIA labels, semantic markup)
    - Create 3-5 interconnected pages with navigation
    - Use a cohesive color scheme and typography
    - Generate ALL styling from scratch - no hardcoded example styles
    
    Return valid JSON with this exact structure:
    {{
        "pages": [
            {{
                "name": "Home",
                "html": "<complete semantic HTML structure>",
                "css": "complete custom CSS styling"
            }}
        ],
        "global_css": "global styles for the entire website"
    }}
    
    Make the HTML and CSS detailed, production-ready, and completely original.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        data = json.loads(response.text)
        print("Generated data:", data)
        website_data.update(data)
        return {"status": "success", "pages": data["pages"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Service health check"""
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/pages")
async def list_pages():
    """List all generated pages"""
    return {"pages": website_data["pages"]}

@app.get("/page/{page_id}")
async def get_page(page_id: int):
    """Get specific page by ID"""
    try:
        return website_data["pages"][page_id]
    except IndexError:
        raise HTTPException(status_code=404, detail="Page not found")

@app.post("/edit")
async def edit_page(request: EditRequest):
    try:
        if request.page_id >= len(website_data["pages"]):
            raise HTTPException(status_code=404, detail="Page not found")
            
        current_page = website_data["pages"][request.page_id]  # Fixed variable access
        
        prompt = f"""You are an expert web developer. Modify this existing page according to the instructions.
        
        Current HTML:
        {current_page["html"]}
        
        Current CSS:
        {current_page["css"]}
        
        Modification Instructions: {request.edit_prompt}
        
        Guidelines:
        - Maintain the existing structure and functionality
        - Enhance visual appeal with modern CSS techniques
        - Ensure responsiveness and accessibility
        - Use semantic HTML5 best practices
        - Add smooth transitions and micro-interactions where appropriate
        - Keep the same color scheme unless specifically asked to change
        
        Return valid JSON with exactly this structure:
        {{
            "html": "<updated>html</updated>",
            "css": "<updated>css</updated>"
        }}
        
        Make the improvements production-ready and professional.
        """
        
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        edited_data = json.loads(response.text)
        website_data["pages"][request.page_id].update(edited_data)
        return {"status": "success", "page": edited_data}
        
    except json.JSONDecodeError:
        raise HTTPException(422, detail="Invalid AI response format")
    except Exception as e:
        raise HTTPException(500, detail=str(e))
@app.patch("/pages/{page_id}")
async def update_page(
    page_id: int,
    html: str = Body(...),
    css: str = Body(...)
):
    try:
        website_data["pages"][page_id]["html"] = html
        website_data["pages"][page_id]["css"] = css
        return {"status": "success"}
    except IndexError:
        raise HTTPException(404, detail="Page not found")
