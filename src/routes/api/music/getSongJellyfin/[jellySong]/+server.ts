export async function GET({ params }): Promise<Response> {
    const jellyfinSong = params.jellySong;
    console.log(`Fetching song for Jellyfin song ID: ${jellyfinSong}`);

    const options = {
        method: 'GET',
        headers: {
            // Jellyfin/Emby-style auth header is typically X-Emby-Authorization
            'X-Emby-Authorization': 'MediaBrowser Token="08b08754de15452bb14dcf916180bb9b", Client="Melodic Decision", Device="MD Headend", DeviceId="CHRISTMAS", Version="0.0.1"',
            'User-Agent': 'insomnia/12.0.0'
        }
    };

    try {
        const upstream = await fetch(`https://jelly.sillyduo.fun/Audio/${jellyfinSong}/stream.mp3?userId=b1172f9f7a884c6795bf546c4c998002`, options);

        if (!upstream.ok) {
            console.error('Upstream returned non-OK status', upstream.status);
            return new Response(null, { status: upstream.status });
        }

        // Forward content-type and length if present; stream the body directly.
        const headers = new Headers();
        const contentType = upstream.headers.get('content-type') || 'audio/mpeg';
        headers.set('Content-Type', contentType);
        const contentLength = upstream.headers.get('content-length');
        if (contentLength) headers.set('Content-Length', contentLength);

        return new Response(upstream.body, {
            status: upstream.status,
            headers
        });
    } catch (err) {
        console.error('Error fetching upstream MP3:', err);
        return new Response('Upstream fetch error', { status: 502 });
    }
}