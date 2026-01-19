# WebGen: AI-Powered Website Generator

WebGen is a full-stack application that leverages OpenAI to generate and visually edit multi-page websites from natural language prompts. It features a FastAPI backend and a Next.js (React) frontend, providing a futuristic, interactive UI for both AI-driven and manual element editing.

---

## Features

- **AI Website Generation:** Describe your website and let AI generate HTML/CSS for multiple pages.
- **Visual Editing:** Click on elements in the live preview to edit their content and styles visually.
- **AI Editing:** Use natural language prompts to modify any page with AI assistance.
- **Multi-Page Support:** Easily switch between and edit multiple generated pages.
- **Modern UI:** Built with Next.js, Tailwind CSS, and custom animations for a sleek, futuristic look.

---

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** FastAPI (Python), OpenAI API
- **State Management:** React hooks
- **Communication:** REST API (Axios)
- **Visual Editing:** Custom DOM-to-XPath mapping and live iframe preview

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/webgen.git
cd webgen
```

### 2. Backend Setup

#### a. Environment Variables

Create a `.env` file in the `backend/` directory:

```
GEMINI_API_KEY=your-gemini-api-key
```

#### b. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

If `requirements.txt` is missing, install manually:

```bash
pip install fastapi uvicorn python-dotenv google-genai
```

#### c. Run the Backend

```bash
uvicorn main:app --reload
```

The backend will be available at [http://localhost:8000](http://localhost:8000).

---

### 3. Frontend Setup

#### a. Install Dependencies

```bash
cd ../frontend
npm install
```

#### b. Run the Frontend

```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

1. **Generate a Website:**

   - Enter a description (e.g., "A portfolio for a photographer with 3 pages") and click "Generate Website".
   - AI will create the site structure and pages.

2. **Navigate Pages:**

   - Use the dashboard to switch between generated pages.

3. **Edit Visually:**

   - Click "Edit Page" and then click any element in the preview to open the visual editor.
   - Change content, text color, background, or font size, and save.
   - Changes are persisted both locally and to the backend.

4. **Edit with AI:**
   - Enter a natural language prompt (e.g., "Make all headings blue") and click "Apply".
   - The AI will update the page accordingly.

---

## File Structure Overview

- **backend/**
  - `main.py` — FastAPI app, OpenAI integration, REST endpoints for generation, editing, and persistence.
- **frontend/**
  - `src/app/page.js` — Main React component, handles state, API calls, and UI logic.
  - `src/app/ElementEditor.js` — Visual element editor modal.
  - `src/utils/api.js` — Axios API utilities for backend communication.
  - `src/utils/domUtils.js` — Utility for DOM-to-XPath mapping (for precise element targeting).

---

## API Endpoints

- `POST /generate` — Generate a new website from a description.
- `GET /pages` — List all generated pages.
- `GET /page/{page_id}` — Get a specific page.
- `POST /edit` — AI-edit a page with a prompt.
- `PATCH /pages/{page_id}` — Save visual/manual edits to a page.

---

## Customization & Extending

- **OpenAI Model:**  
  Change the model in `main.py` if you have access to GPT-4 or other models.
- **Styling:**  
  Edit `globals.css` and Tailwind config for custom themes.
- **Deployment:**  
  Deploy backend (FastAPI) to services like Render, Railway, or Fly.io.  
  Deploy frontend (Next.js) to Vercel or Netlify.  
  Update API URLs as needed for production.

---

## Troubleshooting

- **API Key Issues:**  
  Ensure your OpenAI API key is valid and present in `.env`.
- **CORS Errors:**  
  The backend is configured for local development. Adjust CORS settings in `main.py` for production.
- **Edits Not Saving:**  
  Visual edits are persisted via the `PATCH /pages/{page_id}` endpoint. Ensure the backend is running and reachable.

---

## License

MIT License

---

## Credits

- Built with [FastAPI](https://fastapi.tiangolo.com/), [Next.js](https://nextjs.org/), [OpenAI](https://openai.com/), and [Tailwind CSS](https://tailwindcss.com/).

---
