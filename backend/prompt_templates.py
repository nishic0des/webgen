def generate_enhanced_prompt(user_description: str, prompt_type: str = "generate") -> str:
    """Generate enhanced prompts with comprehensive design guidance"""
    
    base_context = """You are an expert web developer and UI/UX designer specializing in modern, accessible websites.

DESIGN PRINCIPLES:
- Follow current web design trends (clean, minimalist, effective whitespace)
- Implement mobile-first responsive design using CSS Grid and Flexbox
- Use semantic HTML5 elements (header, nav, main, section, article, footer)
- Ensure WCAG 2.1 AA accessibility compliance (proper headings, alt text, contrast)
- Create clear visual hierarchy with typography scale and consistent spacing
- Use professional color schemes with 3-4 colors maximum
- Implement smooth transitions and micro-interactions

TECHNICAL REQUIREMENTS:
- Generate semantic, valid HTML5 with proper document structure
- Create responsive CSS with mobile-first approach
- Use modern CSS features (CSS Grid, Flexbox, custom properties, clamp())
- Ensure cross-browser compatibility
- Include proper meta tags for SEO
- Implement consistent 8px spacing scale
- Use web-safe fonts with appropriate fallbacks

RESPONSIVE DESIGN:
- Mobile: 320px-768px (stack elements, single column)
- Tablet: 768px-1024px (adjust layouts, some multi-column)
- Desktop: 1024px+ (full layouts, multi-column where appropriate)

COLOR & TYPOGRAPHY:
- Ensure minimum 4.5:1 contrast ratio for text
- Use maximum 2-3 font families
- Implement consistent spacing scale
- Choose colors that work well together and convey the right mood"""

    if prompt_type == "generate":
        return f"""{base_context}

USER REQUEST: {user_description}

TASK: Create a complete, professional website following these steps:
1. Analyze the request and determine the most appropriate pages
2. Select a cohesive design style that matches the purpose
3. Choose an appropriate color palette and typography
4. Generate semantic HTML with proper structure and accessibility
5. Create responsive CSS that works on all devices
6. Ensure consistent branding and user experience across all pages

CONTENT STRUCTURE:
- Each page should have clear navigation
- Include proper headings hierarchy (h1, h2, h3)
- Add placeholder content that's relevant and professional
- Ensure all interactive elements are accessible

Return ONLY valid JSON with this exact structure:
{{
    "pages": [
        {{
            "name": "Page Name",
            "html": "Complete semantic HTML5 content",
            "css": "Responsive CSS with modern techniques"
        }}
    ],
    "global_css": "Global styles, CSS reset, typography system, and design tokens"
}}"""

    else:  # edit mode
        return f"""{base_context}

CURRENT CONTENT TO MODIFY:
{user_description}

TASK: Apply the requested changes while maintaining:
- Design consistency and visual hierarchy
- Responsive behavior across all devices
- Accessibility standards and semantic markup
- Code quality and modern CSS practices
- Brand consistency

Return ONLY valid JSON with updated "html" and "css" fields."""


def validate_and_enhance_prompt(description: str) -> tuple[bool, str, str]:
    """Validate user prompt and provide enhancement suggestions"""
    
    issues = []
    suggestions = []
    
    # Check prompt length
    description = description.strip()
    if len(description) < 20:
        issues.append("Prompt too short")
        suggestions.append("Add more details about your website's purpose, target audience, and desired pages")
    
    # Check for key elements
    key_elements = {
        'purpose': ['business', 'portfolio', 'blog', 'ecommerce', 'landing', 'corporate', 'personal', 'agency', 'restaurant', 'clinic'],
        'audience': ['customers', 'users', 'visitors', 'clients', 'students', 'patients', 'professionals'],
        'style': ['modern', 'minimalist', 'professional', 'creative', 'elegant', 'bold', 'clean', 'sophisticated'],
        'content': ['about', 'services', 'products', 'contact', 'gallery', 'blog', 'testimonials', 'pricing'],
        'industry': ['tech', 'healthcare', 'finance', 'education', 'retail', 'consulting', 'creative', 'nonprofit']
    }
    
    missing_elements = []
    for category, keywords in key_elements.items():
        if not any(keyword in description.lower() for keyword in keywords):
            missing_elements.append(category)
    
    # Generate suggestions based on missing elements
    if 'purpose' in missing_elements:
        suggestions.append("Specify the website type (business, portfolio, blog, e-commerce, etc.)")
    if 'audience' in missing_elements:
        suggestions.append("Describe your target audience or customers")
    if 'style' in missing_elements:
        suggestions.append("Mention preferred design style (modern, professional, creative, etc.)")
    if 'content' in missing_elements:
        suggestions.append("List the pages/sections you need (about, services, contact, etc.)")
    
    # Enhanced prompt with AI guidance for missing elements
    enhanced_prompt = description
    if missing_elements:
        enhancements = []
        if 'purpose' in missing_elements:
            enhancements.append("Please infer the most appropriate website type based on the description")
        if 'audience' in missing_elements:
            enhancements.append("Assume a professional target audience unless otherwise specified")
        if 'style' in missing_elements:
            enhancements.append("Use a modern, clean design style")
        if 'content' in missing_elements:
            enhancements.append("Include standard pages appropriate for this type of website")
        
        enhanced_prompt += f"\n\nAdditional AI guidance: {'. '.join(enhancements)}."
    
    is_valid = len(issues) == 0
    suggestion_text = '; '.join(suggestions) if suggestions else "Prompt looks good!"
    
    return is_valid, suggestion_text, enhanced_prompt


def score_prompt_quality(description: str) -> dict:
    """Score prompt quality and provide detailed feedback"""
    
    score = 0
    feedback = []
    strengths = []
    
    # Length check (optimal range: 50-400 characters)
    length = len(description.strip())
    if 50 <= length <= 400:
        score += 25
        strengths.append("Good prompt length")
    elif length < 50:
        score += 10
        feedback.append("Add more details about purpose, audience, and required pages")
    else:
        score += 15
        feedback.append("Consider being more concise while keeping key details")
    
    # Purpose clarity
    purposes = ['business', 'portfolio', 'blog', 'store', 'ecommerce', 'landing', 'corporate', 'personal', 'agency']
    purpose_found = any(purpose in description.lower() for purpose in purposes)
    if purpose_found:
        score += 20
        strengths.append("Clear website purpose")
    else:
        feedback.append("Specify the website type (business, portfolio, blog, etc.)")
    
    # Target audience mentioned
    audience_terms = ['for', 'customers', 'users', 'clients', 'visitors', 'audience', 'targeting']
    audience_found = any(term in description.lower() for term in audience_terms)
    if audience_found:
        score += 15
        strengths.append("Target audience mentioned")
    else:
        feedback.append("Describe who will use the website")
    
    # Design style preferences
    style_terms = ['modern', 'minimalist', 'professional', 'creative', 'elegant', 'clean', 'style', 'design']
    style_found = any(term in description.lower() for term in style_terms)
    if style_found:
        score += 15
        strengths.append("Design preferences specified")
    else:
        feedback.append("Mention preferred design style")
    
    # Specific pages/content mentioned
    content_terms = ['pages', 'about', 'services', 'contact', 'gallery', 'blog', 'products', 'home']
    content_found = sum(1 for term in content_terms if term in description.lower())
    if content_found >= 3:
        score += 15
        strengths.append("Specific pages/content mentioned")
    elif content_found >= 1:
        score += 10
        feedback.append("Specify more pages or sections you need")
    else:
        feedback.append("List the pages/sections you want")
    
    # Industry context
    industry_terms = ['restaurant', 'clinic', 'law', 'tech', 'startup', 'agency', 'consulting', 'retail', 'education']
    industry_found = any(term in description.lower() for term in industry_terms)
    if industry_found:
        score += 10
        strengths.append("Industry context provided")
    
    # Determine grade
    if score >= 85:
        grade = 'A'
        grade_text = 'Excellent'
    elif score >= 70:
        grade = 'B'
        grade_text = 'Good'
    elif score >= 55:
        grade = 'C'
        grade_text = 'Needs Improvement'
    else:
        grade = 'D'
        grade_text = 'Poor'
    
    return {
        'score': score,
        'grade': grade,
        'grade_text': grade_text,
        'strengths': strengths,
        'feedback': feedback,
        'recommendations': [
            "Be specific about your business/purpose",
            "Mention your target audience",
            "Describe preferred design style",
            "List required pages/sections",
            "Include any special features needed"
        ]
    }


def get_example_prompts():
    """Return example prompts for different website types"""
    
    return {
        "portfolio": {
            "title": "Creative Portfolio",
            "prompt": "Create a modern portfolio website for a UX designer showcasing creative projects. Target audience: potential clients and employers. Include pages: Home with hero section and featured work, About with personal story and skills, Portfolio with project case studies and galleries, Services with design process and pricing, and Contact with form. Use a clean, minimalist design with excellent typography, smooth animations, and a professional color scheme.",
            "quality_score": 95
        },
        "business": {
            "title": "Digital Agency",
            "prompt": "Build a professional website for a digital marketing agency targeting small businesses. Include Homepage with services overview and client testimonials, About Us with team profiles and company story, Services with detailed offerings (SEO, PPC, social media), Case Studies with client success stories, Blog for industry insights, and Contact with multiple office locations. Use a modern, trustworthy design with blue and white color scheme, professional imagery, and clear call-to-action buttons.",
            "quality_score": 92
        },
        "ecommerce": {
            "title": "Sustainable Fashion",
            "prompt": "Design an e-commerce website for sustainable fashion clothing targeting environmentally conscious consumers aged 25-40. Include Homepage with featured products and brand story, Shop with category filters and product grids, individual Product pages with detailed views and reviews, About with sustainability mission and certifications, Size Guide, and Contact with customer service. Use earthy tones, clean product photography layouts, mobile-first responsive design, and emphasize eco-friendly messaging throughout.",
            "quality_score": 88
        },
        "restaurant": {
            "title": "Fine Dining Restaurant",
            "prompt": "Create an elegant website for an upscale Italian restaurant targeting food enthusiasts and special occasion diners. Include Homepage with atmosphere photos and chef's welcome, Menu with seasonal offerings and wine pairings, About with restaurant history and chef biography, Gallery with food and interior photos, Reservations with booking system, Events for private dining, and Contact with location and hours. Use sophisticated design with warm colors, beautiful food photography, and elegant typography that reflects the fine dining experience.",
            "quality_score": 90
        },
        "clinic": {
            "title": "Medical Practice",
            "prompt": "Build a professional website for a family medical practice targeting patients and families in the local community. Include Homepage with doctor introductions and services overview, About with practice philosophy and team credentials, Services with detailed medical offerings, Patient Portal information, Insurance and billing information, and Contact with appointment booking and location. Use a clean, trustworthy design with blue and white colors, professional photos, easy navigation, and emphasis on patient care and comfort.",
            "quality_score": 87
        }
    }