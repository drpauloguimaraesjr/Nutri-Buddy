const fs = require('fs');
const path = require('path');

// SVG do ícone NutriBuddy
const iconSVG = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#10b981"/>
  <path d="M256 128C194.144 128 144 178.144 144 240C144 301.856 194.144 352 256 352C317.856 352 368 301.856 368 240C368 178.144 317.856 128 256 128Z" fill="white"/>
  <circle cx="226" cy="220" r="16" fill="#10b981"/>
  <circle cx="286" cy="220" r="16" fill="#10b981"/>
  <path d="M226 270C226 270 240 290 256 290C272 290 286 270 286 270" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
  <path d="M180 160C170 140 185 120 205 115" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <path d="M332 160C342 140 327 120 307 115" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <circle cx="256" cy="390" r="20" fill="#10b981"/>
  <rect x="246" y="352" width="20" height="50" rx="10" fill="#10b981"/>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, 'public');

// Salvar o SVG principal
fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSVG);

console.log('✅ Ícone SVG criado: icon.svg');
console.log('\n📝 Para gerar os PNGs, instale sharp e execute:');
console.log('npm install --save-dev sharp');
console.log('node generate-pngs.js');

// Criar script para converter SVG em PNG usando sharp
const pngScript = `const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, 'public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generatePNGs() {
  try {
    for (const size of sizes) {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, \`icon-\${size}x\${size}.png\`));
      
      console.log(\`✅ Criado: icon-\${size}x\${size}.png\`);
    }
    console.log('\\n🎉 Todos os ícones PWA foram gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
  }
}

generatePNGs();
`;

fs.writeFileSync(path.join(__dirname, 'generate-pngs.js'), pngScript);
console.log('✅ Script gerador de PNGs criado: generate-pngs.js');

