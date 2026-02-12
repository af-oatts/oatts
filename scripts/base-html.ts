import fs from 'fs';
import path from 'path';

const BASE_URL_TEMPLATE = 'http://oatts.localhost/oatts/content/';

function processHtml(filePath: string, contentId: string) {
    const content = fs.readFileSync(filePath, 'utf8');

    const baseTag = `<base href="${BASE_URL_TEMPLATE}${contentId}/" target="_blank">`;

    if (content.includes('<base ')) {
        console.log(`Skipping ${filePath} - already has <base> tag`);
        return;
    }

    let updatedContent;
    if (content.includes('<head>')) {
        updatedContent = content.replace('<head>', `<head>\n  ${baseTag}`);
    } else if (content.includes('<html>')) {
        updatedContent = content.replace('<html>', `<html>\n<head>\n  ${baseTag}\n</head>`);
    } else {
        updatedContent = `<!DOCTYPE html>\n<html>\n<head>\n  ${baseTag}\n</head>\n<body>\n${content}\n</body>\n</html>`;
    }

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated ${filePath}`);
}

export function addIndexBaseTags(destDir: string) {
    const contentFolder = path.join(destDir, 'content');

    if (!fs.existsSync(contentFolder)) {
        console.error(`Directory ${contentFolder} does not exist`);
        return;
    }

    const contentDirs = fs.readdirSync(contentFolder);

    for (const contentId of contentDirs) {
        const contentPath = path.join(contentFolder, contentId);
        const stat = fs.statSync(contentPath);

        if (stat.isDirectory()) {
            const indexPath = path.join(contentPath, 'index.html');

            if (fs.existsSync(indexPath)) {
                processHtml(indexPath, contentId);
            } else {
                console.log(`No index.html found in ${contentPath}`);
            }
        }
    }
}