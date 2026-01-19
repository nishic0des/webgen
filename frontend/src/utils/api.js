import axios from "axios";

const API = axios.create({
	baseURL: "https://webgen-backend-s88i.onrender.com",
});

export const generateWebsite = (description) =>
	API.post("/generate", { description });
export const getPages = () => API.get("/pages");
export const getPage = (pageId) => API.get(`/page/${pageId}`);
export const editPage = async (pageId, editPrompt, html, css) => {
	if (pageId < 0) {
		throw new Error("Invalid page ID - must be positive");
	}
	if (!editPrompt || editPrompt.length < 5) {
		throw new Error("Edit prompt must be at least 5 characters");
	}

	return API.post("/edit", {
		page_id: pageId,
		edit_prompt: editPrompt,
		current_html: html,
		current_css: css,
	});
};
export const saveVisualEdit = async (pageId, updatedHtml, updatedCss) => {
	return API.patch(`/pages/${pageId}`, {
		html: updatedHtml,
		css: updatedCss,
	});
};
