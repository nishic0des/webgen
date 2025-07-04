from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import json
from typing import Dict, List
from dotenv import load_dotenv
from pydantic import conint, validator, BaseModel, Field
from fastapi import Body

# Initialize OpenAI client
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(
    title="AI Website Generator",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None
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
    page_id: conint(ge=0)
    edit_prompt: str = Field(..., min_length=5)
    current_html: str
    current_css: str

    @validator('page_id')
    def validate_prompt(cls, v, values):
        if v >= len(website_data["pages"]):  
            raise ValueError("Page does not exist")
        return v
    @validator('edit_prompt')
    def validate_prompt(cls, v):
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
    prompt = f"""Create a complete website based on: {request.description}
    Return valid JSON with:
    {{
        "pages": [
            {{
                "name": "Home",
                "html": "<div>...</div>",
                "css": "body {{ background: white; }}"
            }}
        ],
        "global_css": "body {{ font-family: Arial; }}"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
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
        
        prompt = f"""Modify this page:
        Current HTML: {current_page["html"]}
        Current CSS: {current_page["css"]}
        Instructions: {request.edit_prompt}
        Return valid JSON with new "html" and "css".
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        edited_data = json.loads(response.choices[0].message.content)
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
