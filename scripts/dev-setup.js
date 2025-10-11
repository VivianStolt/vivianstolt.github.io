#!/usr/bin/env node

// Development setup script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Vivian Portfolio development environment...\n');

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Make sure you are in the project root directory.');
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Dependencies not installed. Please run: npm install');
  console.log('   Then run this script again.\n');
  process.exit(1);
}

// Check required directories
const requiredDirs = [
  'src/components',
  'src/assets/icons',
  'src/styles',
  'public'
];

console.log('📁 Checking project structure...');
for (const dir of requiredDirs) {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   ✅ ${dir}`);
  } else {
    console.log(`   ❌ ${dir} - Missing!`);
  }
}

// Check required files
const requiredFiles = [
  'src/App.jsx',
  'src/main.jsx',
  'src/components/Button.jsx',
  'src/components/Carousel.jsx',
  'src/components/ContactForm.jsx',
  'src/components/Icon.jsx',
  'src/services/api.js',
  'src/hooks/useVanillaTilt.js',
  'vite.config.js'
];

console.log('\n📄 Checking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing!`);
  }
}

console.log('\n🎯 Available npm scripts:');
console.log('   npm run dev           - Start frontend development server');
console.log('   npm run build         - Build for production');
console.log('   npm run preview       - Preview production build');

console.log('\n🌟 Quick start:');
console.log('   1. npm install         (if not done already)');
console.log('   2. npm run dev         (starts frontend development server)');
console.log('   3. Open http://localhost:3000 in your browser');

console.log('\n💡 Development tips:');
console.log('   - Frontend runs on http://localhost:3000');
console.log('   - Use the provided scraper.py to generate `posts/` HTML files locally');
console.log('   - SVG icons are in src/assets/icons/');
console.log('   - Components are in src/components/');
console.log('   - Original files are backed up in original-backup/');

console.log('\n✨ Happy coding! ✨');