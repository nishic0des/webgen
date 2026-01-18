"use client";
import { useState, useEffect } from "react";
import {
	generateWebsite,
	getPage,
	editPage,
	saveVisualEdit,
} from "@/utils/api";
import ElementEditor from "./ElementEditor";

export default function Home() {
	const [description, setDescription] = useState("");
	const [pages, setPages] = useState([]);
	const [currentPage, setCurrentPage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [editPrompt, setEditPrompt] = useState("");
	const [currentPageId, setCurrentPageId] = useState(0);
	const [selectedElement, setSelectedElement] = useState(null);
	const [editingMode, setEditingMode] = useState(false);
	const [viewMode, setViewMode] = useState("preview"); // "preview" or "code"
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");

	const handleCopyCode = async (code, type) => {
		try {
			await navigator.clipboard.writeText(code);
			setToastMessage(`${type} copied to clipboard!`);
			setShowToast(true);
			setTimeout(() => setShowToast(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
			setToastMessage("Failed to copy code");
			setShowToast(true);
			setTimeout(() => setShowToast(false), 2000);
		}
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
				currentPage.css,
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
								<div className="relative">
									<textarea
										placeholder="Describe your website architecture..."
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										className="w-full h-40 rounded-xl px-6 py-4 text-cyan-100 resize-none font-mono text-sm transition-all duration-500"
										style={{
											backgroundColor: "rgba(0, 0, 0, 0.8)",
											border: "1px solid rgba(0, 255, 255, 0.4)",
											backdropFilter: "blur(5px)",
										}}
										onFocus={(e) => {
											e.target.style.borderColor = "#00ffff";
											e.target.style.boxShadow =
												"0 0 20px rgba(0, 255, 255, 0.2)";
										}}
										onBlur={(e) => {
											e.target.style.borderColor = "rgba(0, 255, 255, 0.4)";
											e.target.style.boxShadow = "none";
										}}
									/>
									<div className="absolute bottom-2 right-2 text-xs text-cyan-500/60 font-mono">
										{description.length}/1000
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
								className="relative rounded-2xl border shadow-2xl"
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
										{/* View Mode Toggle Buttons */}
										<div className="absolute top-4 right-4 z-10 flex space-x-1">
											<div className="flex bg-gray-800/80 backdrop-blur-md rounded-full p-1 border border-gray-700/50 shadow-xl">
												<button
													type="button"
													onClick={() => setViewMode("preview")}
													className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
														viewMode === "preview"
															? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
															: "text-gray-400 hover:text-white hover:bg-gray-700/50"
													}`}>
													{viewMode === "preview" && (
														<div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"></div>
													)}
													<span className="relative flex items-center space-x-2">
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
															/>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
															/>
														</svg>
													</span>
												</button>
												<button
													type="button"
													onClick={() => setViewMode("code")}
													className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
														viewMode === "code"
															? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
															: "text-gray-400 hover:text-white hover:bg-gray-700/50"
													}`}>
													{viewMode === "code" && (
														<div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md"></div>
													)}
													<span className="relative flex items-center space-x-2">
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
															/>
														</svg>
													</span>
												</button>
											</div>
										</div>

										<div
											className="absolute -inset-2 rounded-xl blur"
											style={{
												background:
													"linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(128, 0, 255, 0.1))",
											}}></div>
										{viewMode === "preview" ? (
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
										) : (
											<div className="relative w-full h-[700px] rounded-xl bg-gray-900 shadow-2xl overflow-auto">
												<div className="p-4">
													<div className="mb-4">
														<div className="flex items-center mb-2">
															<h3 className="text-white text-lg font-semibold mr-2">
																HTML
															</h3>
															<button
																type="button"
																onClick={() =>
																	handleCopyCode(
																		currentPage?.html || "",
																		"HTML",
																	)
																}
																className="p-1 text-gray-400 hover:text-white transition-colors"
																title="Copy HTML">
																<svg
																	className="w-5 h-5"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24">
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
																	/>
																</svg>
															</button>
														</div>
														<pre className="bg-gray-800 p-4 rounded-lg overflow-auto text-green-400 text-sm font-mono">
															<code>
																{currentPage?.html || "No HTML content"}
															</code>
														</pre>
													</div>
													<div className="mb-4">
														<div className="flex items-center mb-2">
															<h3 className="text-white text-lg font-semibold mr-2">
																CSS
															</h3>
															<button
																type="button"
																onClick={() =>
																	handleCopyCode(currentPage?.css || "", "CSS")
																}
																className="p-1 text-gray-400 hover:text-white transition-colors"
																title="Copy CSS">
																<svg
																	className="w-5 h-5"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24">
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
																	/>
																</svg>
															</button>
														</div>
														<pre className="bg-gray-800 p-4 rounded-lg overflow-auto text-blue-400 text-sm font-mono">
															<code>
																{currentPage?.css || "No CSS content"}
															</code>
														</pre>
													</div>
												</div>
											</div>
										)}
										{editingMode && viewMode === "preview" && (
											<div
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
				  </${updatedElement.tagName}>`,
									),
									css: `${currentPage.css}\n${newCssRule}`,
								};
								setCurrentPage(updatedPage);
								setPages((prevPages) =>
									prevPages.map((p, idx) =>
										idx === currentPageId ? updatedPage : p,
									),
								);
								setSelectedElement(null);
								try {
									await saveVisualEdit(
										currentPageId,
										updatedPage.html,
										updatedPage.css,
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

			{/* Toast Notification */}
			{showToast && (
				<div
					className="fixed bottom-8 right-8 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg z-50"
					style={{
						animation: "slideInRight 0.3s ease-out",
						boxShadow: "0 4px 20px rgba(0, 255, 0, 0.3)",
					}}>
					<div className="flex items-center space-x-2">
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<span className="font-medium">{toastMessage}</span>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes slideInRight {
					from {
						opacity: 0;
						transform: translateX(100%);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
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
