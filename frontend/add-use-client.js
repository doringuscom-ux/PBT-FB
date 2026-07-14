const fs = require('fs');
const path = require('path');

function addUseClient(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            addUseClient(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Check if it already has "use client"
            if (!content.includes('"use client"')) {
                content = '"use client";\n' + content;
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Added use client to:', fullPath);
            }
        }
    });
}

addUseClient('./src/old_pages');
addUseClient('./src/components');
