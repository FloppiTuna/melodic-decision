export async function GET({ params }): Promise<void | Response> {
    const artistId = params.brainzId

    // todo this is kind of stupid
    // get the artist's name as defined in the musicbrainz id
    let artistDetails = await fetch(`https://musicbrainz.org/ws/2/artist/${artistId}?fmt=json`, {
        headers: {
            "User-Agent": "Melodic Decision (https://github.com/FloppiTuna/melodic-decision)"
        }
    }).then((response) => { return response.json()});

    console.log(artistDetails)

    
}