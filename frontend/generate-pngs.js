const sharp = require('sharp');
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
        .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Criado: icon-${size}x${size}.png`);
    }
    console.log('\n🎉 Todos os ícones PWA foram gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
  }
}

generatePNGs();
