import fs from 'fs';
import path from 'path';
import * as os from 'os'

const BASE_URL_TEMPLATE = os.platform() === 'win32' ? 'http://oatts.localhost/oatts/content/' : 'oatts://localhost/oatts/content'; 

console.log("Setting base to " + BASE_URL_TEMPLATE)

function processHtml(filePath: string, contentId: string) {
    const content = fs.readFileSync(filePath, 'utf8');

    const baseTag = `<base href="${BASE_URL_TEMPLATE}${contentId}/" target="_blank"><meta http-equiv="Content-Security-Policy" content="default-src 'self' oatts: tauri: http://oatts.localhost https://oatts.localhost http://tauri.localhost https://tauri.localhost; script-src 'self' oatts: tauri: http://oatts.localhost https://oatts.localhost http://tauri.localhost https://tauri.localhost 'unsafe-inline' 'unsafe-eval'; style-src 'self' oatts: tauri: http://oatts.localhost https://oatts.localhost http://tauri.localhost https://tauri.localhost 'unsafe-inline'; img-src 'self' oatts: tauri: http://oatts.localhost https://oatts.localhost http://tauri.localhost https://tauri.localhost data: blob: https:; font-src 'self' oatts: tauri: http://oatts.localhost https://oatts.localhost http://tauri.localhost https://tauri.localhost data:; connect-src 'self' oatts: tauri: http://oatts.localhost https://oatts.localhost http://tauri.localhost https://tauri.localhost ws://localhost:* wss://localhost:*;">`;

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