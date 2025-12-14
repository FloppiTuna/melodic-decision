export async function GET({ params }) : Promise<void | Response> {
    const { getPlaylistByName } = await import('$lib/playlists');
    
    return getPlaylistByName(params.playlist).then(playlist => {
        if (playlist) {
            return new Response(JSON.stringify(playlist), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        return new Response(JSON.stringify({ error: 'Playlist not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    );
}