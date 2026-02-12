import path from 'path';
import fs from 'fs';
import { copyAndExtractContent } from './copycontent';
import { deduplicate } from './deduplicate';
import { addIndexBaseTags } from './base-html';


const sourceDir = path.join(process.cwd(), 'content');
const destDir = path.join(process.cwd(), 'public', 'oatts');

// First copy all the stuff over. 
let {created, deleted} = copyAndExtractContent(sourceDir, destDir);

// Then de-duplicate.

deduplicate(destDir, created, deleted);

// Then put in the base tags.
addIndexBaseTags(destDir);