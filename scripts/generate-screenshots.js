const fs = require('fs');
const path = require('path');

// Generate placeholder screenshots for PWA
function generateScreenshot(width, height, title, isMobile = false) {
  const fontSize = Math.max(12, Math.min(width, height) / 20);
  const padding = Math.max(20, Math.min(width, height) / 20);
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="${width}" height="${height * 0.15}" fill="#0ea5e9"/>
  <text x="${width/2}" y="${height * 0.08}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="${fontSize * 1.5}" font-weight="bold">MindSpring</text>
  
  <!-- Content area -->
  <rect x="${padding}" y="${height * 0.2}" width="${width - padding * 2}" height="${height * 0.6}" fill="#ffffff" rx="8" stroke="#e2e8f0" stroke-width="2"/>
  
  <!-- Mock content -->
  <text x="${width/2}" y="${height * 0.35}" text-anchor="middle" fill="#374151" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">${title}</text>
  
  <!-- Mock cards -->
  <rect x="${padding * 2}" y="${height * 0.45}" width="${(width - padding * 4) / 2 - 10}" height="${height * 0.25}" fill="#f0f9ff" rx="6" stroke="#0ea5e9" stroke-width="1"/>
  <text x="${padding * 2 + (width - padding * 4) / 4 - 5}" y="${height * 0.52}" text-anchor="middle" fill="#0ea5e9" font-family="Arial, sans-serif" font-size="${fontSize * 0.8}" font-weight="bold">Study Sessions</text>
  
  <rect x="${width/2 + 10}" y="${height * 0.45}" width="${(width - padding * 4) / 2 - 10}" height="${height * 0.25}" fill="#fefce8" rx="6" stroke="#facc15" stroke-width="1"/>
  <text x="${width/2 + (width - padding * 4) / 4 + 5}" y="${height * 0.52}" text-anchor="middle" fill="#facc15" font-family="Arial, sans-serif" font-size="${fontSize * 0.8}" font-weight="bold">Find Partners</text>
  
  <!-- Footer -->
  <text x="${width/2}" y="${height * 0.9}" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="${fontSize * 0.7}">Connect • Learn • Succeed</text>
  
  <!-- Mobile indicator -->
  ${isMobile ? `<circle cx="${width - 20}" cy="20" r="8" fill="#22c55e"/>` : ''}
</svg>`;
}

// Screenshot configurations
const screenshots = [
  { width: 1280, height: 720, title: 'MindSpring Dashboard', filename: 'desktop-1.svg' },
  { width: 390, height: 844, title: 'Mobile Dashboard', filename: 'mobile-1.svg', isMobile: true }
];

// Generate screenshots
screenshots.forEach(({ width, height, title, filename, isMobile }) => {
  const svg = generateScreenshot(width, height, title, isMobile);
  const screenshotPath = path.join(__dirname, '..', 'public', 'screenshots', filename);
  fs.writeFileSync(screenshotPath, svg);
  
  console.log(`Generated screenshot: ${filename} (${width}x${height})`);
});

console.log('\n✅ PWA screenshots generated successfully!');
console.log('📝 Note: These are SVG files. For production, convert them to PNG using a tool like ImageMagick or an online converter.');
