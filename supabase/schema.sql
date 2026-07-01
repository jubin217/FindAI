-- FindAI Database Schema
-- Run this in your Supabase SQL Editor to set up the database for findai.store!

-- 1. Create Tools Table
CREATE TABLE IF NOT EXISTS public.tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    category TEXT NOT NULL,
    use_cases TEXT[] DEFAULT '{}',
    pricing_type TEXT NOT NULL,
    price_range TEXT,
    features TEXT[] DEFAULT '{}',
    platforms TEXT[] DEFAULT '{}',
    website_url TEXT NOT NULL,
    logo_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    github_repo TEXT,
    trending_score NUMERIC DEFAULT 0.0
);

-- 1.5. Create Processed Sources Table (for tracking crawled releases & blogs)
CREATE TABLE IF NOT EXISTS public.processed_sources (
    id TEXT PRIMARY KEY,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    tool_id TEXT REFERENCES public.tools(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_sources ENABLE ROW LEVEL SECURITY;

-- Allow public read of processed sources
CREATE POLICY "Allow public read of processed_sources" ON public.processed_sources FOR SELECT USING (true);
-- Allow admin to manage processed sources
CREATE POLICY "Allow admin to manage processed_sources" ON public.processed_sources FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN ('admin@findai.store', 'jubin@example.com')) WITH CHECK (true);

-- 4. Set up Policies for 'tools' table
-- Allow anyone to read approved tools
CREATE POLICY "Allow public read of approved tools" ON public.tools
    FOR SELECT USING (approved = true OR auth.uid() = user_id);

-- Allow authenticated developers to submit new tools (approved is false by default)
CREATE POLICY "Allow authenticated user submissions of tools" ON public.tools
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND approved = false);

-- Allow authenticated owners to update their own tools
CREATE POLICY "Allow owners to update their own tools" ON public.tools
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow admin to read all tools (approved or unapproved)
CREATE POLICY "Allow admin to read all tools" ON public.tools
    FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' IN ('admin@findai.store', 'jubin@example.com'));

-- Allow admin to update all tools (for approval/revocation)
CREATE POLICY "Allow admin to update all tools" ON public.tools
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' IN ('admin@findai.store', 'jubin@example.com')) WITH CHECK (true);

-- Allow admin to delete tools (rejection)
CREATE POLICY "Allow admin to delete tools" ON public.tools
    FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' IN ('admin@findai.store', 'jubin@example.com'));

-- Allow owners to delete their own tools
CREATE POLICY "Allow owners to delete their own tools" ON public.tools
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Set up Policies for 'reviews' table
-- Allow anyone to read all reviews
CREATE POLICY "Allow public read of reviews" ON public.reviews
    FOR SELECT USING (true);

-- Allow authenticated users to write reviews
CREATE POLICY "Allow authenticated users to write reviews" ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow admin to delete reviews
CREATE POLICY "Allow admin to delete reviews" ON public.reviews
    FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' IN ('admin@findai.store', 'jubin@example.com'));

-- 6. RPC function to increment clicks securely (bypasses RLS update policy for general public)
CREATE OR REPLACE FUNCTION public.increment_tool_clicks(tool_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.tools
    SET clicks = COALESCE(clicks, 0) + 1
    WHERE id = tool_id;
END;
$$;

-- 6. Insert initial seed tools
-- Run this script to pre-populate the database with the main tools.
-- The app will also dynamically upload missing seed tools if needed.

INSERT INTO public.tools (id, name, tagline, description, category, use_cases, pricing_type, price_range, features, platforms, website_url, rating, review_count, clicks, approved) VALUES
('github-copilot', 'GitHub Copilot', 'Your AI pair programmer.', 'GitHub Copilot uses the OpenAI Codex to suggest code and entire functions in real-time, right from your editor. It learns from public code repositories and adapts to your personal coding style, making developers up to 55% faster.', 'Coding', ARRAY['Code Completion', 'Refactoring', 'Unit Test Generation', 'Documentation writing'], 'Paid', '$10/month or $100/year', ARRAY['Context-aware completions', 'Multi-language support', 'Chat interface in IDE', 'CLI command generation', 'Security vulnerability filtering'], ARRAY['VS Code', 'JetBrains', 'Neovim', 'Visual Studio', 'Web'], 'https://github.com/features/copilot', 4.7, 3, 1240, true),
('cursor', 'Cursor', 'The AI-first code editor.', 'An open-source fork of VS Code custom-built for pair programming with AI. Features full codebase indexing, multi-file edits, auto-debugging, and direct prompt-to-code generation that understands your entire repository context.', 'Coding', ARRAY['Whole-repo search', 'Auto-debugging', 'Multi-file refactoring', 'Natural language edits'], 'Freemium', 'Free tier available, Pro at $20/month', ARRAY['Full codebase indexing', 'Edit blocks in-place', 'Chat with codebase', 'Fast model toggling (GPT-4o, Claude 3.5 Sonnet)', 'Custom system prompts'], ARRAY['macOS', 'Windows', 'Linux'], 'https://cursor.sh', 4.9, 2, 1580, true),
('v0-dev', 'v0 by Vercel', 'Generate production-ready UI components.', 'v0 is a generative UI system by Vercel that produces clean, modern React, Tailwind CSS, and HTML code based on simple text descriptions. It allows UI designers and front-end developers to prototype interfaces instantly.', 'Coding', ARRAY['UI Prototyping', 'Component generation', 'Tailwind styling', 'React code generation'], 'Freemium', 'Free tier available, Premium at $20/month', ARRAY['React & HTML output', 'Tailwind styling integration', 'Shadcn UI support', 'Interactive UI preview', 'Iterative version editing'], ARRAY['Web'], 'https://v0.dev', 4.8, 2, 980, true),
('bolt-new', 'Bolt.new', 'Prompt, run, edit, and deploy fullstack apps.', 'Bolt.new is an in-browser development environment powered by WebContainers. It allows users to prompt, run, debug, edit, and deploy fullstack web applications directly in the browser, eliminating local environment setup.', 'Coding', ARRAY['Fullstack prototyping', 'Vite & React dev', 'In-browser terminal execution', 'Direct Netlify/Vercel deployment'], 'Freemium', 'Free credits daily, Pro from $15/month', ARRAY['In-browser node environment', 'Package manager integration', 'Live preview server', 'Interactive terminal', 'AI automated bug fixing'], ARRAY['Web'], 'https://bolt.new', 4.9, 1, 1450, true),
('chatgpt', 'ChatGPT', 'The leading AI conversational model.', 'OpenAI''s flagship conversational agent. Excellent for writing essays, brainstorming, editing copy, drafting articles, and translating languages. Supports advanced custom GPTs, image uploads, and advanced data analysis.', 'Writing', ARRAY['Content writing', 'Copy editing', 'Translating', 'Brainstorming'], 'Freemium', 'Free access, Plus at $20/month', ARRAY['Advanced reasoning (GPT-4o)', 'DALL-E 3 image generation', 'Voice conversations', 'Custom GPT marketplace', 'Advanced Data Analysis'], ARRAY['Web', 'iOS', 'Android', 'macOS', 'Windows'], 'https://chatgpt.com', 4.8, 2, 2200, true),
('claude', 'Claude', 'Superb writing style and deep reasoning.', 'Developed by Anthropic, Claude is known for its highly nuanced, natural writing style, extensive context windows, and advanced reasoning capabilities. Claude 3.5 Sonnet sets benchmarks for analytical writing and logical coding tasks.', 'Writing', ARRAY['Long-form article writing', 'Document summarization', 'Creative writing', 'Technical documentation'], 'Freemium', 'Free access, Pro at $20/month', ARRAY['Artifacts panel', 'Project workspaces', '200k token context window', 'Nuanced prose generation', 'Exceptional code explanation'], ARRAY['Web', 'iOS', 'macOS', 'Windows'], 'https://claude.ai', 4.9, 2, 1980, true),
('midjourney', 'Midjourney', 'Most artistic and photorealistic images.', 'Midjourney is a text-to-image generator renowned for its artistic details, cinematic framing, and photorealism. Operated primarily through a Discord server and now via a dedicated web editor, it generates jaw-dropping visuals.', 'Image Generation', ARRAY['Concept art', 'Cinematic graphics', 'Mockups & illustrations', 'UI design concepts'], 'Paid', 'Plans start at $10/month', ARRAY['Vary region (inpainting)', 'Zoom & pan expansion', 'Style reference tuning', 'Ultra-high resolution options', 'Web editor interface'], ARRAY['Discord', 'Web'], 'https://midjourney.com', 4.9, 2, 1850, true),
('runway', 'Runway Gen-2', 'Text/Image-to-video creative suite.', 'Runway Gen-2 is a generative AI system that creates cinematic video clips from text prompts, images, or existing videos. It is widely used by filmmakers, artists, and creators to generate B-roll, visual effects, and animations.', 'Video Editing', ARRAY['AI B-roll generation', 'Text to video clips', 'Image animation', 'Green screen replacement'], 'Freemium', 'Free trial credits, Standard from $15/month', ARRAY['Motion brush precision', 'Camera control sliders', 'Up-scaling output', 'Frame rate expansion', 'Audio track generation'], ARRAY['Web', 'iOS'], 'https://runwayml.com', 4.6, 1, 940, true),
('otter-ai', 'Otter.ai', 'Smart real-time transcriptions and meeting summaries.', 'Otter.ai connects to Zoom, Teams, and Google Meet to transcribe discussions, extract key action points, capture slide photos, and draft organized meeting notes for the entire team automatically.', 'Productivity', ARRAY['Meeting transcription', 'Real-time notes share', 'Action item tracking', 'Calendar scheduling integrations'], 'Freemium', 'Free basic plan, Pro starts at $10/month', ARRAY['Live speaker identification', 'OtterPilot auto-join', 'Searchable transcripts', 'Interactive chat panel', 'Automated email summaries'], ARRAY['Web', 'iOS', 'Android', 'Chrome Extension'], 'https://otter.ai', 4.5, 1, 810, true),
('julius-ai', 'Julius AI', 'Your personal AI data scientist.', 'Julius AI is a dynamic data analysis tool that helps users clean, analyze, and visualize structured data (CSVs, Excel sheets) using plain text commands. Writes and runs Python code under the hood to output clean charts and statistical summaries.', 'Data Analytics', ARRAY['CSV data cleanup', 'Automated regression analysis', 'Custom chart creation', 'SQL query generation'], 'Freemium', '15 queries free monthly, Basic starting at $18/mo', ARRAY['Python sandbox run', 'Matplotlib chart generation', 'Multi-sheet linking', 'Statistical tests output', 'Custom dataset export'], ARRAY['Web', 'iOS', 'Android'], 'https://julius.ai', 4.9, 2, 1150, true),
('gemini', 'Gemini', 'Google''s official multimodal AI assistant.', 'Google Gemini is a highly advanced conversational agent developed by Google. Built from the ground up to be multimodal, it seamlessly processes text, code, images, audio, and video context. It integrates directly with your Google Workspace (Docs, Gmail, Sheets) to search, synthesize, and compose documents in real time.', 'Writing', ARRAY['Multimodal reasoning', 'Workspace integration', 'Code completion', 'Analytical research'], 'Freemium', 'Free basic access, Gemini Advanced at $20/month', ARRAY['Workspace docs integration', 'Image & audio inputs', 'Ultrafast response speeds', 'Google Search grounding', 'Complex coding assistance'], ARRAY['Web', 'Android', 'iOS'], 'https://gemini.google.com', 4.7, 2, 1950, true),
('meta-ai', 'Meta AI', 'AI assistant across Meta social apps and web.', 'Meta AI is a virtual assistant built on open-source Llama models. It integrates directly into WhatsApp, Instagram, Messenger, and Facebook to answer questions, generate images on-the-fly, translate chats, and summarize social threads instantly.', 'Writing', ARRAY['Social media chat help', 'Instant image generation', 'Chatbot conversations', 'General search requests'], 'Free', '100% Free', ARRAY['Meta social integrations', 'Llama 3 speeds', 'Imagine prompt-to-image engine', 'Real-time search citations'], ARRAY['Web', 'WhatsApp', 'Instagram', 'Messenger'], 'https://meta.ai', 4.6, 1, 1480, true),
('grok', 'Grok by xAI', 'Witty AI assistant with real-time news search.', 'Grok is xAI''s conversational search assistant integrated directly into X (Twitter). Grok stands out by having active access to real-time posts, news flashes, and trending topics worldwide, answering queries with wit and humor.', 'Writing', ARRAY['Real-time news search', 'Witty text drafts', 'Trending topic analysis', 'Multimodal uploads'], 'Paid', 'Included with X Premium ($8-$16/month)', ARRAY['Real-time posts lookup', 'Fun & Normal mode toggles', 'Llama/xAI logic models', 'Code drafting'], ARRAY['Web', 'iOS', 'Android'], 'https://x.com/i/grok', 4.5, 1, 1120, true),
('elevenlabs', 'ElevenLabs', 'Hyper-realistic AI voice generator and dubber.', 'ElevenLabs creates lifelike voiceovers, high-context text-to-speech, sound effects, and professional voice clones. Supporting dozens of languages and custom accents, it is the industry leader for audiobooks, video voice tracks, and game character dubbing.', 'Video Editing', ARRAY['Narrating scripts', 'Voice cloning', 'Multi-language dubbing', 'Audiobook production'], 'Freemium', '10,000 characters free monthly, tiers from $5/mo', ARRAY['High-fidelity speech synthesis', 'Emotional inflection slides', 'Instant voice cloning', 'Sound effects generation', 'Video localization dubs'], ARRAY['Web', 'API'], 'https://elevenlabs.io', 4.9, 2, 1880, true),
('suno', 'Suno AI', 'Generate complete songs and instrumentation in seconds.', 'Suno AI is a generative music platform that creates complete, studio-quality tracks—incorporating vocals, instrumentation, and lyrics—from simple textual descriptions. It enables video editors and hobbyists to create custom soundtracks in any genre.', 'Video Editing', ARRAY['Video soundtracks', 'Custom jingle generation', 'Song writing prototypes', 'Creative melody brainstorming'], 'Freemium', '50 daily credits free, Pro starts at $8/month', ARRAY['Vocals & instrument synthesis', 'Instrumental track selector', 'Custom lyrics editor', 'Genre model fine tuning', 'High-res audio exports'], ARRAY['Web', 'iOS', 'Discord'], 'https://suno.com', 4.8, 2, 1720, true),
('microsoft-copilot', 'Microsoft Copilot', 'Your everyday AI companion for Office and Windows.', 'Microsoft Copilot is an intelligent assistant integrated into Windows, Office 365, Edge, and Bing. It summarizes emails, generates PowerPoint outlines, drafts Word documents, and automates analysis in Excel sheets.', 'Productivity', ARRAY['Corporate document writing', 'Slides preparation helper', 'Excel sheet automation', 'Meeting summaries transcription'], 'Freemium', 'Free on Web & Windows, Pro at $20/month', ARRAY['Office App integrations', 'PowerPoint slides auto-builder', 'Bing Search live sources', 'GPT-4o text replies', 'Windows settings execution'], ARRAY['Windows', 'macOS', 'Web', 'iOS', 'Android'], 'https://copilot.microsoft.com', 4.6, 2, 1650, true),
('perplexity', 'Perplexity AI', 'AI search engine with live sources and citations.', 'Perplexity AI is a conversational search engine that delivers real-time cited responses to complex questions. Combining models like Claude and GPT with a web crawler, it serves as an alternative to standard search engines.', 'Productivity', ARRAY['Academic literature reviews', 'Fact-checking queries', 'Business intelligence search', 'Tech documentation research'], 'Freemium', 'Free searches, Pro with advanced models at $20/mo', ARRAY['Active citations linking', 'Reddit/YouTube focus filters', 'PDF document analysis uploads', 'Model picker (Claude/GPT/Llama)', 'Shared search folders'], ARRAY['Web', 'iOS', 'Android', 'Chrome Extension'], 'https://perplexity.ai', 4.9, 3, 2100, true);

INSERT INTO public.reviews (id, tool_id, author, rating, comment) VALUES
('r1', 'github-copilot', 'Alex Rivera', 5, 'Saves me hours of boilerplate writing. The chat feature in VS Code is phenomenal.'),
('r2', 'github-copilot', 'Sarah Chen', 4, 'Incredibly good for common languages like JavaScript and Python, but can struggle with niche frameworks.'),
('r3', 'github-copilot', 'Marcus Aureli', 5, 'Essential for my workflow. Highly recommended.'),
('r4', 'cursor', 'Dave Miller', 5, 'Switched from VS Code and never looked back. The codebase context indexing is lightyears ahead.'),
('r5', 'cursor', 'Yuki Sato', 5, 'Composer mode lets me edit multiple files simultaneously. Absolute game changer.'),
('r6', 'v0-dev', 'Emily Watson', 5, 'Prototypes that took a day now take 5 minutes. The code quality is exceptionally clean.'),
('r7', 'v0-dev', 'Arjun Mehta', 4, 'Excellent for landing pages and dashboard UI. Requires minor logic hooks later.'),
('r8', 'bolt-new', 'Carlos Santano', 5, 'Running Node and installing npm packages directly inside a sandboxed web page is magic.'),
('r9', 'chatgpt', 'Jane Foster', 5, 'The writing assistant I can no longer live without. Indispensable for editing drafts.'),
('r10', 'chatgpt', 'Liam Nees', 4, 'Excellent general intelligence. Sometimes needs custom guidelines to avoid sounding repetitive.'),
('r11', 'claude', 'Sophia K.', 5, 'Claude writes much more like a human than any other LLM. The Artifacts panel is brilliant.'),
('r12', 'claude', 'Ravi Nair', 5, 'The analytical reasoning capabilities on complex documents are unmatched.'),
('r14', 'midjourney', 'Leo DaVinci', 5, 'Unrivaled aesthetic quality. The new web interface is much better than Discord.'),
('r15', 'midjourney', 'Anna Lee', 5, 'The lighting and texture details are unbelievable. Indispensable for designers.'),
('r17', 'runway', 'Director Cut', 4, 'Fascinating tool for concept styling and quick animatics. Motion brush works great.'),
('r22', 'otter-ai', 'Clara PM', 4, 'Transcripts are 90% accurate and the action items are helpful. OtterPilot is very convenient.'),
('r25', 'julius-ai', 'Analyst Bob', 5, 'Imported a messy client CSV, asked Julius to clean it, check outliers, and plot a regression. Done in 30 seconds.'),
('rg1', 'gemini', 'Marcus T.', 5, 'Multimodal search works incredibly well. It reads visual data much better than competitors.'),
('rg2', 'gemini', 'Elena R.', 4, 'Workspace integration makes writing replies in Gmail a breeze.'),
('rm1', 'meta-ai', 'Julia H.', 5, 'Super convenient to generate stickers and search recommendations right inside group chats.'),
('rx1', 'grok', 'Tech Enthusiast', 5, 'Its access to breaking news beats all other chatbots. Fun mode is highly entertaining.'),
('rel1', 'elevenlabs', 'Voice Creator', 5, 'The inflections, pauses, and breaths make it indistinguishable from human voiceovers.'),
('rel2', 'elevenlabs', 'Podcast Host', 5, 'Voice cloning is top tier. Cloned my voice in 1 minute and reads scripts perfectly.'),
('rsu1', 'suno', 'Beatmaker', 5, 'The fidelity of the B-roll music tracks is mind blowing. Highly useful for editing TikTok and YouTube shorts.'),
('rmc1', 'microsoft-copilot', 'Jack Office', 5, 'Outstanding for drafts. Summarizing meeting chats inside Teams saves hours.'),
('rp1', 'perplexity', 'Researcher Dan', 5, 'Absolutely phenomenal. Replaces Google for search because it reads, cross-references, and gives actual answers.');
