import path from 'node:path';
import { glob } from 'glob';
import { createMediaItem } from './media';
import { getMediaSourceById } from './sources';
import { MDSourceType } from './types';
import type { MediaSourceRow } from './server/db/schema';
import { parseFile } from 'music-metadata';
import { MusicBrainzApi } from 'musicbrainz-api';

const mbApi = new MusicBrainzApi({
    appName: 'melodic-decision', // todo: sync with user-defined branding if i ever do that?
    appVersion: '0.0.1',
    appContactInfo: 'mabel@ne',
});

export async function scanSource(sourceId: number): Promise<void> {
    const source = await getMediaSourceById(sourceId);
    if (!source) {
        throw new Error(`Media source with ID ${sourceId} not found.`);
    }

    switch (source.type) {
        case MDSourceType.LocalFolder:
            await scanLocalFolderSource(source);
            break;
        default:
            throw new Error(`Source ${source.type} cannot be scanned.`);
    }

}

async function scanLocalFolderSource(source: MediaSourceRow): Promise<void> {
    const folderPath = source.config?.folderPath;
    if (typeof folderPath !== 'string' || !folderPath.trim()) {
        throw new Error(`Local folder source with ID ${source.id} does not have a folder path configured.`);
    }

    const files = await glob('**/*.{mp3,flac,wav,m4a,ogg,opus}', {
        cwd: folderPath,
        nodir: true,
        absolute: true
    });

    console.log(`Found ${files.length} media files in folder ${folderPath}.`);

    for (const filePath of files) {
        try {
            const metadata = await parseFile(filePath);
            const title = metadata.common.title || path.basename(filePath);
            const artist = metadata.common.artist || 'Unknown Artist';
            console.log(`Processing file: ${filePath}, Title: ${title}, Artist: ${artist}`);
            await createMediaItem(source.id, title, artist);
        } catch (error) {
            console.error(`Failed to process file ${filePath}:`, error);
        }
    }
}

