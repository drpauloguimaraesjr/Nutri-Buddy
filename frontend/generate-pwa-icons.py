#!/usr/bin/env python3
import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ PIL/Pillow não está instalado")
    print("Execute: pip3 install Pillow")
    exit(1)

# Tamanhos necessários
sizes = [72, 96, 128, 144, 152, 192, 384, 512]
public_dir = Path(__file__).parent / 'public'

# Criar imagem base (512x512)
def create_icon(size):
    # Criar imagem com fundo verde (cor do NutriBuddy)
    img = Image.new('RGB', (size, size), color='#10b981')
    draw = ImageDraw.Draw(img)
    
    # Desenhar círculo central (rosto feliz)
    center = size // 2
    radius = int(size * 0.35)
    
    # Rosto branco
    draw.ellipse([center - radius, center - radius, 
                  center + radius, center + radius], 
                 fill='white', outline='white')
    
    # Olhos
    eye_offset_x = int(radius * 0.3)
    eye_offset_y = int(radius * 0.2)
    eye_size = int(radius * 0.15)
    
    # Olho esquerdo
    draw.ellipse([center - eye_offset_x - eye_size, center - eye_offset_y - eye_size,
                  center - eye_offset_x + eye_size, center - eye_offset_y + eye_size],
                 fill='#10b981')
    
    # Olho direito
    draw.ellipse([center + eye_offset_x - eye_size, center - eye_offset_y - eye_size,
                  center + eye_offset_x + eye_size, center - eye_offset_y + eye_size],
                 fill='#10b981')
    
    # Sorriso
    smile_y = center + int(radius * 0.2)
    smile_width = int(radius * 0.8)
    draw.arc([center - smile_width // 2, smile_y - smile_width // 4,
              center + smile_width // 2, smile_y + smile_width // 4],
             start=0, end=180, fill='#10b981', width=max(2, size // 60))
    
    return img

# Gerar todos os ícones
print("🎨 Gerando ícones PWA...")
for size in sizes:
    icon = create_icon(size)
    output_path = public_dir / f'icon-{size}x{size}.png'
    icon.save(output_path, 'PNG')
    print(f"✅ Criado: icon-{size}x{size}.png")

print("\n🎉 Todos os ícones PWA foram gerados com sucesso!")

