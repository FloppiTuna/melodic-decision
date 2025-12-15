export async function GET({ params }): Promise<void | Response> {
    const artist = params.artist;

    const options = {method: 'GET', headers: {'User-Agent': 'insomnia/12.1.0'}};

    const resp = fetch(`https://webservice.fanart.tv/v3.2/music/${artist}?api_key=e3d97fe7054cbdebd163840a53a883dd`, options)
        .then(response => response.json())
        .then((response) => {
            if (response.error) {
                console.warn(`error fetching artist photos for "${artist}"!`)
                return new Response(JSON.stringify(response), {
                    status: response.error == "Artist not found" ? 404 : 500, //todo: this sucks
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

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