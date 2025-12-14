export function GET({ params }): Promise<void | Response> {
    const jellyfinPlaylist = params.jellyPlaylist;

    console.log(`Fetching songs for Jellyfin playlist: ${jellyfinPlaylist}`);

    // Use jellyfin api to fetch the playlist
    const options = {
        method: 'GET',
        headers: {
            // TODO: move token to env variable GRAHH
            Authorization: 'MediaBrowser Token="08b08754de15452bb14dcf916180bb9b", Client="Melodic Decision", Device="MD Headend", DeviceId="CHRISTMASJUSTAWEEKAWAY", Version="0.0.1"',
        }
    };

    const resp = fetch(`https://jelly.sillyduo.fun/Playlists/${jellyfinPlaylist}/Items?userId=b1172f9f7a884c6795bf546c4c998002`, options)
        .then(response => response.json())
        .then(response => {
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
