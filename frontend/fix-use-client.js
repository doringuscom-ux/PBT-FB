const fs = require('fs');
const path = require('path');

function fixUseClient(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixUseClient(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('"use client"') || content.includes("'use client'")) {
                content = content.replace(/"use client";/g, '');
                content = content.replace(/'use client';/g, '');
                content = content.replace(/"use client"/g, '');
                content = content.replace(/'use client'/g, '');
                content = '"use client";\n' + content.trimStart();
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    });
}

fixUseClient('./src');
