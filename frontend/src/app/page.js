"use client";
import { useState, useEffect } from "react";
import {
	generateWebsite,
	getPage,
	editPage,
	saveVisualEdit,
	getPromptExamples,
	validatePrompt,
} from "@/utils/api";
import ElementEditor from "./ElementEditor";

export default function Home() {
	const [description, setDescription] = useState("");
	const [promptScore, setPromptScore] = useState(null);
	const [showExamples, setShowExamples] = useState(false);
	const [promptExamples, setPromptExamples] = useState({});
	const [pages, setPages] = useState([]);
	const [currentPage, setCurrentPage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [editPrompt, setEditPrompt] = useState("");
	const [currentPageId, setCurrentPageId] = useState(0);
	const [selectedElement, setSelectedElement] = useState(null);
	const [editingMode, setEditingMode] = useState(false);

	// Prompt templates for quick start
	const promptTemplates = {
		business: "Create a professional business website for a digital marketing agency targeting small businesses. Include Home with services overview, About Us, Services, Testimonials, and Contact. Use modern, trustworthy design with clean typography.",
		portfolio: "Build a creative portfolio website for a UX designer targeting potential clients. Include Home with showcase, About with bio, Portfolio/Work samples, Services offered, and Contact. Use minimal, elegant design that highlights the work.",
		ecommerce: "Design an e-commerce website for sustainable fashion targeting environmentally conscious consumers. Include Home with featured products, Product catalog, About the brand, Shopping cart, and Contact. Use conversion-focused design with clear CTAs.",
		restaurant: "Create an elegant website for an Italian restaurant targeting food enthusiasts. Include Home with atmosphere photos, Menu with offerings, About with chef story, Gallery with food photos, Reservations, and Contact. Use warm, sophisticated design.",
		blog: "Create a modern blog website for tech insights targeting developers. Include Home with recent posts, About the author, Category pages, Archive, and Contact. Use readable typography and engaging layout."
	};

	// Load prompt examples on mount
	useEffect(() => {
		const loadExamples = async () => {
			try {
				const { data } = await getPromptExamples();
				setPromptExamples(data.examples);
			} catch (error) {
				console.error('Failed to load examples:', error);
			}
		};
		loadExamples();
	}, []);

	// Real-time prompt quality evaluation
	const evaluatePrompt = (text) => {
		let score = 0;
		const words = text.split(' ').length;
		
		if (words >= 20) score += 25;
		if (/(for|targeting|audience|users|clients|customers)/.test(text.toLowerCase())) score += 25;
		if (/(page|section|about|contact|home|services|portfolio|blog)/.test(text.toLowerCase())) score += 25;
		if (/(modern|clean|professional|minimalist|design|style|elegant)/.test(text.toLowerCase())) score += 25;
		
		setPromptScore({
			score,
			color: score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400',
			grade: score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Improvement'
		});
	};

	const handleGenerate = async () => {
		setLoading(true);
		try {
			const { data } = await generateWebsite(description);
			setPages(data.pages);
			if (data.pages.length > 0) {
				setCurrentPage(data.pages[0]);
				setCurrentPageId(0);
			}
			
			// Show prompt quality feedback if available
			if (data.prompt_quality) {
				const quality = data.prompt_quality;
				console.log(`Prompt Quality: ${quality.grade} (${quality.score}/100)`);
				if (data.suggestions) {
					console.log("Suggestions for next time:", data.suggestions);
				}
			}
		} catch (error) {
			console.error("Error generating website:", error);
			alert("Failed to generate website");
		} finally {
			setLoading(false);
		}
	};

	const handlePageClick = async (pageId) => {
		const { data } = await getPage(pageId);
		setCurrentPage(data);
		setCurrentPageId(pageId);
	};

	const handleEdit = async () => {
		if (!currentPage) return;
		try {
			const { data } = await editPage(
				currentPageId,
				editPrompt,
				currentPage.html,
				currentPage.css
			);
			setCurrentPage(data.page);
			setEditPrompt("");
		} catch (error) {
			console.error("Edit failed:", error);
			alert(`Edit failed: ${error.response?.data?.detail || error.message}`);
		}
	};

	const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${currentPage?.css || ""}
          body { padding: 20px; }
          * {
             outline: ${
								editingMode ? "1px dashed rgba(0,255,255,0.4)" : "none"
							};
             min-height: 20px;
          }
          *:hover {
            ${
							editingMode
								? "background: rgba(0,255,255,0.05); cursor: pointer; transition: all 0.2s ease;"
								: ""
						}
          }
        </style>
      </head>
      <body>
        ${currentPage?.html || ""}
        <script>
          document.addEventListener('click', (e) => {
            if (!window.editingEnabled) return;
            e.preventDefault();
            e.stopPropagation();
            const styles = window.getComputedStyle(e.target);
            window.parent.postMessage({
              type: 'ELEMENT_CLICK',
              element: e.target.outerHTML,
              xpath: getXPath(e.target),
              tagName: e.target.tagName,
              textContent: e.target.textContent,
              styles: {
                color: styles.color,
                backgroundColor: styles.backgroundColor,
                fontSize: styles.fontSize
              }
            }, '*');
                        
            function getXPath(element) {
              if (element.id) return '#' + element.id;
              if (element === document.body) return 'body';
                            
              const path = [];
              while (element.parentNode) {
                let index = 0;
                const siblings = element.parentNode.childNodes;
                for (let i = 0; i < siblings.length; i++) {
                  const sibling = siblings[i];
                  if (sibling === element) {
                    path.unshift(element.tagName.toLowerCase() + (index > 0 ? ':nth-child(' + (index + 1) + ')' : ''));
                    break;
                  }
                  if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                    index++;
                  }
                }
                element = element.parentNode;
              }
              return path.join(' > ');
            }
          });
        </script>
      </body>
    </html>
  `;

	useEffect(() => {
		const handleMessage = (event) => {
			if (event.data.type === "ELEMENT_CLICK" && editingMode) {
				setSelectedElement({
					html: event.data.element,
					xpath: event.data.xpath,
					tagName: event.data.tagName,
					content: event.data.textContent,
					styles: event.data.styles,
				});
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [editingMode]);

	return (
		<div
			className="min-h-screen bg-black text-white relative"
			style={{ fontFamily: "system-ui, sans-serif" }}>
			{/* Futuristic Background Effects */}
			<div
				className="fixed inset-0 opacity-5 pointer-events-none"
				style={{
					backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
					backgroundSize: "50px 50px",
					animation: "gridMove 20s linear infinite",
				}}></div>

			{/* Header */}
			<div className="border-b border-cyan-500/20 relative">
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)`,
					}}></div>
				<div className="max-w-6xl mx-auto px-6 py-16 text-center relative z-10">
					<h1
						className="text-6xl font-thin mb-4"
						style={{
							background: "linear-gradient(45deg, #00ffff, #0080ff, #8000ff)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							letterSpacing: "0.1em",
						}}>
						WEBGEN
					</h1>
					<div
						className="h-px mx-auto w-64 opacity-60"
						style={{
							background:
								"linear-gradient(90deg, transparent, #00ffff, transparent)",
							animation: "pulse 2s infinite",
						}}></div>
					<p
						className="text-gray-400 text-sm mt-6 font-light"
						style={{ letterSpacing: "0.2em" }}>
						An AI powered website generator
					</p>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
				{/* Generation Section */}
				<div className="mb-16 text-center">
					<div className="relative group">
						<div
							className="absolute -inset-1 rounded-2xl blur opacity-25 transition-opacity duration-1000 group-hover:opacity-40"
							style={{
								background:
									"linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(128, 0, 255, 0.2))",
							}}></div>
						<div
							className="relative rounded-2xl p-10 border shadow-2xl"
							style={{
								backgroundColor: "rgba(17, 24, 39, 0.8)",
								borderColor: "rgba(0, 255, 255, 0.3)",
								backdropFilter: "blur(10px)",
							}}>
							<div
								className="absolute top-0 left-1/2 w-4 h-4 rounded-full shadow-lg"
								style={{
									transform: "translate(-50%, -50%)",
									backgroundColor: "#00ffff",
									boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
									animation: "pulse 2s infinite",
								}}></div>

							<h2
								className="text-2xl font-thin mb-8 text-cyan-300"
								style={{ letterSpacing: "0.1em" }}>
								GENERATE YOUR WEBSITE
							</h2>

							<div className="space-y-8">
								{/* Enhanced Prompt Helper */}
								<div className="space-y-6">
									{/* Prompt Quality Indicator */}
									{promptScore && (
										<div className={`text-center text-sm ${promptScore.color}`}>
											Prompt Quality: {promptScore.score}% ({promptScore.grade})
											{promptScore.score < 50 && (
												<div className="text-xs text-gray-400 mt-1">
													Try adding more details about purpose, audience, and pages
												</div>
											)}
										</div>
									)}

									{/* Quick Start Templates */}
									<div className="mb-4">
										<div className="flex justify-between items-center mb-3">
											<h4 className="text-cyan-400 text-sm font-medium">🚀 Quick Start Templates</h4>
											<button 
												onClick={() => setShowExamples(!showExamples)}
												className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
											>
												{showExamples ? 'Hide' : 'Show'} Examples
											</button>
										</div>
										<div className="flex flex-wrap gap-2">
											{Object.entries(promptTemplates).map(([key, template]) => (
												<button
													key={key}
													onClick={() => {
														setDescription(template);
														evaluatePrompt(template);
													}}
													className="px-3 py-1 text-xs bg-cyan-600/20 text-cyan-300 rounded hover:bg-cyan-600/30 transition-colors"
												>
													{key.charAt(0).toUpperCase() + key.slice(1)}
												</button>
											))}
										</div>
									</div>

									{/* Prompt Writing Guide */}
									{showExamples && Object.keys(promptExamples).length > 0 && (
										<div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-400/30">
											<h4 className="text-cyan-400 font-medium mb-3">💡 Example High-Quality Prompts</h4>
											<div className="space-y-3 text-xs">
												{Object.entries(promptExamples).map(([key, example]) => (
													<div key={key} className="border-l-2 border-cyan-400/30 pl-3">
														<div className="text-white font-medium mb-1">{example.title}</div>
														<div className="text-gray-400 line-clamp-2">{example.prompt}</div>
														<div className="text-green-400 text-xs">Quality: {example.quality_score}%</div>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Writing Tips */}
									<div className="p-4 rounded-lg bg-gray-800/50 border border-cyan-400/30">
										<h4 className="text-cyan-400 font-medium mb-3">✅ Write Better Prompts</h4>
										<div className="grid md:grid-cols-2 gap-4 text-sm">
											<div>
												<h5 className="text-white font-medium mb-2">Include These:</h5>
												<ul className="text-gray-300 space-y-1 text-xs">
													<li>• Website purpose & business type</li>
													<li>• Target audience</li>
													<li>• Specific pages needed</li>
													<li>• Design style preferences</li>
													<li>• Key features required</li>
												</ul>
											</div>
											<div>
												<h5 className="text-white font-medium mb-2">📝 Example Structure:</h5>
												<p className="text-gray-400 text-xs leading-relaxed">
													"Create a [TYPE] website for [BUSINESS] targeting [AUDIENCE]. 
													Include [PAGES]. Use [STYLE] design with [COLORS/FEATURES]."
												</p>
											</div>
										</div>
									</div>

									{/* Main Description Textarea */}
									<div className="relative">
										<textarea
											placeholder="Describe your website in detail... (e.g., Create a modern portfolio website for a UX designer targeting potential clients...)"
											value={description}
											onChange={(e) => {
												setDescription(e.target.value);
												evaluatePrompt(e.target.value);
											}}
											className="w-full h-40 rounded-xl px-6 py-4 text-cyan-100 resize-none font-mono text-sm transition-all duration-500"
											style={{
												backgroundColor: "rgba(0, 0, 0, 0.8)",
												border: "1px solid rgba(0, 255, 255, 0.4)",
												backdropFilter: "blur(5px)",
											}}
											onFocus={(e) => {
												e.target.style.borderColor = "#00ffff";
												e.target.style.boxShadow = "0 0 20px rgba(0, 255, 255, 0.2)";
											}}
											onBlur={(e) => {
												e.target.style.borderColor = "rgba(0, 255, 255, 0.4)";
												e.target.style.boxShadow = "none";
											}}
										/>
										<div
											className="absolute bottom-4 right-4 w-3 h-3 rounded-full"
											style={{
												backgroundColor: description.length > 50 ? "#00ff00" : description.length > 20 ? "#ffff00" : "#ff0000",
												animation: "pulse 2s infinite",
											}}
										/>
									</div>
								</div>

								<div className="flex justify-center">
									<button
										onClick={handleGenerate}
										disabled={loading || !description.trim()}
										className="group relative px-12 py-4 rounded-xl font-light uppercase transition-all duration-500 transform hover:scale-105 active:scale-95"
										style={{
											background: loading
												? "rgba(0, 255, 255, 0.1)"
												: "linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(128, 0, 255, 0.2))",
											border: "1px solid rgba(0, 255, 255, 0.5)",
											color: "#00ffff",
											letterSpacing: "0.1em",
										}}
										onMouseEnter={(e) => {
											if (!loading && description.trim()) {
												e.target.style.background =
													"linear-gradient(45deg, rgba(0, 255, 255, 0.3), rgba(128, 0, 255, 0.3))";
												e.target.style.borderColor = "#00ffff";
												e.target.style.color = "white";
												e.target.style.boxShadow =
													"0 0 30px rgba(0, 255, 255, 0.3)";
											}
										}}
										onMouseLeave={(e) => {
											if (!loading) {
												e.target.style.background =
													"linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(128, 0, 255, 0.2))";
												e.target.style.borderColor = "rgba(0, 255, 255, 0.5)";
												e.target.style.color = "#00ffff";
												e.target.style.boxShadow = "none";
											}
										}}>
										{loading ? (
											<div className="flex items-center space-x-3">
												<div
													className="w-5 h-5 border-2 rounded-full animate-spin"
													style={{
														borderColor: "rgba(0, 255, 255, 0.3)",
														borderTopColor: "#00ffff",
													}}></div>
												<span>PROCESSING...</span>
												<div className="flex space-x-1">
													<div
														className="w-1 h-1 bg-cyan-400 rounded-full"
														style={{ animation: "pulse 1s infinite" }}></div>
													<div
														className="w-1 h-1 bg-cyan-400 rounded-full"
														style={{
															animation: "pulse 1s infinite 0.2s",
														}}></div>
													<div
														className="w-1 h-1 bg-cyan-400 rounded-full"
														style={{
															animation: "pulse 1s infinite 0.4s",
														}}></div>
												</div>
											</div>
										) : (
											"GENERATE WEBSITE"
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Pages Dashboard */}
				{pages.length > 0 && (
					<div
						className="mb-16 text-center"
						style={{ animation: "fadeIn 0.6s ease-out" }}>
						<div className="relative group">
							<div
								className="absolute -inset-1 rounded-2xl blur opacity-25 transition-opacity duration-1000 group-hover:opacity-40"
								style={{
									background:
										"linear-gradient(45deg, rgba(128, 0, 255, 0.2), rgba(255, 0, 128, 0.2))",
								}}></div>
							<div
								className="relative rounded-2xl p-10 border shadow-2xl"
								style={{
									backgroundColor: "rgba(17, 24, 39, 0.8)",
									borderColor: "rgba(128, 0, 255, 0.3)",
									backdropFilter: "blur(10px)",
								}}>
								<div
									className="absolute top-0 left-1/2 w-4 h-4 rounded-full shadow-lg"
									style={{
										transform: "translate(-50%, -50%)",
										backgroundColor: "#8000ff",
										boxShadow: "0 0 20px rgba(128, 0, 255, 0.5)",
										animation: "pulse 2s infinite",
									}}></div>

								<h2
									className="text-2xl font-thin mb-8 text-purple-300"
									style={{ letterSpacing: "0.1em" }}>
									DASHBOARD
								</h2>

								<div className="flex flex-wrap justify-center gap-4">
									{pages.map((page, index) => (
										<button
											key={index}
											onClick={() => handlePageClick(index)}
											className="group relative px-8 py-3 rounded-lg font-light uppercase transition-all duration-500 transform hover:scale-105"
											style={{
												background:
													currentPageId === index
														? "linear-gradient(45deg, rgba(128, 0, 255, 0.3), rgba(255, 0, 128, 0.3))"
														: "rgba(0, 0, 0, 0.6)",
												border:
													currentPageId === index
														? "1px solid #8000ff"
														: "1px solid rgba(107, 114, 128, 0.5)",
												color: currentPageId === index ? "white" : "#9ca3af",
												letterSpacing: "0.1em",
											}}
											onMouseEnter={(e) => {
												if (currentPageId !== index) {
													e.target.style.borderColor = "rgba(128, 0, 255, 0.5)";
													e.target.style.color = "#c084fc";
													e.target.style.background = "rgba(128, 0, 255, 0.1)";
												}
											}}
											onMouseLeave={(e) => {
												if (currentPageId !== index) {
													e.target.style.borderColor =
														"rgba(107, 114, 128, 0.5)";
													e.target.style.color = "#9ca3af";
													e.target.style.background = "rgba(0, 0, 0, 0.6)";
												}
											}}>
											{page.name}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Preview Section */}
				{currentPage && (
					<div style={{ animation: "fadeIn 0.6s ease-out" }}>
						<div className="relative group">
							<div
								className="absolute -inset-1 rounded-2xl blur opacity-25 transition-opacity duration-1000 group-hover:opacity-40"
								style={{
									background:
										"linear-gradient(45deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 255, 0.2))",
								}}></div>
							<div
								className="relative rounded-2xl border shadow-2xl overflow-hidden"
								style={{
									backgroundColor: "rgba(17, 24, 39, 0.8)",
									borderColor: "rgba(0, 255, 0, 0.3)",
									backdropFilter: "blur(10px)",
								}}>
								<div
									className="absolute top-0 left-1/2 w-4 h-4 rounded-full shadow-lg"
									style={{
										transform: "translate(-50%, -50%)",
										backgroundColor: "#00ff00",
										boxShadow: "0 0 20px rgba(0, 255, 0, 0.5)",
										animation: "pulse 2s infinite",
									}}></div>

								{/* Controls */}
								<div
									className="p-8 border-b text-center relative"
									style={{ borderColor: "rgba(0, 255, 0, 0.2)" }}>
									<div
										className="absolute inset-0 opacity-10"
										style={{
											backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)`,
										}}></div>
									<h2
										className="text-2xl font-thin text-green-300 mb-8 relative z-10"
										style={{ letterSpacing: "0.1em" }}>
										PREVIEW: {currentPage.name}
									</h2>

									<div className="flex flex-col items-center space-y-6 relative z-10">
										<button
											onClick={() => {
												setEditing(!editing);
												setEditingMode(!editingMode);
											}}
											className="group relative px-10 py-3 rounded-lg font-light uppercase transition-all duration-500 transform hover:scale-105"
											style={{
												background: editing
													? "linear-gradient(45deg, rgba(255, 0, 0, 0.3), rgba(255, 0, 128, 0.3))"
													: "linear-gradient(45deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 255, 0.2))",
												border: editing
													? "1px solid #ff0000"
													: "1px solid rgba(0, 255, 0, 0.5)",
												color: editing ? "white" : "#00ff00",
												letterSpacing: "0.1em",
											}}>
											{editing ? "EXIT EDITOR" : "EDIT PAGE"}
										</button>

										{editing && (
											<div
												className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4"
												style={{ animation: "slideIn 0.4s ease-out" }}>
												<div className="relative">
													<input
														type="text"
														placeholder="Enter edit prompt..."
														value={editPrompt}
														onChange={(e) => setEditPrompt(e.target.value)}
														className="px-6 py-3 rounded-lg text-yellow-100 w-full lg:w-96 font-mono text-sm transition-all duration-500"
														style={{
															backgroundColor: "rgba(0, 0, 0, 0.8)",
															border: "1px solid rgba(255, 255, 0, 0.4)",
															backdropFilter: "blur(5px)",
														}}
														onFocus={(e) => {
															e.target.style.borderColor = "#ffff00";
															e.target.style.boxShadow =
																"0 0 20px rgba(255, 255, 0, 0.2)";
														}}
														onBlur={(e) => {
															e.target.style.borderColor =
																"rgba(255, 255, 0, 0.4)";
															e.target.style.boxShadow = "none";
														}}
													/>
													<div
														className="absolute right-2 top-1/2 w-2 h-2 rounded-full"
														style={{
															transform: "translateY(-50%)",
															backgroundColor: "#ffff00",
															animation: "pulse 2s infinite",
														}}></div>
												</div>
												<button
													onClick={handleEdit}
													disabled={!editPrompt.trim()}
													className="group relative px-8 py-3 rounded-lg font-light uppercase transition-all duration-500 transform hover:scale-105 active:scale-95"
													style={{
														background:
															"linear-gradient(45deg, rgba(255, 255, 0, 0.2), rgba(255, 128, 0, 0.2))",
														border: "1px solid rgba(255, 255, 0, 0.5)",
														color: "#ffff00",
														letterSpacing: "0.1em",
													}}>
													APPLY
												</button>
											</div>
										)}
									</div>
								</div>

								{/* Preview Frame */}
								<div className="p-8">
									<div className="relative">
										<div
											className="absolute -inset-2 rounded-xl blur"
											style={{
												background:
													"linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(128, 0, 255, 0.1))",
											}}></div>
										<iframe
											srcDoc={iframeHtml}
											className="relative w-full h-[700px] rounded-xl bg-white shadow-2xl"
											style={{
												border: "1px solid rgba(0, 255, 255, 0.3)",
												backdropFilter: "blur(5px)",
											}}
											onLoad={(e) => {
												e.target.contentWindow.editingEnabled = editingMode;
											}}
										/>
										{editingMode && (
											<div
												className="absolute top-4 right-4 px-4 py-2 rounded-lg text-black text-sm font-light uppercase shadow-lg"
												style={{
													background:
														"linear-gradient(45deg, #00ffff, #0080ff)",
													boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)",
													animation: "pulse 2s infinite",
												}}>
												<div className="flex items-center space-x-2">
													<div
														className="w-2 h-2 bg-black rounded-full"
														style={{ animation: "ping 1s infinite" }}></div>
													<span>Editing</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Element Editor Model */}
			{selectedElement && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						backdropFilter: "blur(5px)",
						animation: "fadeIn 0.3s ease-out",
					}}>
					<div style={{ animation: "scaleIn 0.3s ease-out" }}>
						<ElementEditor
							element={selectedElement}
							onSave={async (updatedElement) => {
								const newCssRule = `
              ${updatedElement.xpath} {
                color: ${updatedElement.styles.color};
                background-color: ${updatedElement.styles.backgroundColor};
                font-size: ${updatedElement.styles.fontSize};
              }
            `;
								const updatedPage = {
									...currentPage,
									name: currentPage.name,
									html: currentPage.html.replace(
										selectedElement.html,
										`<${updatedElement.tagName} style="color: ${updatedElement.styles.color}; background-color: ${updatedElement.styles.backgroundColor}; font-size: ${updatedElement.styles.fontSize}">
					${updatedElement.content}
				  </${updatedElement.tagName}>`
									),
									css: `${currentPage.css}\n${newCssRule}`,
								};
								setCurrentPage(updatedPage);
								setPages((prevPages) =>
									prevPages.map((p, idx) =>
										idx === currentPageId ? updatedPage : p
									)
								);
								setSelectedElement(null);
								try {
									await saveVisualEdit(
										currentPageId,
										updatedPage.html,
										updatedPage.css
									);
								} catch (err) {
									alert("Failed to save changes to server.");
									console.error("Save error:", err);
								}
							}}
							onClose={() => setSelectedElement(null)}
						/>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes scaleIn {
					from {
						opacity: 0;
						transform: scale(0.95);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
				@keyframes gridMove {
					0% {
						transform: translate(0, 0);
					}
					100% {
						transform: translate(50px, 50px);
					}
				}
				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
					}
					50% {
						opacity: 0.5;
					}
				}
				@keyframes ping {
					75%,
					100% {
						transform: scale(2);
						opacity: 0;
					}
				}
			`}</style>
		</div>
	);
}
