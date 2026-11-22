import fs from 'node:fs';
import path from 'node:path';

export function getStaticStorageDir(directory: 'uploads' | 'likenesses'): string {
    const root = path.join(process.cwd(), 'static', directory);
    fs.mkdirSync(root, { recursive: true });
    return root;
}

export function saveStaticFile(
    directory: 'uploads' | 'likenesses',
    fileName: string,
    contents: Buffer
): string {
    const safeName = path.basename(fileName);
    fs.writeFileSync(path.join(getStaticStorageDir(directory), safeName), contents);
    return `/${directory}/${safeName}`;
}

