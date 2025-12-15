export function GET({ params }): Promise<void | Response> {
    const artist = params.jellyArtist;

    console.log(`Fetching metadata for artist ${artist}`);

    const options = {
        method: 'GET',
        headers: {
            Authorization: 'MediaBrowser Token="08b08754de15452bb14dcf916180bb9b", Client="Melodic Decision", Device="MD Headend", DeviceId="CHRISTMAS", Version="0.0.1"',
            'User-Agent': 'insomnia/12.0.0'
        }
    };

    const resp = fetch(`https://jelly.sillyduo.fun/Items/${artist}?userId=a16652bbc4f14709840cdc60795eb159`, options)
        .then(response => response.json())
        .then(response => new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }))
        .catch(err => console.error(err));
    
    return resp;
}