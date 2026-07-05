const fs = require('fs');
const path = require('path');
const http = require('https');

// Load env variables if .env file exists
const dotenvPath = path.resolve(__dirname, '../.env');
let envKey = '';
if (fs.existsSync(dotenvPath)) {
  const envContent = fs.readFileSync(dotenvPath, 'utf8');
  const match = envContent.match(/INDEXNOW_KEY=(.*)/);
  if (match && match[1]) {
    envKey = match[1].trim();
  }
}

// Fallback search: look for a key txt file in the public folder (e.g. public/f91fde3c4fc74715b6079c12d2fb01df.txt)
if (!envKey) {
  const publicDir = path.resolve(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    const keyFile = files.find(file => file.match(/^[a-f0-9]{8,128}\.txt$/i));
    if (keyFile) {
      envKey = keyFile.replace('.txt', '');
      console.log(`Found IndexNow key file in public folder: ${keyFile} (Key: ${envKey})`);
    }
  }
}

// Configuration
const HOST = 'findai.store';
const KEY = envKey || 'YOUR_INDEXNOW_KEY_HERE'; // Replace if not using .env or public key file
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');

if (KEY === 'YOUR_INDEXNOW_KEY_HERE') {
  console.error('Error: Please configure your IndexNow Key. You can either:');
  console.error('1. Add INDEXNOW_KEY=your_key to your .env file.');
  console.error('2. Download the verification .txt file from Bing and place it in the public/ folder.');
  console.error('3. Edit KEY in scripts/submit_indexnow.js directly.');
  process.exit(1);
}

// Parse URLs from sitemap
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error(`Sitemap not found at ${SITEMAP_PATH}. Please run "npm run build" first to generate it.`);
  process.exit(1);
}

console.log('Reading sitemap.xml...');
const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
const urlRegex = /<loc>(https:\/\/findai\.store\/[^<]+)<\/loc>/g;
const urls = [];
let match;
while ((match = urlRegex.exec(sitemapContent)) !== null) {
  urls.push(match[1]);
}

if (urls.length === 0) {
  console.error('No URLs found in sitemap.xml.');
  process.exit(1);
}

console.log(`Found ${urls.length} URLs in sitemap.`);
console.log(`Submitting to IndexNow...`);

const requestData = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls.slice(0, 10000) // IndexNow accepts up to 10,000 URLs per request
});

const options = {
  hostname: 'api.indexnow.org',
  path: '/IndexNow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('Successfully submitted sitemap URLs to IndexNow! Search engines have queued them for indexing.');
    } else {
      console.error(`Failed to submit. Response: ${responseBody || 'None'}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request Error: ${e.message}`);
});

req.write(requestData);
req.end();
