#!/usr/bin/env node

const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const path = require('path');
const fs = require('fs');

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  // Optimize PNG to WebP (workflows)
  try {
    console.log('📦 Converting PNG workflows to WebP...');
    const files = await imagemin(['hugo/static/img/workflows/*.png'], {
      destination: 'hugo/static/img/workflows',
      plugins: [
        imageminWebp({ quality: 80 })
      ]
    });

    files.forEach(file => {
      const inputSize = fs.statSync(file.replace('.webp', '.png')).size / 1024;
      const outputSize = fs.statSync(file).size / 1024;
      const saved = ((1 - outputSize / inputSize) * 100).toFixed(1);
      console.log(`  ✅ ${path.basename(file)}: ${inputSize.toFixed(1)}KB → ${outputSize.toFixed(1)}KB (↓${saved}%)`);
    });
  } catch (error) {
    console.error('❌ PNG optimization failed:', error.message);
  }

  // Optimize JPG (blog images)
  try {
    console.log('\n🎨 Optimizing JPEG blog images...');
    const files = await imagemin(['hugo/static/images/blog/*.jpg'], {
      destination: 'hugo/static/images/blog',
      plugins: [
        imageminMozjpeg({ quality: 75 })
      ]
    });

    files.forEach(file => {
      const size = fs.statSync(file).size / 1024;
      console.log(`  ✅ ${path.basename(file)}: ${size.toFixed(1)}KB`);
    });
  } catch (error) {
    console.error('❌ JPEG optimization failed:', error.message);
  }

  console.log('\n✅ Image optimization complete!\n');

  // Print summary
  const pngSize = fs.readdirSync('hugo/static/img/workflows')
    .filter(f => f.endsWith('.png'))
    .reduce((sum, f) => sum + fs.statSync(`hugo/static/img/workflows/${f}`).size, 0) / 1024;

  const webpSize = fs.readdirSync('hugo/static/img/workflows')
    .filter(f => f.endsWith('.webp'))
    .reduce((sum, f) => sum + fs.statSync(`hugo/static/img/workflows/${f}`).size, 0) / 1024;

  console.log('📊 Summary:');
  console.log(`  PNG total:  ${pngSize.toFixed(1)}KB`);
  console.log(`  WebP total: ${webpSize.toFixed(1)}KB`);
  console.log(`  Total saved: ${(pngSize - webpSize).toFixed(1)}KB (${((1 - webpSize / pngSize) * 100).toFixed(1)}%)\n`);
}

optimizeImages().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
