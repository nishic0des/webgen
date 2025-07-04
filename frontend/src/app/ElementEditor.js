"use client";
import { useState } from "react";

export default function ElementEditor({ element, onSave, onClose }) {
	const [content, setContent] = useState(element.content);
	const [color, setColor] = useState(element.styles.color);
	const [backgroundColor, setBackgroundColor] = useState(
		element.styles.backgroundColor
	);
	const [fontSize, setFontSize] = useState(element.styles.fontSize);

	const handleSave = () => {
		onSave({
			...element,
			content,
			styles: {
				color,
				backgroundColor,
				fontSize,
			},
		});
	};

	return (
		<div className="relative max-w-lg w-full mx-4">
			<div
				className="absolute -inset-1 rounded-2xl blur opacity-40"
				style={{
					background:
						"linear-gradient(45deg, rgba(0, 255, 255, 0.3), rgba(128, 0, 255, 0.3))",
				}}></div>
			<div
				className="relative rounded-2xl p-8 border shadow-2xl"
				style={{
					backgroundColor: "rgba(17, 24, 39, 0.9)",
					borderColor: "rgba(0, 255, 255, 0.4)",
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

				<div className="flex items-center justify-between mb-8 text-center">
					<h3
						className="text-2xl font-thin text-cyan-300 flex-1"
						style={{ letterSpacing: "0.1em" }}>
						EDIT ELEMENT
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-red-400 transition-colors duration-300 text-2xl ml-4 transform hover:scale-110">
						×
					</button>
				</div>

				<div className="space-y-6">
					<div className="text-center">
						<label
							className="block text-sm font-light text-cyan-400 mb-3"
							style={{ letterSpacing: "0.1em" }}>
							ELEMENT TYPE
						</label>
						<div className="relative">
							<div
								className="absolute -inset-1 rounded-lg blur opacity-50"
								style={{
									background:
										"linear-gradient(45deg, rgba(128, 0, 255, 0.2), rgba(0, 255, 255, 0.2))",
								}}></div>
							<div
								className="relative px-4 py-3 rounded-lg text-purple-300 font-mono text-sm border"
								style={{
									backgroundColor: "rgba(0, 0, 0, 0.8)",
									borderColor: "rgba(128, 0, 255, 0.3)",
									backdropFilter: "blur(5px)",
								}}>
								{"<"}
								{element.tagName.toLowerCase()}
								{"/>"}
							</div>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-light text-cyan-400 mb-3 text-center"
							style={{ letterSpacing: "0.1em" }}>
							CONTENT DATA
						</label>
						<div className="relative">
							<div
								className="absolute -inset-1 rounded-lg blur opacity-50"
								style={{
									background:
										"linear-gradient(45deg, rgba(0, 255, 0, 0.1), rgba(0, 255, 255, 0.1))",
								}}></div>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Enter content..."
								className="relative w-full h-24 rounded-lg px-4 py-3 text-green-100 resize-none font-mono text-sm transition-all duration-500"
								style={{
									backgroundColor: "rgba(0, 0, 0, 0.8)",
									border: "1px solid rgba(0, 255, 0, 0.4)",
									backdropFilter: "blur(5px)",
								}}
								onFocus={(e) => {
									e.target.style.borderColor = "#00ff00";
									e.target.style.boxShadow = "0 0 20px rgba(0, 255, 0, 0.2)";
								}}
								onBlur={(e) => {
									e.target.style.borderColor = "rgba(0, 255, 0, 0.4)";
									e.target.style.boxShadow = "none";
								}}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6">
						<div>
							<label
								className="block text-sm font-light text-cyan-400 mb-3 text-center"
								style={{ letterSpacing: "0.1em" }}>
								TEXT COLOR MATRIX
							</label>
							<div className="relative">
								<div
									className="absolute -inset-1 rounded-lg blur opacity-50"
									style={{
										background:
											"linear-gradient(45deg, rgba(0, 0, 255, 0.1), rgba(128, 0, 255, 0.1))",
									}}></div>
								<input
									type="color"
									value={color}
									onChange={(e) => setColor(e.target.value)}
									className="relative w-full h-12 rounded-lg cursor-pointer"
									style={{
										backgroundColor: "rgba(0, 0, 0, 0.8)",
										border: "1px solid rgba(0, 0, 255, 0.4)",
										backdropFilter: "blur(5px)",
									}}
								/>
							</div>
						</div>

						<div>
							<label
								className="block text-sm font-light text-cyan-400 mb-3 text-center"
								style={{ letterSpacing: "0.1em" }}>
								BACKGROUND MATRIX
							</label>
							<div className="relative">
								<div
									className="absolute -inset-1 rounded-lg blur opacity-50"
									style={{
										background:
											"linear-gradient(45deg, rgba(255, 0, 128, 0.1), rgba(128, 0, 255, 0.1))",
									}}></div>
								<input
									type="color"
									value={backgroundColor}
									onChange={(e) => setBackgroundColor(e.target.value)}
									className="relative w-full h-12 rounded-lg cursor-pointer"
									style={{
										backgroundColor: "rgba(0, 0, 0, 0.8)",
										border: "1px solid rgba(255, 0, 128, 0.4)",
										backdropFilter: "blur(5px)",
									}}
								/>
							</div>
						</div>

						<div>
							<label
								className="block text-sm font-light text-cyan-400 mb-3 text-center"
								style={{ letterSpacing: "0.1em" }}>
								FONT SIZE VECTOR
							</label>
							<div className="relative">
								<div
									className="absolute -inset-1 rounded-lg blur opacity-50"
									style={{
										background:
											"linear-gradient(45deg, rgba(255, 255, 0, 0.1), rgba(255, 128, 0, 0.1))",
									}}></div>
								<input
									type="text"
									value={fontSize}
									onChange={(e) => setFontSize(e.target.value)}
									placeholder="16px, 1.2em, 2rem..."
									className="relative w-full rounded-lg px-4 py-3 text-yellow-100 font-mono text-sm transition-all duration-500"
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
										e.target.style.borderColor = "rgba(255, 255, 0, 0.4)";
										e.target.style.boxShadow = "none";
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-center space-x-4 mt-8">
					<button
						onClick={handleSave}
						className="group relative px-8 py-3 rounded-lg font-light uppercase transition-all duration-500 transform hover:scale-105"
						style={{
							background:
								"linear-gradient(45deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 255, 0.2))",
							border: "1px solid rgba(0, 255, 0, 0.5)",
							color: "#00ff00",
							letterSpacing: "0.1em",
						}}
						onMouseEnter={(e) => {
							e.target.style.background =
								"linear-gradient(45deg, rgba(0, 255, 0, 0.3), rgba(0, 255, 255, 0.3))";
							e.target.style.borderColor = "#00ff00";
							e.target.style.color = "white";
							e.target.style.boxShadow = "0 0 30px rgba(0, 255, 0, 0.3)";
						}}
						onMouseLeave={(e) => {
							e.target.style.background =
								"linear-gradient(45deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 255, 0.2))";
							e.target.style.borderColor = "rgba(0, 255, 0, 0.5)";
							e.target.style.color = "#00ff00";
							e.target.style.boxShadow = "none";
						}}>
						Save
					</button>
					<button
						onClick={onClose}
						className="group relative px-8 py-3 rounded-lg font-light uppercase transition-all duration-500 transform hover:scale-105"
						style={{
							background:
								"linear-gradient(45deg, rgba(107, 114, 128, 0.2), rgba(156, 163, 175, 0.2))",
							border: "1px solid rgba(107, 114, 128, 0.5)",
							color: "#9ca3af",
							letterSpacing: "0.1em",
						}}
						onMouseEnter={(e) => {
							e.target.style.borderColor = "#9ca3af";
							e.target.style.color = "white";
						}}
						onMouseLeave={(e) => {
							e.target.style.borderColor = "rgba(107, 114, 128, 0.5)";
							e.target.style.color = "#9ca3af";
						}}>
						Cancel
					</button>
				</div>
			</div>

			<style jsx>{`
				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
					}
					50% {
						opacity: 0.5;
					}
				}
			`}</style>
		</div>
	);
}
