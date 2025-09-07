const fs = require('fs');
const path = require('path');

// Simple SVG icon generator for Clerva
function generateClervaIcon(size) {
  const strokeWidth = Math.max(1, size / 24);
  const fontSize = Math.max(8, size / 3);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth}" fill="url(#grad1)" stroke="#ffffff" stroke-width="${strokeWidth}"/>
  
  <!-- Book icon -->
  <rect x="${size * 0.25}" y="${size * 0.3}" width="${size * 0.5}" height="${size * 0.4}" rx="2" fill="#ffffff" opacity="0.9"/>
  <line x1="${size * 0.35}" y1="${size * 0.4}" x2="${size * 0.65}" y2="${size * 0.4}" stroke="#0ea5e9" stroke-width="${strokeWidth * 2}"/>
  <line x1="${size * 0.35}" y1="${size * 0.5}" x2="${size * 0.65}" y2="${size * 0.5}" stroke="#0ea5e9" stroke-width="${strokeWidth}"/>
  <line x1="${size * 0.35}" y1="${size * 0.6}" x2="${size * 0.65}" y2="${size * 0.6}" stroke="#0ea5e9" stroke-width="${strokeWidth}"/>
  
  <!-- People icon -->
  <circle cx="${size * 0.3}" cy="${size * 0.75}" r="${size * 0.08}" fill="#facc15"/>
  <circle cx="${size * 0.7}" cy="${size * 0.75}" r="${size * 0.08}" fill="#facc15"/>
</svg>`;
}

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate icons
iconSizes.forEach(size => {
  const svg = generateClervaIcon(size);
  const iconPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
  
  // For now, we'll create SVG files since we don't have a PNG converter
  const svgPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  
  console.log(`Generated icon: icon-${size}x${size}.svg`);
});

// Generate shortcut icons
const shortcutIcons = [
  { name: 'study', color: '#0ea5e9' },
  { name: 'partner', color: '#facc15' },
  { name: 'calendar', color: '#22c55e' }
];

shortcutIcons.forEach(({ name, color }) => {
  const size = 96;
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="#ffffff" stroke-width="2"/>
  <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${name.charAt(0).toUpperCase()}</text>
</svg>`;
  
  const svgPath = path.join(__dirname, '..', 'public', 'icons', `${name}-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  
  console.log(`Generated shortcut icon: ${name}-${size}x${size}.svg`);
});

console.log('\n✅ PWA icons generated successfully!');
console.log('📝 Note: These are SVG files. For production, convert them to PNG using a tool like ImageMagick or an online converter.');
