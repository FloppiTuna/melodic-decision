import { load } from 'cheerio';
import distance from 'jaro-winkler';

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    {
        maxRetries = 10,
        baseDelayMs = 1000
    } = {}
) {
    let attempt = 0;

    while (true) {
        const res = await fetch(url, options);

        // if we weren't hit with a 429 we can return
        if (res.status !== 503) {
            return res;
        }

        if (attempt >= maxRetries) {
            throw new Error("Reached maximum allowed retries while waiting for server to cool down.")
        }

        // Respect Retry-After if present (seconds)
        const retryAfterHeader = res.headers.get("Retry-After");
        const retryAfterMs = retryAfterHeader
            ? Number(retryAfterHeader) * 1000
            : baseDelayMs * Math.pow(2, attempt); // exponential backoff

        const delay = Math.min(retryAfterMs, 30_000);

        console.warn(
            `other server rate-limited..retrying in ${delay}ms (attempt ${attempt + 1}).`
        );

        await new Promise(r => setTimeout(r, delay));
        attempt++;
    }
}

export async function getArtistFacts(artistName: string): Promise<string[]> {
    // fact url is the provided artist's name with spaces replaced by hyphens, and lowercased. special characters are removed.
    // Tom Petty & the Heartbreakers becomes tom-petty-the-heartbreakers
    const sanitizedArtistName = artistName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

    const url = `https://www.songfacts.com/facts/${sanitizedArtistName}`;

    const response = await fetchWithRetry(url, { method: 'GET' });

    if (!response.ok) {
        console.error(`Failed to fetch facts for artist ${artistName}. Status: ${response.status}`);
        return [];
    }

    const html = await response.text();
    const $ = load(html);

    const facts: string[] = [];

    $('.details-content.clearfix li').each((_, element) => {
        const factText = $(element).text().trim();
        if (factText) {
            facts.push(factText);
        }
    });

    return facts;
}

// todo: its a little silly how getArtistFacts works on the artist name, but getArtistLikenesses works on the musicbrainz id. i should probably make these two functions work on the same identifier
export async function getArtistLikenesses(artistMusicbrainzId: string): Promise<object[]> {
    const photos = await fetchWithRetry(`https://webservice.fanart.tv/v3.2/music/${artistMusicbrainzId}?api_key=${process.env.FANART_TV_API_KEY}`, {
        headers: {
            "User-Agent": "Melodic Decision (https://github.com/FloppiTuna/melodic-decision)"
        }
    }).then((response) => { return response.json() }).catch((e) => console.error(`Error fetching! ${e}`));

    console.log(`Fetched likenesses for artist ${artistMusicbrainzId}:`, photos);
    return [ ...(photos.artistbackground || []), ...(photos.artistthumb || [])];
}