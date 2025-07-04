"use client";
import { useState, useEffect } from "react";
import { getPromptExamples, validatePrompt } from "@/utils/api";
import PromptGuide from "./PromptGuide";

export default function PromptHelper({ description, setDescription }) {
	const [examples, setExamples] = useState({});
	const [showExamples, setShowExamples] = useState(false);
	const [promptQuality, setPromptQuality] = useState(null);
	const [isValidating, setIsValidating] = useState(false);
	const [showBuilder, setShowBuilder] = useState(false);
	const [showGuide, setShowGuide] = useState(false);
	const [promptElements, setPromptElements] = useState({
		purpose: '',
		audience: '',
		style: '',
		pages: [],
		features: []
	});

	// Load examples on component mount
	useEffect(() => {
		const loadExamples = async () => {
			try {
				const { data } = await getPromptExamples();
				setExamples(data.examples);
			} catch (error) {
				console.error("Failed to load examples:", error);
			}
		};
		loadExamples();
	}, []);

	// Validate prompt on description change (debounced)
	useEffect(() => {
		if (!description.trim()) {
			setPromptQuality(null);
			return;
		}

		const timer = setTimeout(async () => {
			setIsValidating(true);
			try {
				const { data } = await validatePrompt(description);
				setPromptQuality(data.quality_score);
			} catch (error) {
				console.error("Validation failed:", error);
			} finally {
				setIsValidating(false);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [description]);

	const purposeOptions = [
		'Business Website', 'Portfolio', 'Blog', 'E-commerce', 
		'Landing Page', 'Corporate Site', 'Personal Site', 'Restaurant',
		'Medical Practice', 'Law Firm', 'Consulting'
	];
	
	const styleOptions = [
		'Modern & Minimalist', 'Professional', 'Creative & Artistic', 
		'Tech & Futuristic', 'Classic & Elegant', 'Bold & Colorful',
		'Clean & Simple', 'Sophisticated'
	];

	const audienceOptions = [
		'Business clients', 'Individual customers', 'Students', 'Professionals',
		'Patients', 'Local community', 'Online shoppers', 'Tech enthusiasts'
	];

	const generatePrompt = () => {
		const parts = [];
		if (promptElements.purpose) parts.push(`Create a ${promptElements.purpose.toLowerCase()}`);
		if (promptElements.audience) parts.push(`targeting ${promptElements.audience.toLowerCase()}`);
		if (promptElements.style) parts.push(`with a ${promptElements.style.toLowerCase()} design`);
		if (promptElements.pages.length) parts.push(`Include pages: ${promptElements.pages.join(', ')}`);
		if (promptElements.features.length) parts.push(`Features: ${promptElements.features.join(', ')}`);
		
		setDescription(parts.join('. ') + '.');
	};

	const addPage = (page) => {
		if (page && !promptElements.pages.includes(page)) {
			setPromptElements(prev => ({
				...prev,
				pages: [...prev.pages, page]
			}));
		}
	};

	const removePage = (page) => {
		setPromptElements(prev => ({
			...prev,
			pages: prev.pages.filter(p => p !== page)
		}));
	};

	const getQualityColor = (score) => {
		if (score >= 85) return '#00ff00';
		if (score >= 70) return '#ffff00';
		if (score >= 55) return '#ff8800';
		return '#ff0000';
	};

	return (
		<div className="space-y-6">
			{/* Prompt Quality Indicator */}
			{promptQuality && (
				<div 
					className="p-4 rounded-lg border"
					style={{
						backgroundColor: "rgba(0, 0, 0, 0.6)",
						borderColor: `${getQualityColor(promptQuality.score)}40`,
					}}
				>
					<div className="flex items-center justify-between mb-3">
						<span className="text-sm font-light">Prompt Quality</span>
						<div className="flex items-center space-x-2">
							<div 
								className="w-3 h-3 rounded-full"
								style={{
									backgroundColor: getQualityColor(promptQuality.score),
									boxShadow: `0 0 10px ${getQualityColor(promptQuality.score)}50`
								}}
							></div>
							<span 
								className="font-mono text-sm"
								style={{ color: getQualityColor(promptQuality.score) }}
							>
								{promptQuality.grade} ({promptQuality.score}/100)
							</span>
						</div>
					</div>
					
					{promptQuality.strengths?.length > 0 && (
						<div className="mb-2">
							<span className="text-xs text-green-400">✓ Strengths: </span>
							<span className="text-xs text-gray-300">{promptQuality.strengths.join(', ')}</span>
						</div>
					)}
					
					{promptQuality.feedback?.length > 0 && (
						<div>
							<span className="text-xs text-yellow-400">⚡ Suggestions: </span>
							<span className="text-xs text-gray-300">{promptQuality.feedback.join(', ')}</span>
						</div>
					)}
				</div>
			)}

			{/* Controls */}
			<div className="flex justify-between items-center">
				<div className="flex space-x-4">
					<button 
						onClick={() => setShowExamples(!showExamples)}
						className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
					>
						{showExamples ? 'Hide' : 'Show'} Examples
					</button>
					<button 
						onClick={() => setShowBuilder(!showBuilder)}
						className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
					>
						{showBuilder ? 'Hide' : 'Show'} Builder
					</button>
				</div>
				<button 
					onClick={() => setShowGuide(true)}
					className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
				>
					📚 Writing Guide
				</button>
			</div>

			{/* Prompt Examples */}
			{showExamples && Object.keys(examples).length > 0 && (
				<div 
					className="p-4 rounded-lg border"
					style={{
						backgroundColor: "rgba(0, 0, 0, 0.6)",
						borderColor: "rgba(0, 255, 255, 0.2)",
						animation: "fadeIn 0.3s ease-out"
					}}
				>
					<h3 className="text-cyan-300 font-light mb-4" style={{ letterSpacing: "0.1em" }}>
						EXAMPLE PROMPTS
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{Object.entries(examples).map(([key, example]) => (
							<div 
								key={key}
								className="p-3 rounded border cursor-pointer hover:border-cyan-400 transition-all duration-300"
								style={{
									backgroundColor: "rgba(0, 0, 0, 0.4)",
									borderColor: "rgba(107, 114, 128, 0.3)",
								}}
								onClick={() => setDescription(example.prompt)}
							>
								<h4 className="text-cyan-400 font-semibold text-sm mb-2">{example.title}</h4>
								<p className="text-gray-300 text-xs mb-3 line-clamp-3">{example.prompt}</p>
								<div className="flex justify-between items-center">
									<span className="text-xs text-green-400">Score: {example.quality_score}/100</span>
									<span className="text-cyan-500 text-xs hover:text-cyan-300">Use This →</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Smart Prompt Builder */}
			{showBuilder && (
				<div 
					className="p-4 rounded-lg border space-y-4"
					style={{
						backgroundColor: "rgba(0, 0, 0, 0.6)",
						borderColor: "rgba(128, 0, 255, 0.2)",
						animation: "fadeIn 0.3s ease-out"
					}}
				>
					<h3 className="text-purple-300 font-light mb-4" style={{ letterSpacing: "0.1em" }}>
						SMART PROMPT BUILDER
					</h3>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Purpose */}
						<div>
							<label className="block text-sm mb-2 text-cyan-400">Website Purpose</label>
							<select 
								value={promptElements.purpose}
								onChange={(e) => setPromptElements(prev => ({...prev, purpose: e.target.value}))}
								className="w-full p-2 rounded bg-black border border-cyan-500/40 text-cyan-100 text-sm"
							>
								<option value="">Select purpose...</option>
								{purposeOptions.map(option => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						</div>
						
						{/* Audience */}
						<div>
							<label className="block text-sm mb-2 text-cyan-400">Target Audience</label>
							<select 
								value={promptElements.audience}
								onChange={(e) => setPromptElements(prev => ({...prev, audience: e.target.value}))}
								className="w-full p-2 rounded bg-black border border-cyan-500/40 text-cyan-100 text-sm"
							>
								<option value="">Select audience...</option>
								{audienceOptions.map(option => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						</div>
						
						{/* Style */}
						<div>
							<label className="block text-sm mb-2 text-cyan-400">Design Style</label>
							<select 
								value={promptElements.style}
								onChange={(e) => setPromptElements(prev => ({...prev, style: e.target.value}))}
								className="w-full p-2 rounded bg-black border border-cyan-500/40 text-cyan-100 text-sm"
							>
								<option value="">Select style...</option>
								{styleOptions.map(option => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						</div>

						{/* Pages */}
						<div>
							<label className="block text-sm mb-2 text-cyan-400">Pages/Sections</label>
							<div className="flex mb-2">
								<input 
									type="text"
									placeholder="Add page (e.g., About, Services)"
									className="flex-1 p-2 rounded-l bg-black border border-cyan-500/40 text-cyan-100 text-sm"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											addPage(e.target.value);
											e.target.value = '';
										}
									}}
								/>
								<button 
									onClick={(e) => {
										const input = e.target.previousElementSibling;
										addPage(input.value);
										input.value = '';
									}}
									className="px-3 py-2 bg-cyan-500/20 border border-l-0 border-cyan-500/40 rounded-r text-cyan-300 text-sm hover:bg-cyan-500/30"
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-1">
								{promptElements.pages.map(page => (
									<span 
										key={page}
										className="px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-300 cursor-pointer hover:bg-red-500/20 hover:text-red-300"
										onClick={() => removePage(page)}
									>
										{page} ×
									</span>
								))}
							</div>
						</div>
					</div>
					
					<button 
						onClick={generatePrompt}
						className="w-full py-2 bg-purple-500/20 border border-purple-500 rounded text-purple-300 hover:bg-purple-500/30 transition-colors"
					>
						Generate Prompt
					</button>
				</div>
			)}

			{/* Main textarea */}
			<div className="relative">
				<textarea
					placeholder="Describe your website in detail... (include purpose, audience, style, and pages)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full h-40 rounded-xl px-6 py-4 text-cyan-100 resize-none font-mono text-sm transition-all duration-500"
					style={{
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						border: promptQuality ? `1px solid ${getQualityColor(promptQuality.score)}40` : "1px solid rgba(0, 255, 255, 0.4)",
					}}
					onFocus={(e) => {
						const color = promptQuality ? getQualityColor(promptQuality.score) : "#00ffff";
						e.target.style.borderColor = color;
						e.target.style.boxShadow = `0 0 20px ${color}20`;
					}}
					onBlur={(e) => {
						const color = promptQuality ? getQualityColor(promptQuality.score) : "rgba(0, 255, 255, 0.4)";
						e.target.style.borderColor = color;
						e.target.style.boxShadow = "none";
					}}
				/>
				<div className="absolute bottom-2 right-2 flex items-center space-x-2">
					{isValidating && (
						<div 
							className="w-3 h-3 border border-cyan-400 rounded-full animate-spin"
							style={{ borderTopColor: "transparent" }}
						></div>
					)}
					<div className="text-xs text-cyan-500/60 font-mono">
						{description.length}/1000
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(10px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.line-clamp-3 {
					display: -webkit-box;
					-webkit-line-clamp: 3;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
			`}</style>

			{/* Prompt Guide Modal */}
			<PromptGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
		</div>
	);
}