const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function migrateNextJs(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Convert <Link to="..."> to <Link href="...">
    if (content.includes('to=')) {
        content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
        changed = true;
    }

    // 2. Add "use client" if it uses hooks
    if ((content.includes('useState') || content.includes('useEffect') || content.includes('useRouter') || content.includes('usePathname') || content.includes('useParams')) && !content.includes('"use client"')) {
        content = '"use client";\n\n' + content;
        changed = true;
    }

    // 3. Migrate imports
    if (content.includes('react-router-dom')) {
        // Find what was imported from react-router-dom
        const match = content.match(/import\s*{([^}]+)}\s*from\s*['"]react-router-dom['"]/);
        if (match) {
            const imports = match[1].split(',').map(s => s.trim());
            let nextImports = [];
            let nextLinkImport = false;
            
            content = content.replace(match[0], ''); // Remove old import

            imports.forEach(imp => {
                if (imp === 'Link') nextLinkImport = true;
                if (imp === 'useNavigate') {
                    nextImports.push('useRouter');
                    // replace useNavigate() with useRouter()
                    content = content.replace(/useNavigate\(\)/g, 'useRouter()');
                    content = content.replace(/const navigate = useNavigate\(\)/g, 'const router = useRouter()');
                    content = content.replace(/navigate\(/g, 'router.push(');
                }
                if (imp === 'useLocation') {
                    nextImports.push('usePathname');
                    content = content.replace(/const location = useLocation\(\)/g, 'const pathname = usePathname()');
                    content = content.replace(/location\.pathname/g, 'pathname');
                }
                if (imp === 'useParams') {
                    nextImports.push('useParams');
                }
                if (imp === 'Outlet') {
                    // Next.js uses {children} instead of Outlet, we'll manually fix layouts later
                }
            });

            if (nextLinkImport) {
                content = "import Link from 'next/link';\n" + content;
            }
            if (nextImports.length > 0) {
                content = `import { ${nextImports.join(', ')} } from 'next/navigation';\n` + content;
            }
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Migrated:', filePath);
    }
}

const dirs = ['components', 'layouts', 'admin', 'old_pages', 'context'];
dirs.forEach(d => {
    const fullPath = path.join(__dirname, 'src', d);
    if (fs.existsSync(fullPath)) {
        walkDir(fullPath, migrateNextJs);
    }
});
