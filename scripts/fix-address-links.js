const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MAPS_URL = 'https://maps.google.com/maps?q=-22.7301816,-47.30249';

const GENERIC_OLD = '<div class="contact-item"><i data-lucide="map-pin" aria-hidden="true"></i><span>Americana, SP · Região Metropolitana de Campinas</span></div>';
const GENERIC_NEW = `<div class="contact-item"><i data-lucide="map-pin" aria-hidden="true"></i><a href="${MAPS_URL}" target="_blank" rel="noopener">Rua São Gabriel, 1623 — Americana, SP</a></div>`;

const FULL_OLD = '<span>Rua São Gabriel, 1623 — Vila Belvedere<br>Americana · SP</span>';
const FULL_NEW = `<a href="${MAPS_URL}" target="_blank" rel="noopener">Rua São Gabriel, 1623 — Vila Belvedere<br>Americana · SP</a>`;

let genericCount = 0;
let fullCount = 0;
let filesChanged = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;

      if (content.includes(GENERIC_OLD)) {
        const n = content.split(GENERIC_OLD).length - 1;
        content = content.split(GENERIC_OLD).join(GENERIC_NEW);
        genericCount += n;
        changed = true;
      }
      if (content.includes(FULL_OLD)) {
        const n = content.split(FULL_OLD).length - 1;
        content = content.split(FULL_OLD).join(FULL_NEW);
        fullCount += n;
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        filesChanged++;
      }
    }
  }
}

walk(ROOT);

console.log(`Arquivos alterados: ${filesChanged}`);
console.log(`Ocorrências genéricas substituídas: ${genericCount}`);
console.log(`Ocorrências de endereço completo substituídas: ${fullCount}`);
