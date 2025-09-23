#!/usr/bin/env node

/**
 * Script para atualizar versões e evitar problemas de cache
 * Execute: node update-version.js
 */

const fs = require('fs');
const path = require('path');

// Gerar timestamp único
const version = Date.now();
const versionString = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '.' + Math.floor(Date.now() / 1000);

console.log(`🚀 Atualizando para versão: ${version}`);

// Arquivos para atualizar
const filesToUpdate = [
  {
    file: 'index.html',
    replacements: [
      { from: /styles\.css\?v=\d+/g, to: `styles.css?v=${version}` },
      { from: /script\.js\?v=\d+/g, to: `script.js?v=${version}` },
      { from: /scenes\.js\?v=\d+/g, to: `scenes.js?v=${version}` }
    ]
  },
  {
    file: 'manifest.json',
    replacements: [
      { from: /"version":\s*"[^"]*"/g, to: `"version": "${versionString}"` },
      { from: /index\.html\?v=\d+/g, to: `index.html?v=${version}` }
    ]
  },
  {
    file: 'service-worker.js',
    replacements: [
      { from: /eletrize-cache-v[^']+/g, to: `eletrize-cache-v${versionString}` },
      { from: /\.html\?v=\d+/g, to: `.html?v=${version}` },
      { from: /\.css\?v=\d+/g, to: `.css?v=${version}` },
      { from: /\.js\?v=\d+/g, to: `.js?v=${version}` }
    ]
  }
];

// Aplicar atualizações
filesToUpdate.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Atualizado: ${file}`);
  } else {
    console.log(`➖ Sem mudanças: ${file}`);
  }
});

console.log(`🎉 Versioning concluído! Nova versão: ${version}`);
console.log('💡 Lembre-se de fazer git add, commit e push');