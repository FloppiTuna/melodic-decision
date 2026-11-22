import fs from 'node:fs';
import path from 'node:path';
import { getStaticStorageDir } from '$lib/server/storage';

export async function GET({ params }: { params: { filename: string } }) {
    const filePath = path.join(getStaticStorageDir('likenesses'), path.basename(params.filename));

    try {
        const contents = await fs.promises.readFile(filePath);
        return new Response(contents, {
            headers: {
                'Cache-Control': 'public, max-age=3600',
                'Content-Type': path.extname(filePath).toLowerCase() === '.png'
                    ? 'image/png'
                    : 'image/jpeg'
            }
        });
    } catch {
        return new Response('Likeness not found', { status: 404 });
    }
}
