const fs = require('fs');
let content = fs.readFileSync('src/app/admin/materials/page.tsx', 'utf8');
content = content.replace(/\\/g, '').replace(/\\\$/g, '$');
fs.writeFileSync('src/app/admin/materials/page.tsx', content, 'utf8');
console.log('Fixed escaped characters in materials page');
