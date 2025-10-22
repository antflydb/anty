const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Pastel AI-themed color palette - soft, glowing, ethereal
const colors = {
  bg: '#0A0E1A',        // Very deep blue-black
  pastel1: '#C4B5FD',   // Soft lavender
  pastel2: '#A5F3FC',   // Soft cyan
  pastel3: '#FCA5A5',   // Soft coral
  pastel4: '#FDE68A',   // Soft yellow
  pastel5: '#BBF7D0',   // Soft green
};

// Theme: Pastel Starfield - simple, ethereal background
function generateStarfield(name, seed) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark gradient background
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  bgGradient.addColorStop(0, '#0E1525');
  bgGradient.addColorStop(1, colors.bg);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Seeded random for consistent results
  let random = seed;
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };

  // Configuration per image - different color combinations and densities
  const configs = {
    'vector-search': {
      particleCount: 300,
      colors: [colors.pastel1, colors.pastel2],
      density: 'medium'
    },
    'vector-search-simple': {
      particleCount: 200,
      colors: [colors.pastel2, colors.pastel5],
      density: 'sparse'
    },
    'introducing-searchaf': {
      particleCount: 400,
      colors: [colors.pastel1, colors.pastel2, colors.pastel4],
      density: 'dense'
    },
    'semantic-search': {
      particleCount: 350,
      colors: [colors.pastel2, colors.pastel3],
      density: 'medium'
    },
    'getting-started': {
      particleCount: 150,
      colors: [colors.pastel4, colors.pastel5],
      density: 'sparse'
    },
    'shopify-integration': {
      particleCount: 250,
      colors: [colors.pastel3, colors.pastel1],
      density: 'medium'
    },
  };

  const config = configs[name] || configs['vector-search'];

  // Add ambient particles - starfield effect
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < config.particleCount; i++) {
    const px = seededRandom() * width;
    const py = seededRandom() * height;
    const pcolor = config.colors[Math.floor(seededRandom() * config.colors.length)];
    const pradius = 0.5 + seededRandom() * 2.5;
    const brightness = 0.3 + seededRandom() * 0.7; // Vary brightness

    // Create glowing particle
    const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, pradius * 4);
    const alpha = Math.floor(brightness * 136).toString(16).padStart(2, '0'); // Max 88 in hex
    particleGlow.addColorStop(0, pcolor + alpha);
    particleGlow.addColorStop(0.5, pcolor + '22');
    particleGlow.addColorStop(1, pcolor + '00');

    ctx.fillStyle = particleGlow;
    ctx.beginPath();
    ctx.arc(px, py, pradius * 4, 0, Math.PI * 2);
    ctx.fill();

    // Add bright core for some particles
    if (seededRandom() > 0.7) {
      ctx.fillStyle = '#FFFFFF' + Math.floor(brightness * 100).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(px, py, pradius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add subtle color washes
  const washCount = 2 + Math.floor(seededRandom() * 2);
  for (let i = 0; i < washCount; i++) {
    const wx = width * (0.2 + seededRandom() * 0.6);
    const wy = height * (0.2 + seededRandom() * 0.6);
    const wradius = 200 + seededRandom() * 300;
    const wcolor = config.colors[Math.floor(seededRandom() * config.colors.length)];

    const wash = ctx.createRadialGradient(wx, wy, 0, wx, wy, wradius);
    wash.addColorStop(0, wcolor + '08');
    wash.addColorStop(1, wcolor + '00');

    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas;
}

// Image configurations
const images = {
  blog: [
    { name: 'vector-search', seed: 12345 },
    { name: 'vector-search-simple', seed: 67890 },
    { name: 'introducing-searchaf', seed: 24680 },
  ],
  guides: [
    { name: 'semantic-search', seed: 13579 },
    { name: 'getting-started', seed: 97531 },
    { name: 'shopify-integration', seed: 86420 },
  ]
};

// Create output directories
const blogDir = path.join(__dirname, '..', 'public', 'blog-images');
const guidesDir = path.join(__dirname, '..', 'public', 'guide-images');

[blogDir, guidesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate blog images
console.log('Generating blog images...');
images.blog.forEach(({ name, seed }) => {
  console.log(`  Generating ${name}.png...`);
  const canvas = generateStarfield(name, seed);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(blogDir, `${name}.png`), buffer);
  console.log(`  ✓ Created ${name}.png`);
});

// Generate guide images
console.log('\nGenerating guide images...');
images.guides.forEach(({ name, seed }) => {
  console.log(`  Generating ${name}.png...`);
  const canvas = generateStarfield(name, seed);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(guidesDir, `${name}.png`), buffer);
  console.log(`  ✓ Created ${name}.png`);
});

console.log('\n✨ All images generated successfully!');
