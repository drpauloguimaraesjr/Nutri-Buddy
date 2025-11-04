#!/usr/bin/env node
/**
 * Diagnóstico Completo do Frontend NutriBuddy
 * Este script analisa todos os aspectos do frontend para identificar problemas
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const issues = {
  critical: [],
  warnings: [],
  info: [],
  suggestions: []
};

console.log('🔍 DIAGNÓSTICO COMPLETO DO FRONTEND\n');
console.log('='.repeat(60));

// 1. Verificar estrutura de arquivos essenciais
console.log('\n📁 1. Verificando estrutura de arquivos...');
const essentialFiles = [
  'package.json',
  'next.config.mjs',
  'tsconfig.json',
  'tailwind.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  'public/manifest.json',
  'public/sw.js',
  '.env.local'
];

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    issues.info.push(`✅ ${file} existe`);
  } else {
    issues.critical.push(`❌ ${file} NÃO encontrado`);
  }
});

// 2. Verificar dependências
console.log('\n📦 2. Verificando dependências...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    '@tanstack/react-query',
    'firebase',
    'framer-motion'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      issues.info.push(`✅ ${dep} instalado`);
    } else {
      issues.critical.push(`❌ ${dep} NÃO encontrado nas dependências`);
    }
  });
} catch (error) {
  issues.critical.push(`❌ Erro ao ler package.json: ${error.message}`);
}

// 3. Verificar configurações
console.log('\n⚙️  3. Verificando configurações...');

// Verificar .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      const value = envContent.match(new RegExp(`${varName}=(.+)`));
      if (value && value[1] && !value[1].includes('COLE_')) {
        issues.info.push(`✅ ${varName} configurado`);
      } else {
        issues.warnings.push(`⚠️  ${varName} está com placeholder`);
      }
    } else {
      issues.critical.push(`❌ ${varName} não encontrado no .env.local`);
    }
  });
} else {
  issues.critical.push(`❌ .env.local não encontrado`);
}

// 4. Verificar Service Worker
console.log('\n🔧 4. Verificando Service Worker...');
const swPath = path.join(__dirname, 'public/sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  // Verificar se filtra chrome-extension
  if (swContent.includes('chrome-extension')) {
    if (swContent.includes('startsWith(\'chrome-extension://\')')) {
      issues.info.push('✅ Service Worker filtra chrome-extension corretamente');
    } else {
      issues.warnings.push('⚠️  Service Worker menciona chrome-extension mas pode não filtrar corretamente');
    }
  }
  
  // Verificar se tem tratamento de erro
  if (swContent.includes('try') && swContent.includes('catch')) {
    issues.info.push('✅ Service Worker tem tratamento de erros');
  } else {
    issues.warnings.push('⚠️  Service Worker pode não ter tratamento de erros adequado');
  }
} else {
  issues.critical.push('❌ Service Worker não encontrado');
}

// 5. Verificar páginas principais
console.log('\n📄 5. Verificando páginas principais...');
const pages = [
  'app/login/page.tsx',
  'app/register/page.tsx',
  'app/dashboard/page.tsx'
];

pages.forEach(page => {
  const pagePath = path.join(__dirname, page);
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Verificar se usa 'use client' quando necessário
    if (content.includes('useRouter') || content.includes('useState') || content.includes('useEffect')) {
      if (content.includes("'use client'")) {
        issues.info.push(`✅ ${page} tem 'use client'`);
      } else {
        issues.warnings.push(`⚠️  ${page} usa hooks mas não tem 'use client'`);
      }
    }
    
    // Verificar autocomplete em campos de senha
    if (page.includes('login') || page.includes('register')) {
      if (content.includes('autoComplete=') || content.includes('autoComplete=')) {
        issues.info.push(`✅ ${page} tem atributos autocomplete`);
      } else {
        issues.warnings.push(`⚠️  ${page} pode não ter atributos autocomplete`);
      }
    }
  } else {
    issues.warnings.push(`⚠️  ${page} não encontrado`);
  }
});

// 6. Verificar manifest.json
console.log('\n📱 6. Verificando PWA Manifest...');
const manifestPath = path.join(__dirname, 'public/manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (manifest.icons && manifest.icons.length > 0) {
      const firstIcon = manifest.icons[0];
      const iconPath = path.join(__dirname, 'public', firstIcon.src);
      if (fs.existsSync(iconPath)) {
        issues.info.push(`✅ Ícone do manifest existe: ${firstIcon.src}`);
      } else {
        issues.critical.push(`❌ Ícone do manifest não encontrado: ${firstIcon.src}`);
      }
    }
  } catch (error) {
    issues.critical.push(`❌ Erro ao parsear manifest.json: ${error.message}`);
  }
}

// 7. Verificar problemas comuns do Next.js
console.log('\n⚛️  7. Verificando problemas comuns do Next.js...');

// Verificar se page.tsx usa redirect corretamente
const homePagePath = path.join(__dirname, 'app/page.tsx');
if (fs.existsSync(homePagePath)) {
  const content = fs.readFileSync(homePagePath, 'utf8');
  if (content.includes('redirect(') && !content.includes("'use client'")) {
    issues.info.push('✅ page.tsx usa redirect server-side corretamente');
  } else if (content.includes('useRouter') && content.includes('useEffect')) {
    issues.warnings.push('⚠️  page.tsx usa router.push no useEffect (pode causar problemas de hidratação)');
  }
}

// 8. Verificar TypeScript
console.log('\n📝 8. Verificando TypeScript...');
try {
  execSync('npx tsc --noEmit --pretty false 2>&1', {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  issues.info.push('✅ TypeScript sem erros de tipo');
} catch (error) {
  const tsErrors = error.stdout || error.stderr || '';
  if (tsErrors) {
    const errorCount = (tsErrors.match(/error TS/g) || []).length;
    if (errorCount > 0) {
      issues.critical.push(`❌ ${errorCount} erro(s) de TypeScript encontrado(s)`);
      issues.suggestions.push('Execute: npx tsc --noEmit para ver detalhes');
    }
  }
}

// 9. Verificar node_modules
console.log('\n📚 9. Verificando node_modules...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  const nodeModulesSize = fs.readdirSync(nodeModulesPath).length;
  if (nodeModulesSize > 100) {
    issues.info.push(`✅ node_modules existe com ${nodeModulesSize} pacotes`);
  } else {
    issues.warnings.push(`⚠️  node_modules parece incompleto (apenas ${nodeModulesSize} pacotes)`);
  }
} else {
  issues.critical.push('❌ node_modules não encontrado - execute: npm install');
}

// 10. Verificar .next build
console.log('\n🏗️  10. Verificando build...');
const nextPath = path.join(__dirname, '.next');
if (fs.existsSync(nextPath)) {
  issues.info.push('✅ .next existe (build disponível)');
  issues.suggestions.push('Para rebuild limpo: rm -rf .next && npm run dev');
} else {
  issues.warnings.push('⚠️  .next não existe (precisa fazer build)');
}

// Relatório Final
console.log('\n' + '='.repeat(60));
console.log('\n📊 RELATÓRIO DE DIAGNÓSTICO\n');

if (issues.critical.length > 0) {
  console.log('🔴 PROBLEMAS CRÍTICOS:');
  issues.critical.forEach(issue => console.log(`  ${issue}`));
  console.log('');
}

if (issues.warnings.length > 0) {
  console.log('🟡 AVISOS:');
  issues.warnings.forEach(issue => console.log(`  ${issue}`));
  console.log('');
}

if (issues.info.length > 0) {
  console.log('🟢 INFORMAÇÕES:');
  issues.info.slice(0, 10).forEach(issue => console.log(`  ${issue}`));
  if (issues.info.length > 10) {
    console.log(`  ... e mais ${issues.info.length - 10} verificações OK`);
  }
  console.log('');
}

if (issues.suggestions.length > 0) {
  console.log('💡 SUGESTÕES:');
  issues.suggestions.forEach(suggestion => console.log(`  ${suggestion}`));
  console.log('');
}

// Resumo
const totalIssues = issues.critical.length + issues.warnings.length;
console.log('='.repeat(60));
console.log(`\n📈 RESUMO:`);
console.log(`  ✅ Verificações OK: ${issues.info.length}`);
console.log(`  ⚠️  Avisos: ${issues.warnings.length}`);
console.log(`  ❌ Problemas Críticos: ${issues.critical.length}`);
console.log(`  💡 Sugestões: ${issues.suggestions.length}`);

if (totalIssues === 0) {
  console.log('\n🎉 Frontend parece estar em bom estado!');
  process.exit(0);
} else {
  console.log(`\n⚠️  Encontrados ${totalIssues} problema(s) que precisam de atenção.`);
  process.exit(issues.critical.length > 0 ? 1 : 0);
}

