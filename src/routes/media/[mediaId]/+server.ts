import { getTrackById } from '$lib/media';
import fs from 'fs';
import { Readable } from 'node:stream';
import path from 'node:path';

export async function GET({ params }): Promise<Response> {
    const id = params.mediaId;
    const track = await getTrackById(+id);

    if (!track) {
        return new Response('Track not found', { status: 404 });
    }

    console.log(`Serving track with ID: ${id}`);

    // todo: handle other types of media source X_X
    if (track.path) {
        const fileStream = fs.createReadStream(track.path);
        const webStream = Readable.toWeb(fileStream);
        const filename = path.basename(track.path);

        return new Response(webStream, {
            status: 200,
            headers: {
                'Content-Type': track.mimeType,
                'Content-Disposition': `inline; filename="${filename}"`,
            }
        });
    }
}