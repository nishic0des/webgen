# WebGen: Complete Codebase Explanation

## 🚀 Project Overview

WebGen is a sophisticated AI-powered website generator that allows users to create multi-page websites from natural language descriptions. The application features a FastAPI backend integrated with OpenAI's GPT models and a Next.js frontend with a futuristic, cyberpunk-themed UI that supports both AI-driven generation and visual editing capabilities.

## 🏗️ Architecture Overview

```
WebGen/
├── backend/                 # FastAPI Python backend
│   ├── main.py             # Main API server with OpenAI integration
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (OpenAI API key)
├── frontend/               # Next.js React frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   │   ├── page.js    # Main application component
│   │   │   ├── layout.js  # App layout and metadata
│   │   │   ├── globals.css # Global styles and animations
│   │   │   └── ElementEditor.js # Visual element editor modal
│   │   └── utils/         # Utility functions
│   │       ├── api.js     # API communication layer
│   │       └── domUtils.js # DOM manipulation utilities
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config    # Tailwind CSS configuration
└── README.md              # Project documentation
```

## 🔧 Backend Architecture (FastAPI)

### Core Components

#### **1. Main API Server (`backend/main.py`)**

The backend is built with **FastAPI** and serves as the bridge between the frontend and OpenAI's API.

**Key Features:**
- **OpenAI Integration**: Uses GPT-3.5-turbo for website generation and editing
- **In-Memory Storage**: Maintains website data during the session
- **CORS Configuration**: Allows cross-origin requests from the frontend
- **Structured Data Validation**: Uses Pydantic models for request/response validation

**Core Endpoints:**

```python
POST /generate          # Generate complete website from description
GET /pages             # List all generated pages
GET /page/{page_id}    # Get specific page by ID
POST /edit             # AI-edit a page with natural language prompt
PATCH /pages/{page_id} # Save visual/manual edits to a page
GET /health            # Health check endpoint
```

#### **2. Data Models**

```python
class Page(BaseModel):
    name: str    # Page name (e.g., "Home", "About")
    html: str    # HTML content
    css: str     # CSS styles

class WebsiteRequest(BaseModel):
    description: str  # Natural language description

class EditRequest(BaseModel):
    page_id: int             # Page identifier
    edit_prompt: str         # Natural language edit instruction
    current_html: str        # Current HTML content
    current_css: str         # Current CSS styles
```

#### **3. AI Integration Strategy**

The backend uses a sophisticated prompt engineering approach:

**Website Generation:**
```python
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
```

**Page Editing:**
```python
prompt = f"""Modify this page:
Current HTML: {current_page["html"]}
Current CSS: {current_page["css"]}
Instructions: {request.edit_prompt}
Return valid JSON with new "html" and "css".
"""
```

#### **4. Dependencies (`requirements.txt`)**

The backend uses a comprehensive set of Python packages:
- **fastapi**: Modern web framework for APIs
- **uvicorn**: ASGI server for running FastAPI
- **openai**: OpenAI API client
- **python-dotenv**: Environment variable management
- **pydantic**: Data validation and serialization
- Plus additional packages for various functionalities (kafka, nltk, etc.)

## 🎨 Frontend Architecture (Next.js)

### Core Components

#### **1. Main Application (`frontend/src/app/page.js`)**

The main component is a comprehensive React application with multiple sections:

**State Management:**
```javascript
const [description, setDescription] = useState("");     // User input
const [pages, setPages] = useState([]);                // Generated pages
const [currentPage, setCurrentPage] = useState(null);  // Currently viewed page
const [loading, setLoading] = useState(false);         // Loading state
const [editing, setEditing] = useState(false);         // Edit mode toggle
const [editPrompt, setEditPrompt] = useState("");      // AI edit prompt
const [selectedElement, setSelectedElement] = useState(null); // Visual editor
```

**UI Sections:**

1. **Header Section**: Futuristic branding with animated elements
2. **Generation Section**: Input area for website description
3. **Dashboard Section**: Navigation between generated pages
4. **Preview Section**: Live iframe preview with editing capabilities
5. **Element Editor Modal**: Visual editing interface

#### **2. Visual Element Editor (`frontend/src/app/ElementEditor.js`)**

A sophisticated modal component for editing individual HTML elements:

**Features:**
- **Element Type Display**: Shows the HTML tag being edited
- **Content Editing**: Text area for modifying element content
- **Style Controls**: Color pickers and input fields for:
  - Text color
  - Background color
  - Font size
- **Futuristic UI**: Matches the cyberpunk theme with glowing effects

**Implementation Strategy:**
```javascript
const handleSave = () => {
    onSave({
        ...element,
        content,
        styles: { color, backgroundColor, fontSize }
    });
};
```

#### **3. API Communication Layer (`frontend/src/utils/api.js`)**

Centralized API communication using Axios:

```javascript
const API = axios.create({
    baseURL: "http://localhost:8000",
});

export const generateWebsite = (description) => 
    API.post("/generate", { description });
export const editPage = async (pageId, editPrompt, html, css) => 
    API.post("/edit", { page_id: pageId, edit_prompt: editPrompt, ... });
export const saveVisualEdit = async (pageId, updatedHtml, updatedCss) => 
    API.patch(`/pages/${pageId}`, { html: updatedHtml, css: updatedCss });
```

#### **4. DOM Utilities (`frontend/src/utils/domUtils.js`)**

XPath generation for precise element targeting:

```javascript
export const getXPath = (element) => {
    if (element.id) return `#${element.id}`;
    if (element === document.body) return "body";
    // Complex XPath generation logic for element identification
};
```

#### **5. Design System (`frontend/src/app/globals.css`)**

**Cyberpunk Theme Elements:**
- **Color Palette**: Cyan (#00ffff), Purple (#8000ff), Green (#00ff00)
- **Visual Effects**: Gradients, glows, blur effects, backdrop filters
- **Animations**: Fade-in, slide-in, scale-in, grid movement, holographic text
- **Interactive Elements**: Hover effects, focus states, custom scrollbars

**Key Animation Examples:**
```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes holographic {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

## 🔄 Data Flow & Communication

### 1. Website Generation Flow

```
User Input → Frontend → Backend → OpenAI API → Backend → Frontend → UI Update
```

1. User enters description in textarea
2. Frontend sends POST request to `/generate`
3. Backend constructs prompt and sends to OpenAI
4. OpenAI returns structured JSON with pages
5. Backend stores data and returns to frontend
6. Frontend updates state and displays pages

### 2. Visual Editing Flow

```
Element Click → XPath Generation → Modal Open → Style Changes → Save → Server Update
```

1. User clicks "Edit Page" to enter editing mode
2. Clicking elements triggers XPath generation
3. ElementEditor modal opens with current styles
4. User modifies content/styles in modal
5. Changes are applied to HTML/CSS and saved to server

### 3. AI Editing Flow

```
Edit Prompt → Backend → OpenAI API → HTML/CSS Update → Frontend Refresh
```

1. User enters natural language edit prompt
2. Backend sends current page data + prompt to OpenAI
3. OpenAI returns modified HTML/CSS
4. Backend updates stored data
5. Frontend refreshes preview with new content

## 🎯 Key Features Explained

### 1. **AI Website Generation**
- Uses GPT-3.5-turbo with structured prompts
- Returns JSON with multiple pages
- Handles various website types and descriptions
- Maintains consistent styling across pages

### 2. **Multi-Page Support**
- Dashboard for page navigation
- Individual page editing capabilities
- Persistent state management
- Page-specific HTML/CSS storage

### 3. **Visual Element Editing**
- Click-to-edit functionality in iframe
- XPath-based element targeting
- Real-time style preview
- Server-side persistence of changes

### 4. **Futuristic UI/UX**
- Cyberpunk aesthetic with neon colors
- Smooth animations and transitions
- Interactive hover effects
- Responsive design patterns

### 5. **Live Preview System**
- Iframe-based rendering
- Isolated CSS scope
- Interactive element highlighting
- Real-time editing feedback

## 🔧 Technical Implementation Details

### Backend Patterns

**1. Error Handling:**
```python
try:
    response = client.chat.completions.create(...)
    data = json.loads(response.choices[0].message.content)
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

**2. Data Validation:**
```python
@validator('edit_prompt')
def validate_prompt(cls, v):
    if len(v) < 5:
        raise ValueError("Edit prompt must be at least 5 characters")
    return v
```

### Frontend Patterns

**1. State Management:**
```javascript
useEffect(() => {
    const handleMessage = (event) => {
        if (event.data.type === "ELEMENT_CLICK" && editingMode) {
            setSelectedElement({...});
        }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
}, [editingMode]);
```

**2. Dynamic Styling:**
```javascript
const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${currentPage?.css || ""}
          * {
             outline: ${editingMode ? "1px dashed rgba(0,255,255,0.4)" : "none"};
          }
        </style>
      </head>
      <body>${currentPage?.html || ""}</body>
    </html>
`;
```

## 📦 Dependencies & Setup

### Backend Dependencies
- **Core**: FastAPI, uvicorn, python-dotenv
- **AI**: openai
- **Validation**: pydantic
- **Optional**: kafka-python, nltk, spark (for extended functionality)

### Frontend Dependencies
- **Core**: React 19, Next.js 15.3.5
- **HTTP**: axios
- **Styling**: Tailwind CSS 4
- **Dev Tools**: ESLint, PostCSS

### Environment Setup
1. **Backend**: Requires `OPENAI_API_KEY` in `.env` file
2. **Frontend**: No special environment variables needed
3. **Development**: Concurrent running on ports 8000 (backend) and 3000 (frontend)

## 🚀 Usage Patterns

### Basic Workflow
1. Start both backend and frontend servers
2. Enter website description (e.g., "A portfolio for a photographer with 3 pages")
3. AI generates complete website structure
4. Navigate between pages using dashboard
5. Use "Edit Page" for visual editing or AI prompts for content changes

### Advanced Features
- **Visual Editing**: Click elements to modify styles and content
- **AI Editing**: Use natural language to modify entire pages
- **Multi-Page Management**: Create and edit complex website structures
- **Real-time Preview**: See changes immediately in iframe

## 🎨 Design Philosophy

The application embodies a **cyberpunk aesthetic** with:
- **Color Scheme**: Neon cyan, purple, and green on dark backgrounds
- **Visual Effects**: Glows, gradients, blur effects, and particle animations
- **Typography**: Thin fonts with letter spacing for futuristic feel
- **Interactions**: Smooth transitions and hover effects
- **Layout**: Glass morphism and backdrop filters for depth

This creates an immersive experience that feels like using advanced technology from a sci-fi universe while maintaining high usability and functionality.

## 🔮 Future Extensibility

The codebase is designed for easy extension:
- **Backend**: Add new AI models, databases, authentication
- **Frontend**: Add new editing tools, templates, export features
- **Integration**: Connect to deployment services, version control
- **Features**: Real-time collaboration, advanced styling tools, SEO optimization

The modular architecture and clean separation of concerns make WebGen a solid foundation for building more advanced website generation tools.