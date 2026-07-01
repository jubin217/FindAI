import fs from 'fs';
import path from 'path';

function generateSitemap() {
  console.log("Generating sitemap.xml...");
  
  const toolsFilePath = path.resolve(process.cwd(), 'src/data/tools.ts');
  const sitemapDestPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  
  const today = new Date().toISOString().split('T')[0];
  const urls = [];
  
  // Base URLs
  urls.push({
    loc: 'https://findai.store/',
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0'
  });
  
  urls.push({
    loc: 'https://findai.store/#/submit-tool',
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.6'
  });

  // Extract tools from tools.ts
  if (fs.existsSync(toolsFilePath)) {
    try {
      const fileContent = fs.readFileSync(toolsFilePath, 'utf8');
      const startToken = 'export const INITIAL_TOOLS: AITool[] = ';
      const startIndex = fileContent.indexOf(startToken);
      
      if (startIndex !== -1) {
        let bracketCount = 0;
        let endIndex = -1;
        let inString = false;
        let escapeNext = false;
        
        for (let i = startIndex + startToken.length; i < fileContent.length; i++) {
          const char = fileContent[i];
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          if (char === '"') {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '[') bracketCount++;
            if (char === ']') {
              bracketCount--;
              if (bracketCount === 0) {
                endIndex = i + 1;
                break;
              }
            }
          }
        }
        
        if (endIndex !== -1) {
          const jsonText = fileContent.substring(startIndex + startToken.length, endIndex);
          const tools = JSON.parse(jsonText);
          
          if (Array.isArray(tools)) {
            console.log(`Parsed ${tools.length} baseline tools from tools.ts`);
            tools.forEach(tool => {
              if (tool && tool.id) {
                // Escape special characters in URLs if necessary (IDs should be alphanumeric/hyphens)
                const escapedId = encodeURIComponent(tool.id);
                urls.push({
                  loc: `https://findai.store/#/tool/${escapedId}`,
                  lastmod: today,
                  changefreq: 'weekly',
                  priority: '0.8'
                });
              }
            });
          }
        } else {
          console.warn("Could not find terminating bracket for INITIAL_TOOLS in tools.ts");
        }
      } else {
        console.warn("Could not locate INITIAL_TOOLS declaration in tools.ts");
      }
    } catch (e) {
      console.error("Failed to read/parse tools.ts for sitemap:", e.message);
    }
  } else {
    console.warn("tools.ts file not found at:", toolsFilePath);
  }
  
  // Format sitemap XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>\n';
  
  // Save sitemap
  try {
    const parentDir = path.dirname(sitemapDestPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(sitemapDestPath, xml, 'utf8');
    console.log(`Successfully generated public/sitemap.xml containing ${urls.length} URLs.`);
  } catch (err) {
    console.error("Failed to write sitemap.xml:", err.message);
    process.exit(1);
  }
}

generateSitemap();
