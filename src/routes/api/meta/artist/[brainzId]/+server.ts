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



export async function GET({ params }): Promise<void | Response> {
    const artistId = params.brainzId

    // todo this is kind of stupid
    // get the artist's name as defined in the musicbrainz id (needed for songfacts)
    let artistDetails = await fetchWithRetry(`https://musicbrainz.org/ws/2/artist/${artistId}?fmt=json`, {
        headers: {
            "User-Agent": "Melodic Decision (https://github.com/FloppiTuna/melodic-decision)"
        }
    }).then((response) => { return response.json()}).catch((e) => console.error(`Error fetching! ${e}`));

    if (artistDetails.error) {
        if (artistDetails.error.indexOf("rate limit")) {
            console.warn(`MusicBrainz is rate-limiting us while querying id ${artistId}!`)
            return new Response(JSON.stringify({
                error: "sory"
            }), { status: 503 })
        }
    } else {
        console.log(`MusicBrainz has responded...${artistId} = ${artistDetails.name}`)
    }

    // Fetch fanart.tv data
    const artistPhotos = await fetch(`https://webservice.fanart.tv/v3.2/music/${artistId}?api_key=e3d97fe7054cbdebd163840a53a883dd`, {
        headers: {
            "User-Agent": "Melodic Decision (https://github.com/FloppiTuna/melodic-decision)"
        }
    }).then((response) => { return response.json()}).catch((e) => console.error(`Error fetching! ${e}`));
    // Search Songfacts for this artist's page (and respective key)
    // TODO: is it safe to just assume every artist's name is the key? example: Tears for Fears = tears-for-fears
    // i would assume not? im not sure; investigate how songfacts handles keying artists

    const options = {
        method: 'GET',
        headers: {
            cookie: 'PHPSESSID=r9b3pgjejedr5jh96abgdible9; __uzma=90ff7fc4-a1bb-4a6a-8a5a-66c7299f5643; __uzmb=1766261298; __uzmc=348724914580; __uzmd=1766261817',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0'
        }
    };

    const songfactsSearch = await fetch(`https://www.songfacts.com/search/artists/${encodeURIComponent(artistDetails.name)}`, options)
        .then(response => response.text())
        .catch(err => console.error(err));


        
    const _sfSearchPage = load(songfactsSearch);
    const candidates: Record<string, { distance: number, key: string | undefined }> = {}

    let willSkipFacts = false

    _sfSearchPage('.browse-list-blue').find("li").toArray().forEach((e, i) => {
        if (willSkipFacts) return;

        if (_sfSearchPage(e).text().indexOf("No Artist matches found.") >= 0) {
            console.error(`Songfacts returned no results for ${artistDetails.name}, DYK will be empty!`)
            willSkipFacts = true
            return;
        }

        candidates[_sfSearchPage(e).text()] = {
            distance: distance(artistDetails.name, _sfSearchPage(e).text()),
            key: _sfSearchPage(e).find("a").attr("href")?.replace("/songs/", "") || undefined
        };
    })
    
    const facts: string[] = []

    if (!willSkipFacts) {
        const [key, value] = Object.entries(candidates)
            .reduce((max, curr) => curr[1] > max[1] ? curr : max);

        console.debug(`Picked ${key} (${value.key}) with match of ${value.distance}`)


        const artistFactsPage = await fetch(`https://www.songfacts.com/facts/${value.key}`, options)
            .then(response => response.text())
            .catch(err => console.error(err))
        
        const _sfArtistFacts = load(artistFactsPage)


        _sfArtistFacts('.artistfacts-results').find("li").toArray().forEach((e, i) => {
            // skip the first one cuz its just stupid details
            if (i == 0) return;
            facts.push(_sfArtistFacts(_sfArtistFacts(e.children)[0]).html() || _sfArtistFacts(e).text())
        })
    }

    const response = {
        "bio": {
            name: artistDetails.name || "N/A",
        },
        "artistPhotos": {
            artistBackgrounds: artistPhotos.artistbackground || null,
            artistThumbnails: artistPhotos.artistthumb || null
        },
        "facts": facts
    }

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}