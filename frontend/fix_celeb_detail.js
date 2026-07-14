const fs = require('fs');

const path = 'src/old_pages/CelebDetail.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `const id = params.param || params['*'];`;
const replacement = `const rawId = params?.id || params?.param || params?.['*'];\n    const id = Array.isArray(rawId) ? rawId[rawId.length - 1] : rawId;`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed CelebDetail params successfully!');
