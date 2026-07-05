import fs from 'fs';
import path from 'path';

const componentsDir = path.resolve(process.cwd(), 'src/components');

function fixContrastInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Replace inline style color: 'white' with var(--text-primary)
  if (content.includes("color: 'white'")) {
    content = content.replaceAll("color: 'white'", "color: 'var(--text-primary)'");
    updated = true;
  }
  
  if (content.includes('color: "white"')) {
    content = content.replaceAll('color: "white"', 'color: "var(--text-primary)"');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated contrast colors in: ${path.basename(filePath)}`);
  }
}

// Read all files in src/components/
fs.readdirSync(componentsDir).forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    fixContrastInFile(path.join(componentsDir, file));
  }
});

// Also fix App.tsx
fixContrastInFile(path.resolve(process.cwd(), 'src/App.tsx'));
