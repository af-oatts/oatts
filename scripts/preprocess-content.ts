import path from 'path';
import fs from 'fs';
import { copyAndExtractContent } from './copycontent';
import { deduplicate } from './deduplicate';
import { addIndexBaseTags } from './base-html';


const sourceDir = path.join(process.cwd(), 'content');
const destDir = path.join(process.cwd(), 'public', 'oatts');

// First copy all the stuff over. 
let createdContent = copyAndExtractContent(sourceDir, destDir);

if(createdContent.length > 1) {
    deduplicate(destDir, createdContent);
    addIndexBaseTags(destDir);
}