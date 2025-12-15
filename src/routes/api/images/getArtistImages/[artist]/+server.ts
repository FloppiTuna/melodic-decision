export async function GET({ params }): Promise<void | Response> {
    const artist = params.artist;

    console.log(`Fetching images for artist: ${artist}`);

    const options = {method: 'GET', headers: {'User-Agent': 'insomnia/12.1.0'}};

    const resp = fetch(`https://webservice.fanart.tv/v3.2/music/${artist}?api_key=e3d97fe7054cbdebd163840a53a883dd`, options)
        .then(response => response.json())
        .then((response) => {
            return new Response(JSON.stringify(response), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        })
        .catch(err => console.error(err));

    return resp;
}