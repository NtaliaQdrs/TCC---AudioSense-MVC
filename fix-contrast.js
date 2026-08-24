import fs from 'fs';

// Cada entrada: arquivo, texto exato a procurar, texto pra substituir
const fixes = [
  {
    file: 'public/stylesheets/biblioteca.css',
    find: '.btn-insert {\n  background-color: #2eb086;',
    replace: '.btn-insert {\n  background-color: #1f7c5f;'
  },
  {
    file: 'public/stylesheets/inserirTopico.css',
    find: '.btn-submit {\n        background-color: #60a5fa;',
    replace: '.btn-submit {\n        background-color: #1d5fc7;'
  },
  {
    file: 'public/stylesheets/inserirTopico.css',
    find: '.toolbar-btn:hover {\n        background: #60a5fa;\n        color: white;\n    }',
    replace: '.toolbar-btn:hover {\n        background: #1d5fc7;\n        color: white;\n    }'
  },
  {
    file: 'public/stylesheets/menu.css',
    find: '.menu-links a.active {\n    background-color: #5dade2;',
    replace: '.menu-links a.active {\n    background-color: #1d5fc7;'
  },
  {
    file: 'public/stylesheets/menu.css',
    find: '.sub-menu a.active { background-color: #5dade2; color: #ffffff; font-weight: bold; }',
    replace: '.sub-menu a.active { background-color: #1d5fc7; color: #ffffff; font-weight: bold; }'
  },
  {
    file: 'public/stylesheets/admin.css',
    find: '.btn-approve { background-color: #2eb086; border: none; color: white; }',
    replace: '.btn-approve { background-color: #1f7c5f; border: none; color: white; }'
  },
  {
    file: 'public/stylesheets/admin.css',
    find: '.btn-approve:hover { background-color: #047857; }',
    replace: '.btn-approve:hover { background-color: #155a45; }'
  },
  {
    file: 'public/stylesheets/topico.css',
    find: '.btn-submit-comentario {\n  align-self: flex-end;\n  background: #4a6cf7;\n  color: white;',
    replace: '.btn-submit-comentario {\n  align-self: flex-end;\n  background: #1d5fc7;\n  color: white;'
  },
  {
    file: 'public/stylesheets/topico.css',
    find: '.btn-responder {\n  background: none;\n  border: none;\n  color: #4a6cf7;',
    replace: '.btn-responder {\n  background: none;\n  border: none;\n  color: #1d5fc7;'
  },
  {
    file: 'public/stylesheets/painelAdmin2.css',
    find: '.btn-submitcust { background-color: #36a985; color: white; }',
    replace: '.btn-submitcust { background-color: #1f7c5f; color: white; }'
  },
  {
    file: 'public/stylesheets/painelAdmin2.css',
    find: '.btn-submitcust:hover { background-color: #2d8c6e; }',
    replace: '.btn-submitcust:hover { background-color: #155a45; }'
  }
];

let sucesso = 0;
let falhas = 0;

for (const fix of fixes) {
  if (!fs.existsSync(fix.file)) {
    console.log(`❌ Arquivo não encontrado: ${fix.file}`);
    falhas++;
    continue;
  }
  const content = fs.readFileSync(fix.file, 'utf-8');
  if (!content.includes(fix.find)) {
    console.log(`⚠️  Trecho não encontrado em ${fix.file} (já foi alterado, ou o texto não bate exatamente):\n   "${fix.find.slice(0, 50)}..."`);
    falhas++;
    continue;
  }
  const updated = content.replace(fix.find, fix.replace);
  fs.writeFileSync(fix.file, updated, 'utf-8');
  console.log(`✅ Corrigido: ${fix.file}`);
  sucesso++;
}

console.log(`\n${sucesso} correções aplicadas, ${falhas} não encontradas/já feitas.`);