const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('formatCurrency') && content.includes('Intl.NumberFormat')) {
                let newContent = content.replace(/"en-US"/g, '"fr-DZ"');
                newContent = newContent.replace(/currency:\s*"USD"/g, 'currency: company?.currency || "DZD"');
                newContent = newContent.replace(/\?\.currency \|\| "USD"/g, '?.currency || "DZD"');
                
                if (newContent !== content) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    console.log(`Updated ${fullPath}`);
                }
            }
        }
    }
}

replaceInDir(componentsDir);
