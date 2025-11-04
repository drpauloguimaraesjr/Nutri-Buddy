# 📱 Configurar PWA - NutriBuddy

## ✅ O que foi feito

### 1. Arquivos Criados
- ✅ `/frontend/public/manifest.json` - Manifest do PWA
- ✅ `/frontend/public/sw.js` - Service Worker
- ✅ `/frontend/public/offline.html` - Página offline
- ✅ Atualizado `app/layout.tsx` - Registrar Service Worker e metadados

### 2. Funcionalidades PWA Implementadas
- ✅ **Instalável** - Pode ser instalado no dispositivo
- ✅ **Offline** - Funciona sem internet (cache)
- ✅ **Service Worker** - Cache de assets e páginas
- ✅ **Atalhos** - Ações rápidas (Dashboard, Refeições, Chat, Jejum)
- ✅ **Push Notifications** - Suporte para notificações (backend necessário)
- ✅ **Background Sync** - Sincronização em segundo plano

---

## 🎨 Gerar Ícones PWA

### Opção 1: Gerar Online (Recomendado)

1. Acesse: https://realfavicongenerator.net/
2. Faça upload de um logo quadrado (512x512px ou maior)
3. Configure as opções:
   - iOS: Fundo sólido
   - Android: Adaptive icons
   - Cor do tema: `#10b981` (emerald-600)
4. Baixe o pacote ZIP
5. Extraia para `/frontend/public/`

### Opção 2: Gerar com ImageMagick

```bash
cd frontend/public

# Crie um logo base (ou use um existente)
# Exemplo: logo.png (512x512px)

# Gerar todos os tamanhos
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png

# Favicon
convert logo.png -resize 32x32 favicon.ico
```

### Opção 3: Ícones Temporários (Mock)

Se você não tem um logo ainda, crie ícones placeholder:

```bash
cd frontend/public

# Criar um script simples para gerar ícones coloridos
# Salve como generate-icons.html e abra no navegador
```

```html
<!DOCTYPE html>
<html>
<head>
  <title>Generate Icons</title>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    sizes.forEach(size => {
      canvas.width = size;
      canvas.height = size;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#059669');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Text
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NB', size / 2, size / 2);

      // Download
      const link = document.createElement('a');
      link.download = `icon-${size}x${size}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });

    alert('Icons generated! Check your downloads folder.');
  </script>
</body>
</html>
```

---

## 🧪 Testar PWA

### 1. Desenvolvimento Local

```bash
cd frontend
npm run build
npm run start
```

Acesse: http://localhost:3000

### 2. Chrome DevTools

1. Abra DevTools (F12)
2. Vá em **Application** > **Manifest**
3. Verifique:
   - ✅ Manifest carregado corretamente
   - ✅ Ícones exibidos
   - ✅ Instalável

4. Vá em **Application** > **Service Workers**
5. Verifique:
   - ✅ Service Worker registrado
   - ✅ Status: Activated

6. Teste offline:
   - Em **Application** > **Service Workers**
   - Marque **Offline**
   - Recarregue a página
   - ✅ Deve funcionar offline

### 3. Lighthouse Audit

1. DevTools > **Lighthouse**
2. Selecione:
   - ✅ Progressive Web App
   - ✅ Performance
   - ✅ Best Practices
3. Clique em **Analyze page load**
4. Verifique pontuação PWA (deve ser ≥ 90)

---

## 📲 Instalar no Dispositivo

### Desktop (Chrome/Edge)

1. Abra o app no navegador
2. Clique no ícone **⊕** na barra de endereços
3. Clique em **"Instalar NutriBuddy"**
4. O app será adicionado à área de trabalho

### Mobile (Android)

1. Abra no Chrome
2. Menu (⋮) > **"Adicionar à tela inicial"**
3. Confirme
4. Ícone aparece na tela inicial

### Mobile (iOS/Safari)

1. Abra no Safari
2. Toque em **Compartilhar** (⬆️)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Confirme

---

## 🔔 Notificações Push (Opcional)

### Configurar Backend

```javascript
// backend/routes/notifications.js
const webpush = require('web-push');

// Gerar VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

// Configurar
webpush.setVapidDetails(
  'mailto:seu@email.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Enviar notificação
router.post('/send', async (req, res) => {
  const { subscription, payload } = req.body;
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend - Solicitar Permissão

```typescript
// Adicionar em app/layout.tsx ou componente específico
async function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
      });
      
      // Enviar subscription para o backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    }
  }
}
```

---

## ✅ Checklist de Produção

Antes de fazer deploy em produção:

- [ ] Ícones gerados em todos os tamanhos
- [ ] `manifest.json` com informações corretas
- [ ] Service Worker registrado e funcionando
- [ ] Testado offline
- [ ] Lighthouse PWA score ≥ 90
- [ ] HTTPS habilitado (obrigatório para PWA)
- [ ] Testado em dispositivos reais:
  - [ ] Android (Chrome)
  - [ ] iOS (Safari)
  - [ ] Desktop (Chrome/Edge)
- [ ] Ícones de splash screen (iOS)
- [ ] Meta tags Apple Web App

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Ou conecte via GitHub para deploy automático
```

### Netlify

```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### HTTPS Obrigatório

PWA só funciona com HTTPS (ou localhost). Certifique-se de:
- ✅ Usar domínio com SSL (Let's Encrypt, Cloudflare)
- ✅ Forçar HTTPS no servidor

---

## 📊 Métricas PWA

Após deploy, monitore:

1. **Taxa de Instalação**
   - Quantos usuários instalaram o app

2. **Uso Offline**
   - Quantas vezes o app foi usado offline

3. **Retenção**
   - Usuários que voltam após instalar

4. **Performance**
   - Lighthouse score
   - Core Web Vitals

---

## 🐛 Troubleshooting

### Service Worker não registra

```javascript
// Verificar suporte
if ('serviceWorker' in navigator) {
  console.log('Service Worker: Supported');
} else {
  console.log('Service Worker: NOT supported');
}
```

### Ícones não aparecem

- Verifique se os arquivos existem em `/public/`
- Tamanhos corretos no `manifest.json`
- Limpe cache do navegador

### "Add to Home Screen" não aparece

- Verifique HTTPS
- Manifest válido
- Service Worker registrado
- Ícones 192x192 e 512x512 obrigatórios

### Offline não funciona

- Service Worker ativo?
- URLs corretas no cache?
- Verifique DevTools > Application > Cache Storage

---

## 🎉 Resultado Final

Após configurar tudo, seu NutriBuddy será:

✅ **Instalável** - Como um app nativo  
✅ **Rápido** - Cache local  
✅ **Offline** - Funciona sem internet  
✅ **Engajante** - Notificações push  
✅ **Responsivo** - Mobile-first  

---

**PWA está PRONTO!** 🚀  
Agora é só gerar os ícones e testar!

