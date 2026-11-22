import fs from 'node:fs';
import path from 'node:path';
import { getStaticStorageDir } from '$lib/server/storage';

function getContentType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
    if (extension === '.png') return 'image/png';
    if (extension === '.gif') return 'image/gif';
    if (extension === '.webp') return 'image/webp';
    return 'application/octet-stream';
}

export async function GET({ params }: { params: { filename: string } }) {
    const filePath = path.join(getStaticStorageDir('likenesses'), path.basename(params.filename));

    try {
        const contents = await fs.promises.readFile(filePath);
        return new Response(contents, {
            headers: {
                'Cache-Control': 'public, max-age=3600',
                'Content-Type': getContentType(filePath)
            }
        });
    } catch {
        return new Response('Likeness not found', { status: 404 });
    }
}
