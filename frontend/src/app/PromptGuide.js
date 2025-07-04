"use client";

export default function PromptGuide({ isOpen, onClose }) {
	if (!isOpen) return null;

	const goodPrompts = [
		{
			prompt: "Create a modern portfolio website for a UX designer targeting potential clients. Include Home with hero section, About with skills, Portfolio with case studies, and Contact. Use clean, minimalist design with professional typography.",
			reason: "Specific purpose, clear audience, detailed pages, design style mentioned"
		},
		{
			prompt: "Build a professional restaurant website for an Italian bistro targeting food lovers. Include Menu with photos, About with chef story, Reservations, Gallery, and Contact. Use warm colors, elegant typography, and food photography.",
			reason: "Business type, target audience, specific pages, visual style described"
		}
	];

	const badPrompts = [
		{
			prompt: "Make me a website",
			reason: "Too vague - no purpose, audience, or requirements specified"
		},
		{
			prompt: "I need a business website with some pages",
			reason: "Lacks specifics about business type, target audience, or which pages"
		}
	];

	return (
		<div 
			className="fixed inset-0 flex items-center justify-center z-50"
			style={{
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				backdropFilter: "blur(5px)",
			}}
			onClick={onClose}
		>
			<div 
				className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="relative rounded-2xl p-8 border shadow-2xl"
					style={{
						backgroundColor: "rgba(17, 24, 39, 0.95)",
						borderColor: "rgba(0, 255, 255, 0.4)",
						backdropFilter: "blur(10px)",
					}}
				>
					<div className="flex items-center justify-between mb-8">
						<h2
							className="text-3xl font-thin text-cyan-300"
							style={{ letterSpacing: "0.1em" }}
						>
							PROMPT WRITING GUIDE
						</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-red-400 transition-colors duration-300 text-3xl transform hover:scale-110"
						>
							×
						</button>
					</div>

					<div className="space-y-8">
						{/* Key Elements */}
						<div>
							<h3 className="text-xl text-purple-300 mb-4 font-light">Essential Elements</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
									<h4 className="text-green-400 font-semibold mb-2">✓ Website Purpose</h4>
									<p className="text-gray-300 text-sm">Business, portfolio, blog, e-commerce, landing page, etc.</p>
								</div>
								<div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
									<h4 className="text-blue-400 font-semibold mb-2">✓ Target Audience</h4>
									<p className="text-gray-300 text-sm">Who will use the website? Customers, clients, visitors, etc.</p>
								</div>
								<div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
									<h4 className="text-yellow-400 font-semibold mb-2">✓ Design Style</h4>
									<p className="text-gray-300 text-sm">Modern, professional, creative, minimalist, elegant, etc.</p>
								</div>
								<div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
									<h4 className="text-cyan-400 font-semibold mb-2">✓ Required Pages</h4>
									<p className="text-gray-300 text-sm">Home, About, Services, Contact, Gallery, Blog, etc.</p>
								</div>
							</div>
						</div>

						{/* Good Examples */}
						<div>
							<h3 className="text-xl text-green-300 mb-4 font-light">✓ Good Prompt Examples</h3>
							<div className="space-y-4">
								{goodPrompts.map((example, index) => (
									<div key={index} className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
										<p className="text-green-100 mb-2 italic">"{example.prompt}"</p>
										<p className="text-green-400 text-sm">Why it works: {example.reason}</p>
									</div>
								))}
							</div>
						</div>

						{/* Bad Examples */}
						<div>
							<h3 className="text-xl text-red-300 mb-4 font-light">✗ Poor Prompt Examples</h3>
							<div className="space-y-4">
								{badPrompts.map((example, index) => (
									<div key={index} className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
										<p className="text-red-100 mb-2 italic">"{example.prompt}"</p>
										<p className="text-red-400 text-sm">Problem: {example.reason}</p>
									</div>
								))}
							</div>
						</div>

						{/* Tips */}
						<div>
							<h3 className="text-xl text-cyan-300 mb-4 font-light">Pro Tips</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-3">
									<div className="flex items-start space-x-3">
										<span className="text-cyan-400 text-lg">💡</span>
										<span className="text-gray-300 text-sm">Be specific about your industry (restaurant, clinic, tech startup)</span>
									</div>
									<div className="flex items-start space-x-3">
										<span className="text-cyan-400 text-lg">🎨</span>
										<span className="text-gray-300 text-sm">Mention color preferences or brand personality</span>
									</div>
									<div className="flex items-start space-x-3">
										<span className="text-cyan-400 text-lg">📱</span>
										<span className="text-gray-300 text-sm">Specify if you need specific features (contact forms, galleries)</span>
									</div>
								</div>
								<div className="space-y-3">
									<div className="flex items-start space-x-3">
										<span className="text-cyan-400 text-lg">👥</span>
										<span className="text-gray-300 text-sm">Describe your target audience's needs and expectations</span>
									</div>
									<div className="flex items-start space-x-3">
										<span className="text-cyan-400 text-lg">📏</span>
										<span className="text-gray-300 text-sm">Aim for 50-400 characters for optimal results</span>
									</div>
									<div className="flex items-start space-x-3">
										<span className="text-cyan-400 text-lg">🔄</span>
										<span className="text-gray-300 text-sm">Use the prompt builder for guidance</span>
									</div>
								</div>
							</div>
						</div>

						{/* Template */}
						<div className="p-6 rounded-lg border border-purple-500/20 bg-purple-500/5">
							<h3 className="text-xl text-purple-300 mb-4 font-light">Prompt Template</h3>
							<div className="font-mono text-sm text-purple-100 bg-black/50 p-4 rounded-lg">
								Create a [PURPOSE] website for [BUSINESS/PERSON] targeting [AUDIENCE]. 
								Include pages: [PAGE1], [PAGE2], [PAGE3], and [PAGE4]. 
								Use a [STYLE] design with [COLORS/MOOD]. 
								[SPECIAL FEATURES OR REQUIREMENTS].
							</div>
						</div>

						<div className="text-center">
							<button
								onClick={onClose}
								className="px-8 py-3 rounded-lg font-light uppercase transition-all duration-500 transform hover:scale-105"
								style={{
									background: "linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(128, 0, 255, 0.2))",
									border: "1px solid rgba(0, 255, 255, 0.5)",
									color: "#00ffff",
									letterSpacing: "0.1em",
								}}
							>
								Got It
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}