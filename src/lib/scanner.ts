import path from 'node:path';
import { glob } from 'glob';
import { createAlbum, createArtist, createTrack } from './media';
import { getMediaSourceById } from './sources';
import { MDSourceType } from './types';
import type { MediaSourceRow } from './server/db/schema';
import { parseFile } from 'music-metadata';
import { MusicBrainzApi } from 'musicbrainz-api';
import { createArtistFactPool, createArtistFactPoolFact, getArtistFactPoolByArtistId, getFactPoolByName } from './factpools';
import { getArtistFacts, getArtistLikenesses } from './external_sources';
import { createArtistLikeness, getArtistLikenessByArtistId } from './likeness';
import { DatabaseError } from 'pg';
import { saveStaticFile } from './server/storage';

const mbApi = new MusicBrainzApi({
    appName: 'melodic-decision',
    appVersion: '0.1.0',
    appContactInfo: 'unlabeledmabel@discord',
});

type TrackManifestEntry = {
    title: string;
    musicBrainzId?: string;
    trackNumber?: number;
    filePath: string;
};

type AlbumManifestEntry = {
    title: string;
    releaseYear: number;
    musicBrainzId?: string;
    tracks: TrackManifestEntry[];
};

type ArtistManifestEntry = {
    name: string;
    musicBrainzId?: string;
    albums: AlbumManifestEntry[];
};

type Manifest = ArtistManifestEntry[];

export async function scanSource(sourceId: number): Promise<void> {
    const source = await getMediaSourceById(sourceId);
    if (!source) {
        throw new Error(`Media source with ID ${sourceId} not found.`);
    }

    switch (source.type) {
        case MDSourceType.LocalFolder:
            await scanLocalFolderSource(source);
            break;
        case MDSourceType.Jellyfin:
            throw new Error(`Jellyfin source scanning is not yet implemented.`);
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

    const manifest: Manifest = [];

    for (const filePath of files) {
        try {
            const metadata = await parseFile(filePath);
            const artistName = metadata.common.artist || 'Unknown Artist';
            const albumTitle = metadata.common.album || 'Unknown Album';
            const albumReleaseYear = metadata.common.year || -1;
            const trackTitle = metadata.common.title || path.basename(filePath);
            const trackNumber = metadata.common.track.no;

            let artistEntry = manifest.find(a => a.name === artistName);
            if (!artistEntry) {
                artistEntry = { name: artistName, albums: [] };
                manifest.push(artistEntry);
            }

            let albumEntry = artistEntry.albums.find(a => a.title === albumTitle);
            if (!albumEntry) {
                albumEntry = { title: albumTitle, releaseYear: albumReleaseYear, tracks: [] };
                artistEntry.albums.push(albumEntry);
            }

            albumEntry.tracks.push({ title: trackTitle, trackNumber: trackNumber || undefined, filePath });

            console.log(`Processed file: ${filePath} - Artist: ${artistName}, Album: ${albumTitle}, Track: ${trackTitle}`);
        } catch (error) {
            console.error(`Failed to read metadata for file ${filePath}:`, error);
        }
    }

    // try fetching musicbrainz ids for artists and albums here
    try {
        for (const artistEntry of manifest) {
            console.log(`Searching for artist "${artistEntry.name}" on MusicBrainz...`);
            const artistSearchResults = await mbApi.search('artist', {
                query: artistEntry.name,
                limit: 1
            });

            artistEntry.musicBrainzId = artistSearchResults.artists[0]?.id;
            console.log(`Found artist "${artistEntry.name}" on MusicBrainz: ${artistEntry.musicBrainzId}`);

            for (const albumEntry of artistEntry.albums) {
                console.log(`Searching for album "${albumEntry.title}" by artist "${artistEntry.name}" on MusicBrainz...`);
                const albumSearchResults = await mbApi.search('release-group', {
                    query: albumEntry.title,
                    artist: artistEntry.name,
                    limit: 1
                });

                const releaseGroup = albumSearchResults['release-groups']?.[0];

                if (releaseGroup) {
                    albumEntry.musicBrainzId = releaseGroup.id;
                    albumEntry.releaseYear = releaseGroup['first-release-date']
                        ? parseInt(releaseGroup['first-release-date'].split('-')[0], 10)
                        : albumEntry.releaseYear;
                } else {
                    console.warn(`No MusicBrainz release group found for album "${albumEntry.title}" by artist "${artistEntry.name}".`);
                }
            }
        }
    } catch (error) {
        console.error('Failed to search for artists on MusicBrainz:', error);
    }

    for (const artistEntry of manifest) {
        try {
            const artist = await createArtist(artistEntry.name, artistEntry.musicBrainzId);
            console.log(`Created artist: ${artist.name}`);
            // Create a fact pool for the artist if it doesn't exist
            const existingFactPool = await getArtistFactPoolByArtistId(artist.id)
                ?? await getFactPoolByName(artist.name);
            await createArtistFactPool(artist);
            if (!existingFactPool) {
                console.log(`Creating fact pool for artist: ${artist.name}`);
                // fetch facts
                console.log(`Fetching facts for artist: ${artist.name}`);
                const facts = await getArtistFacts(artist.name);
                for (const fact of facts) {
                    console.log(`Adding fact for artist ${artist.name}: ${fact}`);
                    await createArtistFactPoolFact(artist.id, fact);
                }
            }
            console.log(`Created fact pool for artist: ${artist.name}`);
            const existingLikenesses = await getArtistLikenessByArtistId(artist.id); // ...siiigh
            if (!existingLikenesses || existingLikenesses.length === 0) {
                console.log(`Fetching likenesses for artist: ${artist.name}`);
                
                const likenesses = await getArtistLikenesses(artist.musicBrainzId || '');
                console.log(`Fetched likenesses for artist ${artist.name}:`, likenesses);
                
                for (const likeness of likenesses) {
                    console.log(`ADDING a likeness for artist ${artist.name}: ${likeness.url}`);

                    // download the likeness image and save it to the static folder
                    const response = await fetch(likeness.url);
                    if (!response.ok) {
                        console.error(`Failed to download likeness image from ${likeness.url}: ${response.statusText}`);
                        continue;
                    }
                    const extension = path.extname(new URL(likeness.url).pathname).toLowerCase() || '.jpg';
                    const fileName = `likeness-${artist.id}-${Date.now()}${extension}`;
                    const publicPath = saveStaticFile(
                        'likenesses',
                        fileName,
                        Buffer.from(await response.arrayBuffer())
                    );

                    await createArtistLikeness(artist.id, publicPath);
                }
            }
            console.log(`Created likenesses for artist: ${artist.name}`);

            for (const albumEntry of artistEntry.albums) {
                console.log(`Creating album: ${albumEntry.title} for artist: ${artist.name}`);
                const album = await createAlbum(albumEntry.title, albumEntry.releaseYear, artist.id, albumEntry.musicBrainzId);
                for (const trackEntry of albumEntry.tracks) {
                    await createTrack(trackEntry.title, album.id, trackEntry.filePath, trackEntry.trackNumber, trackEntry.musicBrainzId);
                }
            }
        } catch (error) {
            console.error(`Failed to create artist or albums for ${artistEntry.name}!`);
            if (error instanceof DatabaseError) {
                console.log(error.message);
                console.log(error.detail);
                console.log(error.constraint);
                console.log(error.table);
                console.log(error.column);
                console.log(error.code);
            } else {
                console.dir(error, { depth: null });
            }

        }
    }
        console.log('Manifest:', JSON.stringify(manifest, null, 2));
    }

