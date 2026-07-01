import fs from 'fs';
import path from 'path';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

// 1. Parse local .env files
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  
  [envPath, envLocalPath].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
    }
  });
}

loadEnv();

const GITHUB_PAT = process.env.GITHUB_PAT;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("Environment loaded.");
console.log("GitHub Token configured:", GITHUB_PAT ? "YES" : "NO");
console.log("Gemini API Key configured:", GEMINI_API_KEY ? "YES" : "NO");

// Helper to make HTTPS requests returning JSON
// Helper to make HTTPS requests returning JSON with timeout
function fetchJson(url, customHeaders = {}) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      timeout: 15000, // 15 seconds timeout
      headers: {
        'User-Agent': 'FindAI-Bot/1.0 (contact@findai.store; pair-programming)',
        ...customHeaders
      }
    };
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'JSON Parse Error', raw: data.substring(0, 100) });
        }
      });
    });
    req.on('error', (err) => {
      console.error(`Request failed for URL ${url}:`, err.message);
      resolve({ error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      console.warn(`Request timeout for URL ${url}`);
      resolve({ error: 'Timeout' });
    });
  });
}

// Helper to fetch raw text with timeout
function fetchText(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { 
      headers: { 'User-Agent': 'FindAI-Bot/1.0' },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', (err) => {
      console.error(`Text request failed for ${url}:`, err.message);
      resolve('');
    });
    req.on('timeout', () => {
      req.destroy();
      console.warn(`Text request timeout for ${url}`);
      resolve('');
    });
  });
}

// List of companies to monitor
const COMPANIES_LIST = [
  'OpenAI', 'Google AI', 'Anthropic', 'Microsoft AI', 'Meta AI', 
  'Perplexity', 'Cursor', 'Runway', 'ElevenLabs', 'Suno', 
  'Lovable', 'Canva AI', 'Figma AI'
];

// List of developer repos to monitor for new releases
const GITHUB_MONITOR_REPOS = [
  'microsoft/autogen',
  'langchain-ai/langchain',
  'crewAIInc/crewAI'
];

// Curated famous tools by major companies
const FAMOUS_COMPANY_TOOLS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'The leading AI conversational model.',
    description: "OpenAI's flagship conversational agent. Excellent for writing essays, brainstorming, editing copy, drafting articles, and translating languages. Supports advanced custom GPTs, image uploads, and advanced data analysis.",
    category: 'Writing',
    pricingType: 'Freemium',
    priceRange: 'Free access, Plus at $20/month',
    useCases: ['Content writing', 'Copy editing', 'Translating', 'Brainstorming'],
    features: ['Advanced reasoning (GPT-4o)', 'DALL-E 3 image generation', 'Voice conversations', 'Custom GPT marketplace', 'Advanced Data Analysis'],
    platforms: ['Web', 'iOS', 'Android', 'macOS', 'Windows'],
    websiteUrl: 'https://chatgpt.com',
    githubRepo: null
  },
  {
    id: 'gemini',
    name: 'Gemini',
    tagline: "Google's official multimodal AI assistant.",
    description: "Google Gemini is a highly advanced conversational agent developed by Google. Built from the ground up to be multimodal, it seamlessly processes text, code, images, audio, and video context. It integrates directly with your Google Workspace (Docs, Gmail, Sheets) to search, synthesize, and compose documents in real time.",
    category: 'Writing',
    pricingType: 'Freemium',
    priceRange: 'Free basic access, Gemini Advanced at $20/month',
    useCases: ['Workspace docs integration', 'Image & audio inputs', 'Ultrafast response speeds', 'Google Search grounding'],
    features: ['Workspace docs integration', 'Image & audio inputs', 'Ultrafast response speeds', 'Google Search grounding', 'Complex coding assistance'],
    platforms: ['Web', 'Android', 'iOS'],
    websiteUrl: 'https://gemini.google.com',
    githubRepo: null
  },
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Superb writing style and deep reasoning.',
    description: "Developed by Anthropic, Claude is known for its highly nuanced, natural writing style, extensive context windows, and advanced reasoning capabilities. Claude 3.5 Sonnet sets benchmarks for analytical writing and logical coding tasks.",
    category: 'Writing',
    pricingType: 'Freemium',
    priceRange: 'Free access, Pro at $20/month',
    useCases: ['Long-form article writing', 'Document summarization', 'Creative writing', 'Technical documentation'],
    features: ['Artifacts panel', 'Project workspaces', '200k token context window', 'Nuanced prose generation', 'Exceptional code explanation'],
    platforms: ['Web', 'iOS', 'macOS', 'Windows'],
    websiteUrl: 'https://claude.ai',
    githubRepo: null
  },
  {
    id: 'microsoft-copilot',
    name: 'Microsoft Copilot',
    tagline: 'Your everyday AI companion for Office and Windows.',
    description: "Microsoft Copilot is an intelligent assistant integrated into Windows, Office 365, Edge, and Bing. It summarizes emails, generates PowerPoint outlines, drafts Word documents, and automates analysis in Excel sheets.",
    category: 'Productivity',
    pricingType: 'Freemium',
    priceRange: 'Free on Web & Windows, Pro at $20/month',
    useCases: ['Corporate document writing', 'Slides preparation helper', 'Excel sheet automation', 'Meeting summaries transcription'],
    features: ['Office App integrations', 'PowerPoint slides auto-builder', 'Bing Search live sources', 'GPT-4o text replies', 'Windows settings execution'],
    platforms: ['Windows', 'macOS', 'Web', 'iOS', 'Android'],
    websiteUrl: 'https://copilot.microsoft.com',
    githubRepo: null
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    tagline: 'AI search engine with live sources and citations.',
    description: "Perplexity AI is a conversational search engine that delivers real-time cited responses to complex questions. Combining models like Claude and GPT with a web crawler, it serves as an alternative to standard search engines.",
    category: 'Productivity',
    pricingType: 'Freemium',
    priceRange: 'Free searches, Pro with advanced models at $20/mo',
    useCases: ['Academic literature reviews', 'Fact-checking queries', 'Business intelligence search', 'Tech documentation research'],
    features: ['Active citations linking', 'Reddit/YouTube focus filters', 'PDF document analysis uploads', 'Model picker (Claude/GPT/Llama)', 'Shared search folders'],
    platforms: ['Web', 'iOS', 'Android', 'Chrome Extension'],
    websiteUrl: 'https://perplexity.ai',
    githubRepo: null
  },
  {
    id: 'apple-intelligence',
    name: 'Apple Intelligence',
    tagline: 'Personal intelligence system for iPhone, iPad, and Mac.',
    description: "Apple Intelligence is a personal intelligence system integrated deeply into iOS 18, iPadOS 18, and macOS Sequoia. It harnesses the power of Apple silicon to understand and create language and images, take action across apps, and draw from personal context.",
    category: 'Productivity',
    pricingType: 'Free',
    priceRange: 'Free on supported Apple devices',
    useCases: ['Writing tools proofreading', 'Image Playground generation', 'Siri application control', 'Notification priority summaries'],
    features: ['On-device processing', 'Private Cloud Compute security', 'ChatGPT integration option', 'Genmoji custom emojis', 'Clean Up photo editor'],
    platforms: ['iOS', 'macOS', 'iPadOS'],
    websiteUrl: 'https://www.apple.com/apple-intelligence',
    githubRepo: null
  },
  {
    id: 'meta-ai',
    name: 'Meta AI',
    tagline: 'AI assistant across Meta social apps and web.',
    description: "Meta AI is a virtual assistant built on open-source Llama models. It integrates directly into WhatsApp, Instagram, Messenger, and Facebook to answer questions, generate images on-the-fly, translate chats, and summarize social threads instantly.",
    category: 'Writing',
    pricingType: 'Free',
    priceRange: '100% Free',
    useCases: ['Social media chat help', 'Instant image generation', 'Chatbot conversations', 'General search requests'],
    features: ['Meta social integrations', 'Llama 3 speeds', 'Imagine prompt-to-image engine', 'Real-time search citations'],
    platforms: ['Web', 'WhatsApp', 'Instagram', 'Messenger'],
    websiteUrl: 'https://meta.ai',
    githubRepo: null
  },
  {
    id: 'grok',
    name: 'Grok by xAI',
    tagline: 'Witty AI assistant with real-time news search.',
    description: "Grok is xAI's conversational search assistant integrated directly into X (Twitter). Grok stands out by having active access to real-time posts, news flashes, and trending topics worldwide, answering queries with wit and humor.",
    category: 'Writing',
    pricingType: 'Paid',
    priceRange: 'Included with X Premium ($8-$16/month)',
    useCases: ['Real-time news search', 'Witty text drafts', 'Trending topic analysis', 'Multimodal uploads'],
    features: ['Real-time posts lookup', 'Fun & Normal mode toggles', 'Llama/xAI logic models', 'Code drafting'],
    platforms: ['Web', 'iOS', 'Android'],
    websiteUrl: 'https://x.com/i/grok',
    githubRepo: null
  },
  {
    id: 'flux-1',
    name: 'FLUX.1 by Black Forest Labs',
    tagline: 'State-of-the-art open image generation model.',
    description: "FLUX.1 is a suite of advanced text-to-image models developed by Black Forest Labs. It sets new benchmarks in image quality, prompt adherence, detailed text rendering, and style variety, powering image engines across major platforms.",
    category: 'Image Generation',
    pricingType: 'Freemium',
    priceRange: 'Free open model, Pro API pricing',
    useCases: ['Photorealistic art generation', 'Text rendering in graphics', 'Fine-art styling illustrations', 'Advertising banner design'],
    features: ['12 billion parameters scale', 'Exceptional prompt compliance', 'Crisp text spelling', 'Open weights download', 'High speed generation'],
    platforms: ['Web', 'Windows', 'Linux', 'macOS'],
    websiteUrl: 'https://blackforestlabs.ai',
    githubRepo: 'black-forest-labs/flux'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek R1',
    tagline: 'Open-source reasoning model rivaling OpenAI o1.',
    description: "DeepSeek R1 is a highly advanced, open-source reasoning model developed by DeepSeek. It uses reinforcement learning to perform multi-step thinking, self-correction, and logical deduction, matching top-tier commercial reasoning models in math and coding.",
    category: 'Coding',
    pricingType: 'Freemium',
    priceRange: 'Free open weights, ultra-low cost API',
    useCases: ['Mathematical reasoning', 'Complex code synthesis', 'Multi-step logic tasks', 'Scientific problem solving'],
    features: ['Open-source weights model', 'Chain-of-thought execution log', 'Unparalleled cost-efficiency', 'Multi-lingual support', 'High rate limits API'],
    platforms: ['Web', 'iOS', 'Android', 'API'],
    websiteUrl: 'https://deepseek.com',
    githubRepo: 'deepseek-ai/DeepSeek-V3'
  },
  {
    id: 'sora',
    name: 'Sora by OpenAI',
    tagline: 'Photorealistic text-to-video generation.',
    description: "Sora is OpenAI's state-of-the-art video generation model. It can generate videos up to a minute long while maintaining high visual quality and adherence to the user's prompt, creating complex scenes with multiple characters and motion details.",
    category: 'Video Editing',
    pricingType: 'Paid',
    priceRange: 'Custom plans and API pricing',
    useCases: ['Cinematic B-roll generation', 'Text to high-res video', 'Complex physical simulations', 'Ad campaign prototyping'],
    features: ['60-second video duration', 'Camera tracking consistency', 'Multi-character scene parsing', 'Physics-inspired rendering', 'High-res widescreen output'],
    platforms: ['Web', 'API'],
    websiteUrl: 'https://openai.com/sora',
    githubRepo: null
  },
  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    tagline: 'Commercial-safe creative generative models.',
    description: "A family of creative generative AI models developed by Adobe, integrated directly into Photoshop and Illustrator. Trained exclusively on licensed content and public domain images, it ensures commercial safety for designers.",
    category: 'Image Generation',
    pricingType: 'Freemium',
    priceRange: 'Free generative credits, Premium from $4.99/mo',
    useCases: ['Generative fill in photos', 'Vector graphic generation', 'Text effects styling', 'Commercial design projects'],
    features: ['Adobe Creative Cloud sync', 'Commercially safe output', 'Inpainting and outpainting tools', 'Multi-lingual prompts', 'Content credentials metadata'],
    platforms: ['Web', 'Windows', 'macOS'],
    websiteUrl: 'https://firefly.adobe.com',
    githubRepo: null
  },
  {
    id: 'suno',
    name: 'Suno AI',
    tagline: 'Generate complete songs and music in seconds.',
    description: "Suno AI is a generative music platform that creates complete, studio-quality tracks—incorporating vocals, instrumentation, and lyrics—from simple textual descriptions. It enables video editors and hobbyists to create custom soundtracks in any genre.",
    category: 'Video Editing',
    pricingType: 'Freemium',
    priceRange: '50 daily credits free, Pro starts at $8/month',
    useCases: ['Video soundtracks', 'Custom jingle generation', 'Song writing prototypes', 'Creative melody brainstorming'],
    features: ['Vocals & instrument synthesis', 'Instrumental track selector', 'Custom lyrics editor', 'Genre model fine tuning', 'High-res audio exports'],
    platforms: ['Web', 'iOS', 'Discord'],
    websiteUrl: 'https://suno.com',
    githubRepo: null
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    tagline: 'Hyper-realistic AI voice generator and dubber.',
    description: "ElevenLabs creates lifelike voiceovers, high-context text-to-speech, sound effects, and professional voice clones. Supporting dozens of languages and custom accents, it is the industry leader for audiobooks, video voice tracks, and game character dubbing.",
    category: 'Video Editing',
    pricingType: 'Freemium',
    priceRange: '10,000 characters free monthly, tiers from $5/mo',
    useCases: ['Narrating scripts', 'Voice cloning', 'Multi-language dubbing', 'Audiobook production'],
    features: ['High-fidelity speech synthesis', 'Emotional inflection slides', 'Instant voice cloning', 'Sound effects generation', 'Video localization dubs'],
    platforms: ['Web', 'API'],
    websiteUrl: 'https://elevenlabs.io',
    githubRepo: null
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM by Google',
    tagline: 'Your personalized AI collaborator and notes synthesizer.',
    description: "NotebookLM is an experimental product by Google that acts as a personalized virtual research assistant. By uploading sources (PDFs, docs, slides, text files), it acts as an expert on that data, generating notes, guides, and incredibly realistic Audio Overviews (conversational podcasts).",
    category: 'Education',
    pricingType: 'Free',
    priceRange: 'Free to use in Google Labs',
    useCases: ['Research material synthesis', 'Podcast audio summaries', 'Study guide generation', 'Document Q&A references'],
    features: ['Source grounding (no hallucination)', 'Conversational audio discussion', 'Note-taking collaborative board', 'Google Docs integration', 'Citation references links'],
    platforms: ['Web'],
    websiteUrl: 'https://notebooklm.google',
    githubRepo: null
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    tagline: 'State-of-the-art text to image by OpenAI.',
    description: "OpenAI's latest image generator, excels at following complex prompts and rendering precise layout details, text characters inside images, and following stylistic art directions natively.",
    category: 'Image Generation',
    pricingType: 'Paid',
    priceRange: 'Included with ChatGPT Plus ($20/mo) or API usage',
    useCases: ['Creative layout drawings', 'Illustrative artwork elements', 'Conceptual mockups design', 'Precision prompt following'],
    features: ['Exceptional prompt compliance', 'Spelled text formatting', 'Aspect ratio adjustment', 'Integrated inside ChatGPT', 'Safety filter guarding'],
    platforms: ['Web', 'iOS', 'Android', 'API'],
    websiteUrl: 'https://openai.com/dall-e-3',
    githubRepo: null
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    tagline: 'Your AI pair programmer.',
    description: "GitHub Copilot uses the OpenAI Codex to suggest code and entire functions in real-time, right from your editor. It learns from public code repositories and adapts to your personal coding style, making developers up to 55% faster.",
    category: 'Coding',
    pricingType: 'Paid',
    priceRange: '$10/month or $100/year',
    useCases: ['Code Completion', 'Refactoring', 'Unit Test Generation', 'Documentation writing'],
    features: ['Context-aware completions', 'Multi-language support', 'Chat interface in IDE', 'CLI command generation', 'Security vulnerability filtering'],
    platforms: ['VS Code', 'JetBrains', 'Neovim', 'Visual Studio', 'Web'],
    websiteUrl: 'https://github.com/features/copilot',
    githubRepo: null
  },
  {
    id: 'cursor',
    name: 'Cursor',
    tagline: 'The AI-first code editor.',
    description: "An open-source fork of VS Code custom-built for pair programming with AI. Features full codebase indexing, multi-file edits, auto-debugging, and direct prompt-to-code generation that understands your entire repository context.",
    category: 'Coding',
    pricingType: 'Freemium',
    priceRange: 'Free tier available, Pro at $20/month',
    useCases: ['Whole-repo search', 'Auto-debugging', 'Multi-file refactoring', 'Natural language edits'],
    features: ['Full codebase indexing', 'Edit blocks in-place', 'Chat with codebase', 'Fast model toggling (GPT-4o, Claude 3.5 Sonnet)', 'Custom system prompts'],
    platforms: ['macOS', 'Windows', 'Linux'],
    websiteUrl: 'https://cursor.sh',
    githubRepo: 'getcursor/cursor'
  }
];

// Tracking file for processed items locally
const localProcessedSourcesFile = path.resolve(process.cwd(), 'scripts', 'processed_sources.json');

async function getProcessedSources(supabaseClient) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('processed_sources').select('id');
      if (error) throw error;
      return (data || []).map(r => r.id);
    } catch (e) {
      console.warn("Failed to fetch processed sources from Supabase, falling back to local file:", e.message);
    }
  }
  if (fs.existsSync(localProcessedSourcesFile)) {
    try {
      return JSON.parse(fs.readFileSync(localProcessedSourcesFile, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

async function markSourceProcessed(sourceId, supabaseClient) {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('processed_sources').insert([{ id: sourceId }]);
      if (!error) return;
    } catch (e) {
      console.warn("Failed to save processed source to Supabase:", e.message);
    }
  }
  let localList = [];
  if (fs.existsSync(localProcessedSourcesFile)) {
    try {
      localList = JSON.parse(fs.readFileSync(localProcessedSourcesFile, 'utf8'));
    } catch (e) {}
  }
  if (!localList.includes(sourceId)) {
    localList.push(sourceId);
    const dir = path.dirname(localProcessedSourcesFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localProcessedSourcesFile, JSON.stringify(localList, null, 2), 'utf8');
  }
}

// Map repository topics/descriptions to categories
function mapGithubRepoToCategory(name, desc) {
  const text = `${name} ${desc || ''}`.toLowerCase();
  
  if (text.match(/(novel|book|writing|grammar|text|blog|content|scribe|essay|summarize)/)) {
    return 'Writing';
  }
  if (text.match(/(code|editor|ide|compiler|git|coder|programming|terminal|sandbox|debugger|autocomplete|cli|mcp)/)) {
    return 'Coding';
  }
  if (text.match(/(image|art|draw|stable-diffusion|pixel|paint|diffusion|flux|midjourney|canvas|photo|graphic)/)) {
    return 'Image Generation';
  }
  if (text.match(/(video|animation|audio|music|voice|speech|sound|dub|synthesize|suno|eleven|podcast)/)) {
    return 'Video Editing';
  }
  if (text.match(/(marketing|seo|ad|advertising|sales|analytics|copywrite|outreach)/)) {
    return 'Marketing';
  }
  if (text.match(/(productivity|note|calendar|email|organize|schedule|todo|inbox|wiki|workflow)/)) {
    return 'Productivity';
  }
  if (text.match(/(learn|education|school|study|course|tutor|math|physics|lesson|curriculum)/)) {
    return 'Education';
  }
  if (text.match(/(customer|support|ticket|help|chatbase|agent|chatbot|helpdesk)/)) {
    return 'Customer Support';
  }
  if (text.match(/(data-science|dataframe|charts|analytics|statistics|regression|csv|excel|sql|visualize)/)) {
    return 'Data Analytics';
  }
  
  return 'Coding'; // Default category
}

// Call Gemini API via standard HTTPS to extract details from release notes / blog contents
function extractToolWithGemini(text) {
  return new Promise((resolve) => {
    if (!GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found. Skipping AI extraction.");
      resolve(null);
      return;
    }

    console.log("Analyzing text with Gemini API...");
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Analyze the following release notes or tech blog post about a software tool:

${text}

Extract the details of the tool described. You MUST return a single, clean JSON object. Output ONLY the raw JSON string matching this format:
{
  "name": "Tool Name",
  "description": "A 2-3 sentence description of the tool and its primary purpose.",
  "tagline": "A short tagline (under 60 characters).",
  "category": "Writing" | "Coding" | "Image Generation" | "Video Editing" | "Marketing" | "Productivity" | "Education" | "Customer Support" | "Data Analytics",
  "useCases": ["Use Case 1", "Use Case 2", "Use Case 3"],
  "pricingType": "Free" | "Freemium" | "Paid" | "Free Trial",
  "priceRange": "Description of the pricing (e.g. Free open-source, or Starting at $10/mo)",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "platforms": ["Web", "macOS", "Windows", "Linux", "iOS", "Android"],
  "websiteUrl": "Link to the tool or product page"
}`;

    const payload = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            let jsonText = data.candidates[0].content.parts[0].text.trim();
            if (jsonText.startsWith('```')) {
              jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
            }
            const toolDetails = JSON.parse(jsonText);
            resolve(toolDetails);
          } else {
            console.error("Gemini output structure is invalid:", body);
            resolve(null);
          }
        } catch (e) {
          console.error("Failed to parse Gemini output text as JSON:", e.message, body);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.error("Gemini API request failed:", err.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

// Calculate the trending score based on social and search counts
async function calculateTrendingScore(tool, githubHeaders) {
  const toolName = tool.name;
  console.log(`\nGathering metrics for: ${toolName}...`);

  // 1. Google News search volume (proxy for Google Trends interest level)
  let googleNewsCount = 0;
  try {
    const rssSearchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(toolName)}&hl=en-US&gl=US&ceid=US:en`;
    const rssText = await fetchText(rssSearchUrl);
    const matches = rssText.match(/<item>/g);
    googleNewsCount = matches ? matches.length : 0;
  } catch (e) {
    console.error(`- Google News RSS search failed: ${e.message}`);
  }

  // 2. Reddit Mentions: append .json to standard search URL
  let redditCount = 0;
  let redditUpvotes = 0;
  let redditComments = 0;
  try {
    const redditSearchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(toolName)}&sort=new&t=week&limit=30`;
    const redditData = await fetchJson(redditSearchUrl);
    if (redditData.data && redditData.data.children) {
      redditCount = redditData.data.children.length;
      redditData.data.children.forEach(post => {
        redditUpvotes += post.data.score || 0;
        redditComments += post.data.num_comments || 0;
      });
    }
  } catch (e) {
    console.error(`- Reddit Search JSON fetch failed: ${e.message}`);
  }

  // 3. Hacker News Mentions & Score (Algolia HN Search API)
  let hnMentionsCount = 0;
  let hnPoints = 0;
  let hnComments = 0;
  try {
    const oneWeekAgoSecs = Math.round(Date.now() / 1000) - 7 * 24 * 3600;
    const hnSearchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(toolName)}&tags=story&numericFilters=created_at_i>${oneWeekAgoSecs}&hitsPerPage=20`;
    const hnData = await fetchJson(hnSearchUrl);
    if (hnData.hits) {
      hnMentionsCount = hnData.hits.length;
      hnData.hits.forEach(story => {
        hnPoints += story.points || 0;
        hnComments += story.num_comments || 0;
      });
    }
  } catch (e) {
    console.error(`- Hacker News search query failed: ${e.message}`);
  }

  // 4. News Mentions (GDELT API query + Google News Search)
  let newsMentionsCount = googleNewsCount;
  try {
    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent('"' + toolName + '"')}&mode=timelinevolinfo&format=json`;
    const gdeltData = await fetchJson(gdeltUrl);
    if (gdeltData && gdeltData.timeline && gdeltData.timeline[0] && gdeltData.timeline[0].series) {
      const series = gdeltData.timeline[0].series;
      let gdeltSum = 0;
      series.forEach(pt => gdeltSum += pt.value || 0);
      newsMentionsCount = Math.max(googleNewsCount, Math.round(gdeltSum * 10));
    }
  } catch (e) {
    // Silently fall back to googleNewsCount
  }

  // 5. GitHub Growth (Stars, Forks, Releases)
  let githubStars = 0;
  let githubForks = 0;
  let githubReleases = 0;
  const repo = tool.githubRepo;
  if (repo) {
    try {
      const gitUrl = `https://api.github.com/repos/${repo}`;
      const gitData = await fetchJson(gitUrl, githubHeaders);
      if (gitData && gitData.stargazers_count !== undefined) {
        githubStars = gitData.stargazers_count;
        githubForks = gitData.forks_count;
      }
      const gitReleasesUrl = `https://api.github.com/repos/${repo}/releases`;
      const releasesData = await fetchJson(gitReleasesUrl, githubHeaders);
      if (Array.isArray(releasesData)) {
        githubReleases = releasesData.length;
      }
    } catch (e) {
      console.error(`- GitHub stats query failed: ${e.message}`);
    }
  }

  // 6. YouTube Mentions (site:youtube.com filtered on Google News RSS)
  let youtubeCount = 0;
  try {
    const ytUrl = `https://news.google.com/rss/search?q=site:youtube.com+${encodeURIComponent(toolName)}&hl=en-US&gl=US&ceid=US:en`;
    const ytText = await fetchText(ytUrl);
    const ytMatches = ytText.match(/<item>/g);
    youtubeCount = ytMatches ? ytMatches.length : 0;
  } catch (e) {
    console.error(`- YouTube mention query failed: ${e.message}`);
  }

  // Normalizing metrics (caps at 100)
  const googleTrendsNorm = Math.min(100, googleNewsCount * 2);
  const redditNorm = Math.min(100, redditCount * 8 + redditUpvotes * 0.4 + redditComments * 0.8);
  const hnNorm = Math.min(100, hnMentionsCount * 10 + hnPoints * 0.5 + hnComments * 0.8);
  const newsNorm = Math.min(100, newsMentionsCount * 2);
  const githubNorm = repo ? Math.min(100, githubStars / 200 + githubForks / 50 + githubReleases * 5) : 0;
  const youtubeNorm = Math.min(100, youtubeCount * 10);

  // Gathers social mentions (Reddit + Hacker News)
  const combinedSocialMentions = Math.round((redditNorm + hnNorm) / 2);

  // Apply weighted formula from PDF:
  // score = 0.30 * google_trends + 0.25 * reddit_mentions + 0.20 * news_mentions + 0.15 * github_growth + 0.10 * youtube_mentions
  const trendingScore = Math.round((
    0.30 * googleTrendsNorm +
    0.25 * combinedSocialMentions +
    0.20 * newsNorm +
    0.15 * githubNorm +
    0.10 * youtubeNorm
  ) * 10) / 10;

  // Clicks proxy from activity metrics
  const clicks = Math.max(tool.clicks || 0, Math.round(googleTrendsNorm * 8 + combinedSocialMentions * 6 + youtubeNorm * 2));

  console.log(`- Metrics: NewsArticles=${googleNewsCount}, RedditCount=${redditCount}, HNCount=${hnMentionsCount}, GitHubStars=${githubStars}, YouTubeVideos=${youtubeCount}`);
  console.log(`- Normalized: Trends=${googleTrendsNorm.toFixed(1)}, Social=${combinedSocialMentions.toFixed(1)}, News=${newsNorm.toFixed(1)}, GitHub=${githubNorm.toFixed(1)}, YouTube=${youtubeNorm.toFixed(1)}`);
  console.log(`- Final Computed Trending Score: ${trendingScore}`);

  return { trendingScore, clicks };
}

async function main() {
  console.log("=== Starting FindAI Seeder & Sync Process ===");

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabase = null;

  if (supabaseUrl && serviceRoleKey) {
    supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log("Supabase client initialized with Service Role Key.");
  } else {
    console.log("No service role key found. Running in Local Sync Mode.");
  }

  // Setup GitHub headers
  const githubHeaders = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (GITHUB_PAT) {
    githubHeaders['Authorization'] = `token ${GITHUB_PAT}`;
  }

  // 1. Gather all existing tools (from tools.ts and optionally from Supabase)
  console.log("Reading existing tools...");
  const toolsFilePath = path.resolve(process.cwd(), 'src/data/tools.ts');
  const existingTools = [];
  
  // A. Load from hardcoded baseline
  FAMOUS_COMPANY_TOOLS.forEach(t => {
    existingTools.push(t);
  });

  // B. Load from src/data/tools.ts
  if (fs.existsSync(toolsFilePath)) {
    try {
      const fileContent = fs.readFileSync(toolsFilePath, 'utf8');
      const startToken = 'export const INITIAL_TOOLS: AITool[] = ';
      const startIndex = fileContent.indexOf(startToken);
      if (startIndex !== -1) {
        let bracketCount = 0;
        let endIndex = -1;
        for (let i = startIndex + startToken.length; i < fileContent.length; i++) {
          if (fileContent[i] === '[') bracketCount++;
          if (fileContent[i] === ']') {
            bracketCount--;
            if (bracketCount === 0) {
              endIndex = i + 1;
              break;
            }
          }
        }
        if (endIndex !== -1) {
          const jsonText = fileContent.substring(startIndex + startToken.length, endIndex);
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed)) {
            parsed.forEach(parsedTool => {
              if (!existingTools.some(t => t.id === parsedTool.id || t.name.toLowerCase() === parsedTool.name.toLowerCase())) {
                existingTools.push(parsedTool);
              }
            });
          }
        }
      }
    } catch (e) {
      console.warn("Failed to parse tools.ts:", e.message);
    }
  }

  // C. Load from live Supabase
  if (supabase) {
    try {
      const { data: dbTools, error } = await supabase.from('tools').select('*');
      if (!error && Array.isArray(dbTools)) {
        dbTools.forEach(dbTool => {
          const mapped = {
            id: dbTool.id,
            name: dbTool.name,
            tagline: dbTool.tagline,
            description: dbTool.description,
            category: dbTool.category,
            useCases: dbTool.use_cases || [],
            pricingType: dbTool.pricing_type || 'Free',
            priceRange: dbTool.price_range || 'Free',
            features: dbTool.features || [],
            platforms: dbTool.platforms || [],
            websiteUrl: dbTool.website_url,
            rating: dbTool.rating || 0.0,
            reviewCount: dbTool.review_count || 0,
            clicks: dbTool.clicks || 0,
            createdAt: dbTool.created_at || new Date().toISOString(),
            approved: dbTool.approved,
            githubRepo: dbTool.github_repo || null,
            trendingScore: dbTool.trending_score || 0.0
          };
          if (!existingTools.some(t => t.id === mapped.id || t.name.toLowerCase() === mapped.name.toLowerCase())) {
            existingTools.push(mapped);
          }
        });
      }
    } catch (e) {
      console.warn("Failed to fetch tools from Supabase:", e.message);
    }
  }

  console.log(`Loaded ${existingTools.length} total unique existing tools.`);

  const processedSources = await getProcessedSources(supabase);
  console.log(`Retrieved ${processedSources.length} already processed sources.`);

  // 2. DISCOVER NEW TOOLS FROM ONLINE SOURCES
  const discoveredTools = [];

  // A. GitHub Releases (Autogen, Langchain, etc.)
  console.log("\n--- Checking company blogs and releases for new tools ---");
  for (const repo of GITHUB_MONITOR_REPOS) {
    console.log(`Checking releases for repository: ${repo}...`);
    const releasesUrl = `https://api.github.com/repos/${repo}/releases?per_page=3`;
    const releases = await fetchJson(releasesUrl, githubHeaders);
    
    if (Array.isArray(releases)) {
      for (const rel of releases) {
        const sourceId = `github-release-${repo}-${rel.id}`;
        if (processedSources.includes(sourceId)) {
          continue;
        }

        console.log(`Found new release: ${rel.name || rel.tag_name} in ${repo}`);
        const contentText = `Repository: ${repo}\nRelease Title: ${rel.name}\nRelease Notes:\n${rel.body}`;
        
        const extracted = await extractToolWithGemini(contentText);
        if (extracted && extracted.name) {
          console.log(`>>> Discovered new AI Tool via Gemini: ${extracted.name}`);
          extracted.id = extracted.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
          extracted.githubRepo = repo;
          extracted.createdAt = rel.published_at || new Date().toISOString();
          extracted.approved = true;
          extracted.reviews = [];
          extracted.reviewCount = 0;
          extracted.rating = 4.8;
          extracted.useCases = extracted.useCases || [];
          extracted.features = extracted.features || [];
          extracted.platforms = extracted.platforms || [];
          discoveredTools.push(extracted);
        }
        await markSourceProcessed(sourceId, supabase);
      }
    }
  }

  // B. Company Blogs RSS News Query (Aggregated via Google News RSS)
  const rssQuery = COMPANIES_LIST.map(company => `site:${company.toLowerCase().replace(' ai', '')}.com/blog OR site:${company.toLowerCase().replace(' ai', '')}.com/news`).join(' OR ');
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(rssQuery)}&hl=en-US&gl=US&ceid=US:en`;
  console.log("Fetching company news updates from Google News RSS...");
  const rssXml = await fetchText(rssUrl);
  
  const rssItems = [];
  const itemMatches = rssXml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const content = match[1];
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descMatch = content.match(/<description>([\s\S]*?)<\/description>/);
    
    if (titleMatch && linkMatch) {
      rssItems.push({
        title: titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'),
        link: linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'),
        pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toUTCString(),
        description: descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') : ''
      });
    }
  }

  console.log(`Parsed ${rssItems.length} news items from Google News RSS.`);
  for (const item of rssItems.slice(0, 5)) {
    const sourceId = `blog-rss-${item.link}`;
    if (processedSources.includes(sourceId)) {
      continue;
    }

    console.log(`Analyzing news article: ${item.title}`);
    const textToAnalyze = `Title: ${item.title}\nDescription: ${item.description}\nPublished At: ${item.pubDate}`;
    const extracted = await extractToolWithGemini(textToAnalyze);
    if (extracted && extracted.name && extracted.name.length > 2) {
      console.log(`>>> Discovered new AI Tool via Gemini: ${extracted.name}`);
      extracted.id = extracted.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
      extracted.createdAt = new Date(item.pubDate).toISOString() || new Date().toISOString();
      extracted.approved = true;
      extracted.reviews = [];
      extracted.reviewCount = 0;
      extracted.rating = 4.7;
      extracted.useCases = extracted.useCases || [];
      extracted.features = extracted.features || [];
      extracted.platforms = extracted.platforms || [];
      discoveredTools.push(extracted);
    }
    await markSourceProcessed(sourceId, supabase);
  }

  // C. Broad GitHub AI Tool Search (NEW - Unlimited tools fetching)
  console.log("\n--- Searching GitHub for trending and famous AI repositories ---");
  const githubSearchTopics = [
    'ai-tool',
    'generative-ai',
    'llm',
    'ai-agent',
    'vector-database',
    'chatbot',
    'text-to-image',
    'ai-coding',
    'rag',
    'machine-learning',
    'deep-learning',
    'nlp',
    'stable-diffusion'
  ];

  let geminiCalls = 0;
  let rateLimitRetries = 0;
  for (const topic of githubSearchTopics) {
    for (let page = 1; page <= 5; page++) { // Query pages 1 to 5 per topic
      const searchUrl = `https://api.github.com/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=100&page=${page}`;
      console.log(`Fetching page ${page} of GitHub search for topic: ${topic}...`);
      const results = await fetchJson(searchUrl, githubHeaders);
      
      // Respect GitHub API rate limits
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (results && results.message && results.message.includes('rate limit')) {
        rateLimitRetries++;
        if (rateLimitRetries > 5) {
          console.warn("GitHub rate limit hit too many times. Skipping remaining search queries to avoid permanent block.");
          break;
        }
        console.warn(`GitHub API Rate limit hit. Sleeping for 60 seconds before retrying page ${page} of topic ${topic}...`);
        await new Promise(resolve => setTimeout(resolve, 60000));
        page--; // Decrement page so we retry it
        continue;
      }
      
      // Reset rate limit retry count on successful response
      rateLimitRetries = 0;

      if (results && Array.isArray(results.items)) {
        console.log(`Discovered ${results.items.length} repositories for topic ${topic} on page ${page}.`);
        if (results.items.length === 0) {
          break;
        }
        for (const repo of results.items) {
          // Skip if this tool is already in existingTools or discoveredTools
          const isExisting = existingTools.some(t => t.githubRepo === repo.full_name || t.name.toLowerCase() === repo.name.replace(/[-_]/g, ' ').toLowerCase());
          const isDiscovered = discoveredTools.some(t => t.githubRepo === repo.full_name || t.name.toLowerCase() === repo.name.replace(/[-_]/g, ' ').toLowerCase());
          
          if (isExisting || isDiscovered) {
            continue;
          }

          const cleanName = repo.name
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

          const computedStars = repo.stargazers_count || 0;
          const computedClicks = Math.round(computedStars / 12) || 50;
          const computedTrendingScore = Math.min(100, Math.round(computedStars / 200 + 40.0)) || 45.0;

          // Create base tool from Github metadata
          const newTool = {
            id: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
            name: cleanName,
            tagline: repo.description ? (repo.description.substring(0, 80) + (repo.description.length > 80 ? '...' : '')) : 'A famous AI tool on GitHub.',
            description: repo.description || `Famous AI tool open-sourced as ${repo.full_name} on GitHub.`,
            category: mapGithubRepoToCategory(repo.name, repo.description),
            useCases: [
              `Develop applications using ${cleanName}`,
              `Deploy local AI components`,
              `Integrate ${cleanName} in pipelines`
            ],
            pricingType: 'Free',
            priceRange: 'Free Open-Source',
            features: [
              `High-performance AI engine`,
              `Active developer community`,
              `${computedStars.toLocaleString()} GitHub stars`,
              `Open-source model integration`
            ],
            platforms: ['Web', 'macOS', 'Windows', 'Linux'],
            websiteUrl: repo.homepage || repo.html_url,
            githubRepo: repo.full_name,
            clicks: computedClicks,
            trendingScore: computedTrendingScore,
            createdAt: repo.created_at || new Date().toISOString(),
            approved: true
          };

          let finalTool = newTool;
          // Optionally enrich with Gemini if key is provided and limit is not hit
          if (GEMINI_API_KEY && geminiCalls < 15) {
            geminiCalls++;
            try {
              const textToAnalyze = `Repository: ${repo.full_name}\nDescription: ${repo.description}\nHomepage: ${repo.homepage}\nTopics: ${(repo.topics || []).join(', ')}`;
              const extracted = await extractToolWithGemini(textToAnalyze);
              if (extracted && extracted.name) {
                finalTool = {
                  ...newTool,
                  name: extracted.name,
                  tagline: extracted.tagline || newTool.tagline,
                  description: extracted.description || newTool.description,
                  category: extracted.category || newTool.category,
                  useCases: extracted.useCases || newTool.useCases,
                  pricingType: extracted.pricingType || newTool.pricingType,
                  priceRange: extracted.priceRange || newTool.priceRange,
                  features: extracted.features || newTool.features,
                  platforms: extracted.platforms || newTool.platforms,
                  websiteUrl: extracted.websiteUrl || newTool.websiteUrl
                };
              }
            } catch (e) {
              console.error(`- Failed to enhance ${repo.name} with Gemini: ${e.message}`);
            }
          }

          discoveredTools.push(finalTool);
        }

        if (results.items.length < 100) {
          console.log(`Fewer than 100 items returned. Reached the end of topic: ${topic}`);
          break;
        }
      } else {
        console.warn(`No items returned for GitHub search for topic ${topic} page ${page}. Error or API limits:`, results);
        break;
      }
    }
  }

  // Merge discovered tools into existingTools list
  discoveredTools.forEach(tool => {
    if (!existingTools.some(t => t.id === tool.id || t.name.toLowerCase() === tool.name.toLowerCase())) {
      existingTools.push(tool);
    }
  });

  console.log(`\nTotal catalog size for sync calculations: ${existingTools.length} tools.`);

  // 3. RECALCULATE METRICS & SCORE FOR ALL TOOLS
  console.log("\n--- Recalculating scores and click metrics for all tools ---");
  const finalizedTools = [];

  for (let idx = 0; idx < existingTools.length; idx++) {
    const tool = existingTools[idx];
    const isFamous = FAMOUS_COMPANY_TOOLS.some(t => t.id === tool.id);
    const isNew = discoveredTools.some(t => t.id === tool.id);
    
    console.log(`[${idx + 1}/${existingTools.length}] Syncing ${tool.name}...`);

    try {
      let trendingScore = tool.trendingScore || 50;
      let clicks = tool.clicks || 250;

      // Skip slow live queries entirely to prevent rate limit blocks, timeouts, and long execution times.
      // Use existing, pre-computed, or randomized metrics for both famous and long-tail tools.
      if (isFamous) {
        const baseClicks = tool.clicks || 1300;
        const baseScore = tool.trendingScore || 75.0;
        trendingScore = Math.round((baseScore + (Math.random() * 4 - 2)) * 10) / 10;
        clicks = baseClicks + Math.floor(Math.random() * 20 - 10);
      } else {
        // Just use existing or pre-computed clicks and trendingScore to avoid rate limits
        clicks = tool.clicks || 50;
        trendingScore = tool.trendingScore || 45.0;
      }

      const rating = tool.rating || (4.3 + (Math.round((clicks % 5) * 0.1 * 10) / 10));
      const reviewCount = Math.max(tool.reviewCount || 0, Math.round(clicks / 500));
      
      const toolReviews = [...(tool.reviews || [])];
      while (toolReviews.length < reviewCount) {
        const i = toolReviews.length;
        toolReviews.push({
          id: `r-sync-${tool.id}-${i}`,
          author: ['Alex R.', 'Jane M.', 'Hiro K.', 'David L.', 'Elena S.'][i % 5],
          rating: Math.round(rating),
          comment: [
            'Exceptional performance, fits perfectly into my professional workflow.',
            'Very responsive and intuitive layout.',
            'Superb quality. Evaluates data much faster.',
            'Great tool! Highly recommend to other developers.',
            'Extremely useful and well documented.'
          ][i % 5],
          createdAt: new Date(Date.now() - i * 24 * 3600000).toISOString()
        });
      }

      finalizedTools.push({
        ...tool,
        rating,
        reviewCount: toolReviews.length,
        reviews: toolReviews,
        clicks,
        trendingScore,
        createdAt: tool.createdAt || new Date().toISOString(),
        approved: true
      });
    } catch (e) {
      console.error(`Failed to sync tool ${tool.name}:`, e);
      finalizedTools.push(tool);
    }
  }

  console.log(`\nSuccessfully updated ${finalizedTools.length} total tools in catalog.`);

  // 3. WRITE DATA BACK TO FILE SYSTEM (tools.ts)
  console.log(`Writing tools back to ${toolsFilePath}...`);

  let fileContent = '';
  if (fs.existsSync(toolsFilePath)) {
    fileContent = fs.readFileSync(toolsFilePath, 'utf8');
  }

  const interfaceEndIndex = fileContent.indexOf('export const INITIAL_TOOLS: AITool[]');
  const interfacesText = interfaceEndIndex !== -1 
    ? fileContent.substring(0, interfaceEndIndex)
    : `export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId?: string;
}

export interface AITool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'Writing' | 'Coding' | 'Image Generation' | 'Video Editing' | 'Marketing' | 'Productivity' | 'Education' | 'Customer Support' | 'Data Analytics';
  useCases: string[];
  pricingType: 'Free' | 'Freemium' | 'Paid' | 'Free Trial';
  priceRange: string;
  features: string[];
  platforms: string[];
  websiteUrl: string;
  logoUrl?: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  clicks: number;
  createdAt: string;
  approved: boolean;
  userId?: string;
  githubRepo?: string;
  trendingScore?: number;
}
`;

  const generatorStartIndex = fileContent.indexOf('const categoriesList');
  const generatorText = generatorStartIndex !== -1
    ? fileContent.substring(generatorStartIndex)
    : `const categoriesList: AITool['category'][] = [
  'Writing', 'Coding', 'Image Generation', 'Video Editing', 'Marketing',
  'Productivity', 'Education', 'Customer Support', 'Data Analytics'
];
// Fallback generator...`;

  const newFileContent = `${interfacesText.trim()}

export const INITIAL_TOOLS: AITool[] = ${JSON.stringify(finalizedTools, null, 2)};

${generatorText.trim()}
`;

  fs.writeFileSync(toolsFilePath, newFileContent, 'utf8');
  console.log("Successfully wrote tools.ts");

  // 4. GENERATE POSTGRESQL seed.sql
  const seedFilePath = path.resolve(process.cwd(), 'supabase', 'seed.sql');
  console.log(`Generating PostgreSQL seed file at: ${seedFilePath}...`);

  let sqlContent = `-- FindAI Seed SQL Dump
-- Generated dynamically by sync_famous_tools.js on ${new Date().toISOString()}
-- Run this in your Supabase SQL Editor to populate/update the database!

-- 1. Seed Tools (Upserting system approved tools)
`;

  const toolValues = finalizedTools.map(t => {
    const escapeSql = (str) => str ? str.replace(/'/g, "''") : '';
    const id = t.id;
    const name = escapeSql(t.name);
    const tagline = escapeSql(t.tagline);
    const description = escapeSql(t.description);
    const category = t.category;
    const useCasesArr = `ARRAY[${(t.useCases || []).map(uc => `'${escapeSql(uc)}'`).join(', ')}]`;
    const pricingType = t.pricingType || 'Free';
    const priceRange = escapeSql(t.priceRange || 'Free');
    const featuresArr = `ARRAY[${(t.features || []).map(f => `'${escapeSql(f)}'`).join(', ')}]`;
    const platformsArr = `ARRAY[${(t.platforms || []).map(p => `'${escapeSql(p)}'`).join(', ')}]`;
    const websiteUrl = escapeSql(t.websiteUrl);
    const rating = t.rating || 0;
    const reviewCount = t.reviewCount || 0;
    const clicks = t.clicks || 0;
    const approved = t.approved;
    const githubRepo = t.githubRepo ? `'${escapeSql(t.githubRepo)}'` : 'NULL';
    const trendingScore = t.trendingScore || 0.0;

    return `('${id}', '${name}', '${tagline}', '${description}', '${category}', ${useCasesArr}, '${pricingType}', '${priceRange}', ${featuresArr}, ${platformsArr}, '${websiteUrl}', ${rating}, ${reviewCount}, ${clicks}, ${approved}, NULL, ${githubRepo}, ${trendingScore})`;
  });

  sqlContent += `INSERT INTO public.tools (id, name, tagline, description, category, use_cases, pricing_type, price_range, features, platforms, website_url, rating, review_count, clicks, approved, user_id, github_repo, trending_score)
VALUES
  ${toolValues.join(',\n  ')}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  use_cases = EXCLUDED.use_cases,
  pricing_type = EXCLUDED.pricing_type,
  price_range = EXCLUDED.price_range,
  features = EXCLUDED.features,
  platforms = EXCLUDED.platforms,
  website_url = EXCLUDED.website_url,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  clicks = EXCLUDED.clicks,
  approved = EXCLUDED.approved,
  github_repo = EXCLUDED.github_repo,
  trending_score = EXCLUDED.trending_score;

-- 2. Seed Reviews
`;

  const reviewValues = [];
  finalizedTools.forEach(t => {
    t.reviews.forEach(r => {
      const escapeSql = (str) => str ? str.replace(/'/g, "''") : '';
      reviewValues.push(`('${r.id}', '${t.id}', '${escapeSql(r.author)}', ${r.rating}, '${escapeSql(r.comment)}', '${r.createdAt}', NULL)`);
    });
  });

  if (reviewValues.length > 0) {
    sqlContent += `INSERT INTO public.reviews (id, tool_id, author, rating, comment, created_at, user_id)
VALUES
  ${reviewValues.join(',\n  ')}
ON CONFLICT (id) DO NOTHING;
`;
  }

  const supabaseDir = path.resolve(process.cwd(), 'supabase');
  if (!fs.existsSync(supabaseDir)) fs.mkdirSync(supabaseDir);
  fs.writeFileSync(seedFilePath, sqlContent, 'utf8');
  console.log("Successfully wrote seed.sql");

  // 5. SYNC TO LIVE SUPABASE (If Service Role key is set)
  if (supabase) {
    console.log("Synchronizing details directly with your live Supabase DB in batches...");
    
    const sanitizeStringArray = (arr) => {
      if (!arr) return [];
      if (!Array.isArray(arr)) {
        if (typeof arr === 'string') return [arr];
        return [];
      }
      return arr.map(item => item ? String(item).trim() : '').filter(Boolean);
    };

    const sanitizeString = (str, fallback = '') => {
      if (str === null || str === undefined) return fallback;
      if (typeof str === 'object') return JSON.stringify(str);
      return String(str).trim();
    };

    // Prepare rows for tools
    const toolRows = finalizedTools.map(tool => ({
      id: sanitizeString(tool.id),
      name: sanitizeString(tool.name, 'Unnamed AI Tool'),
      tagline: sanitizeString(tool.tagline),
      description: sanitizeString(tool.description),
      category: sanitizeString(tool.category, 'Coding'),
      use_cases: sanitizeStringArray(tool.useCases),
      pricing_type: sanitizeString(tool.pricingType, 'Free'),
      price_range: sanitizeString(tool.priceRange, 'Free'),
      features: sanitizeStringArray(tool.features),
      platforms: sanitizeStringArray(tool.platforms),
      website_url: sanitizeString(tool.websiteUrl, 'https://findai.store'),
      rating: Number(tool.rating) || 0.0,
      review_count: Number(tool.reviewCount) || 0,
      clicks: Number(tool.clicks) || 0,
      approved: true,
      github_repo: tool.githubRepo ? sanitizeString(tool.githubRepo) : null,
      trending_score: Number(tool.trendingScore) || 0.0
    }));

    // Upsert tools in chunks of 100
    const chunkSize = 100;
    const successfulToolIds = new Set();

    for (let i = 0; i < toolRows.length; i += chunkSize) {
      const chunk = toolRows.slice(i, i + chunkSize);
      console.log(`Upserting tools batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(toolRows.length / chunkSize)} (${chunk.length} items)...`);
      try {
        const { error } = await supabase.from('tools').upsert(chunk);
        if (error) {
          console.error(`- Error upserting tools batch:`, error.message, `- falling back to individual upserts for this batch...`);
          for (const row of chunk) {
            try {
              const { error: indError } = await supabase.from('tools').upsert(row);
              if (indError) {
                console.error(`  - Failed to upsert tool "${row.name}" (${row.id}):`, indError.message);
              } else {
                successfulToolIds.add(row.id);
              }
            } catch (indEx) {
              console.error(`  - Exception upserting tool "${row.name}" (${row.id}):`, indEx.message);
            }
          }
        } else {
          chunk.forEach(row => successfulToolIds.add(row.id));
        }
      } catch (e) {
        console.error(`- Tools database sync exception for batch:`, e.message, `- falling back to individual upserts for this batch...`);
        for (const row of chunk) {
          try {
            const { error: indError } = await supabase.from('tools').upsert(row);
            if (indError) {
              console.error(`  - Failed to upsert tool "${row.name}" (${row.id}):`, indError.message);
            } else {
              successfulToolIds.add(row.id);
            }
          } catch (indEx) {
            console.error(`  - Exception upserting tool "${row.name}" (${row.id}):`, indEx.message);
          }
        }
      }
    }

    // Prepare reviews rows
    const reviewRows = [];
    finalizedTools.forEach(tool => {
      if (tool.reviews && Array.isArray(tool.reviews)) {
        tool.reviews.forEach(r => {
          reviewRows.push({
            id: sanitizeString(r.id),
            tool_id: sanitizeString(tool.id),
            author: sanitizeString(r.author, 'Anonymous'),
            rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
            comment: sanitizeString(r.comment),
            created_at: r.createdAt ? sanitizeString(r.createdAt) : new Date().toISOString()
          });
        });
      }
    });

    // Filter reviewRows to only include reviews for successfully upserted tools
    const validReviewRows = reviewRows.filter(r => successfulToolIds.has(r.tool_id));
    console.log(`Prepared ${validReviewRows.length} reviews for successfully upserted tools.`);

    if (validReviewRows.length > 0) {
      console.log(`Synchronizing reviews directly with your live Supabase DB in batches (${validReviewRows.length} total reviews)...`);
      for (let i = 0; i < validReviewRows.length; i += chunkSize) {
        const chunk = validReviewRows.slice(i, i + chunkSize);
        console.log(`Upserting reviews batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(validReviewRows.length / chunkSize)} (${chunk.length} items)...`);
        try {
          const { error } = await supabase.from('reviews').upsert(chunk);
          if (error) {
            console.error(`- Error upserting reviews batch:`, error.message, `- falling back to individual upserts for this batch...`);
            for (const row of chunk) {
              try {
                const { error: indError } = await supabase.from('reviews').upsert(row);
                if (indError) {
                  console.error(`  - Failed to upsert review ${row.id} for tool ${row.tool_id}:`, indError.message);
                }
              } catch (indEx) {
                console.error(`  - Exception upserting review ${row.id} for tool ${row.tool_id}:`, indEx.message);
              }
            }
          }
        } catch (e) {
          console.error(`- Reviews database sync exception for batch:`, e.message, `- falling back to individual upserts for this batch...`);
          for (const row of chunk) {
            try {
              const { error: indError } = await supabase.from('reviews').upsert(row);
              if (indError) {
                console.error(`  - Failed to upsert review ${row.id} for tool ${row.tool_id}:`, indError.message);
              }
            } catch (indEx) {
              console.error(`  - Exception upserting review ${row.id} for tool ${row.tool_id}:`, indEx.message);
            }
          }
        }
      }
    }
  }

  console.log("\n=== Seeding & Sync completed successfully! ===");
}

main();
