<script lang="ts">
    import { onMount } from "svelte";
    import {
        MDDesignVariant,
        type MDDidYouKnowFact,
        type MDSong,
        type MDSongPool,
    } from "$lib/types";
    import { load } from "./+page.js";

    export let data; // playlist data

    let loadingText = "";
    let overlayEl: HTMLDivElement;

    let renderLoopId: number = 0;

    let isDebugVisible = false;

    let songPool: MDSongPool = [];

    let artistPhotos: Record<string, object> = {};

    let currentSong: MDSong = {
        title: "",
        artist: "",
        artistId: "",
        album: "",
        releaseYear: 0,
        mediaUrl: "",
    };

    let visibleSongInfo = {
        title: "",
        artist: "",
        album: "",
        releaseYear: 0,
    };

    let visibleDidYouKnowFact = {
        content: "",
    };

    let visiblePhotoMode: "generic" | "artist" = "generic";
    let visiblePhoto = "";

    let verticalLayout = "top-picture";
    let horizontalLayout = "left-picture";

    const CYCLE_SECONDS = 30.033; // 1 cycle = 30.033 secs.
    let cycles = 0;
    
    function randCyclesBetweenMinutes(minMinutes: number, maxMinutes: number) {
        const minSeconds = minMinutes * 60;
        const maxSeconds = maxMinutes * 60;
        const seconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
        return Math.ceil(seconds / CYCLE_SECONDS);
    }

    let cyclesUntilHorizontalSwitch = randCyclesBetweenMinutes(1, 5);
    let cyclesUntilVerticalSwitch = randCyclesBetweenMinutes(2, 8);
    let cyclesUntilPrimaryColorSwitch = randCyclesBetweenMinutes(4, 28);

    let lastDyk = "";

    let playlistGeneration: MDSong[]
    let playlistGenerationCount: number = 0;

    /*
     * Renders the viewport and increments by one cycle.
     * This will update the photo, did you know, song info, and will also adjust the layout if it is time to do so (determined by cyclesUntil...Switch).
     */
    function render() {
        // Layout code, woo... increment current cycles by one, decrement timers for switching
        cycles++;
        cyclesUntilHorizontalSwitch--;
        cyclesUntilVerticalSwitch--;
        cyclesUntilPrimaryColorSwitch--;

        // if it's time to do a horizontal switch...
        if (cyclesUntilHorizontalSwitch <= 0) {
            horizontalLayout =
                horizontalLayout === "left-picture"
                    ? "right-picture"
                    : "left-picture";
            cyclesUntilHorizontalSwitch = randCyclesBetweenMinutes(1, 5); // TODO: get rid of these magic numbers and put them somewhere nicer
            console.debug(
                `RENDER #${cycles}: cycled horizontal, now ${horizontalLayout}. next change in ${cyclesUntilHorizontalSwitch} cycles`,
            );
        }

        // if it's time to do a vertical switch...
        if (cyclesUntilVerticalSwitch <= 0) {
            verticalLayout =
                verticalLayout === "top-picture"
                    ? "top-details"
                    : "top-picture";
            cyclesUntilVerticalSwitch = randCyclesBetweenMinutes(2, 8);
            console.debug(
                `RENDER #${cycles}: cycled vertical, now ${verticalLayout}. next change in ${cyclesUntilVerticalSwitch} cycles`,
            );
        }

        // if it's time to switch the primary color...
        if (cyclesUntilPrimaryColorSwitch <= 0) {
            const newColor = data.playlist.style.primaryColor[Math.floor(Math.random() * data.playlist.style.primaryColor.length)]
            document.documentElement.style.setProperty(
                "--primary-color",
                newColor
            );
            cyclesUntilVerticalSwitch = randCyclesBetweenMinutes(4, 28);
            console.debug(
                `RENDER #${cycles}: cycled color, now ${newColor}. next change in ${cyclesUntilPrimaryColorSwitch} cycles`,
            )
        }


        // Update song information display
        visibleSongInfo = {
            title: currentSong?.title || "",
            artist: currentSong?.artist || "",
            album: currentSong?.album || "",
            releaseYear: currentSong?.releaseYear || 0,
        };

        // Pick a random artist thumbnail photo...
        if (artistPhotos[currentSong.artistId.Id].artistthumb) {
            visiblePhotoMode = "artist";

            // pick random artist thumbnail
            const pickedImage =
                artistPhotos[currentSong.artistId.Id].artistthumb[
                    Math.floor(
                        Math.random() *
                            artistPhotos[currentSong.artistId.Id].artistthumb
                                .length,
                    )
                ];

            visiblePhoto = pickedImage.url;
        } else {
            // ...unless one isn't available, in which case use the generic photo
            visiblePhotoMode = "generic";
        }

        // Pick a random did you know fact from the ones in the current pool
        // TODO: currently just uses the global list, does not fetch any song-specific ones from songfacts or whatever. work on this pls
        if (data?.didYouKnowGlobal && data.didYouKnowGlobal.length > 0) {
            const randomIndex = Math.floor(
                Math.random() * data.didYouKnowGlobal.length,
            );
            console.debug(
                `RENDER #${cycles}: selected DYK fact #${randomIndex} ("${data.didYouKnowGlobal[randomIndex].text}")`,
            );

            visibleDidYouKnowFact = {
                content: data.didYouKnowGlobal[randomIndex].text,
            };
        } else {
            // if none are available however, use the Sad Fella Mode
            visibleDidYouKnowFact = { content: ":((" };
        }

        // we're done here
        return;
    }

    onMount(async () => {
        // was the playlist fetched sucessfully?
        if (data?.playlist) {
            loadingText = `Loading playlist "${data.playlist.name}"...`;

            // set the initial primary color
            document.documentElement.style.setProperty(
                "--primary-color",
                data.playlist.style.primaryColor[Math.floor(Math.random() * data.playlist.style.primaryColor.length)],
            );

            // Begin the great Conglomeration o' Sources
            // (interate thru every defined source and fetch songs from them)
            await Promise.all(
                data.playlist.sources.map(
                    async (source: any, index: number) => {
                        loadingText = `Processing source #${index}: ${source.type}`;
                        console.log(`Processing source #${index}: ${source.type}`);
                        if (!source.config) {
                            console.warn(
                                `Source ${index} of type ${source.type} has no configuration and cannot be used.`,
                            );
                        }

                        switch (source.type) {
                            case "jellyfin":
                                try {
                                    const res = await fetch(
                                        `/api/music/fetchSongsJellyfin/${source.config.playlistId}`,
                                    );
                                    const songs = await res.json();

                                    songs.Items.forEach((element: any) => {
                                        songPool.push({
                                            title: element.Name,
                                            artist: (
                                                element.Artists || []
                                            ).join(", "),
                                            artistId:
                                                element.AlbumArtists[0] || "", // TODO: THIS SUCKSSSS JIUEHWUFGHVWEJHFGEWU do better grr...
                                            album: element.Album,
                                            releaseYear: element.ProductionYear,
                                            mediaUrl: `/api/music/getSongJellyfin/${element.Id}`,
                                        });
                                    });
                                } catch (err) {
                                    console.error(
                                        "Error fetching songs from Jellyfin:",
                                        err,
                                    );
                                }
                                break;

                            default:
                                break;
                        }
                    },
                ),
            );

            // after songpool has been fully populated
            loadingText = `Finalizing playlist... (${songPool.length} songs)`;

            // get each artist in the song pool and fetch images for them
            let artistSet = new Set<string | undefined>();
            songPool.forEach((song) => {
                artistSet.add(song.artistId.Id);
            });

            // Wait for all artist image fetches before continuing.
            // TODO (dec 13, 2025): this whole thing is a fucking botchfest pls pls PLS fix it later
            // "now nepeta why is that" shut up cat also:
            // for some reason im only handling the 1st artist in the artist list from jellyfin and the way jellyfin passses it will be different from other sources in the future
            // so basically, i need to clean up how exactly i pass through the artist ids, pick the right way to extract the musicbrainz id, and then search it
            // this is why typescript is whining about .Id not existing on a string because IT ISNT A STRING GRAHHHHH
            // ill fix this soon probably
            const artistIds = Array.from(artistSet).filter(Boolean) as string[];
            if (artistIds.length > 0) {
                await Promise.all(
                    artistIds.map(async (artistId) => {
                        loadingText = `Fetching images for artist ${artistId}`;

                        try {
                            // first get the musicbrainz id from jellyfin
                            const mbRes = await fetch(
                                `/api/music/getArtistMetadataJellyfin/${encodeURIComponent(artistId)}`,
                            );
                            if (mbRes.ok) {
                                const mbData = await mbRes.json();
                                if (
                                    mbData &&
                                    mbData.ProviderIds.MusicBrainzArtist
                                ) {
                                    console.log(
                                        `Received MusicBrainz ID for artist ID ${artistId}:`,
                                        mbData.ProviderIds.MusicBrainzArtist,
                                    );
                                    console.log(
                                        mbData.ProviderIds.MusicBrainzArtist,
                                    );

                                    // now fetch images using that musicbrainz id
                                    const imgRes = await fetch(
                                        `/api/images/getArtistImages/${mbData.ProviderIds.MusicBrainzArtist}`,
                                    );
                                    if (imgRes.ok) {
                                        const imgData = await imgRes.json();
                                        console.log(
                                            `Received images for MusicBrainz ID ${mbData.ProviderIds.MusicBrainzArtist}:`,
                                            imgData,
                                        );

                                        // now match this up with the artist
                                        artistPhotos[artistId] = imgData;
                                    } else {
                                        console.warn(
                                            `Failed to fetch images for MusicBrainz ID ${mbData.ProviderIds.MusicBrainzArtist}:`,
                                            imgRes.statusText,
                                        );
                                        artistPhotos[artistId] = {
                                            artistthumbs: {},
                                        }; // todo: this is a bit weird...ugh this whople FUNCTION is weird. never trust me at a keyboard ever again
                                    }
                                }
                            }
                        } catch (err) {
                            console.error(
                                `Error fetching images for artist ID ${artistId}:`,
                                err,
                            );
                        }
                    }),
                );
            }

            console.log("Final artist meta:", artistPhotos);
            console.log("Final song pool:", songPool);

            overlayEl?.remove();

            // begin shuffling thru songs in the song pool
            // begin render loop...cycle every 30 seconds

            // in my analysis of music choice screen recordings ive found that the broadcast will cycle once every 30.033 seconds
            renderLoopId = setInterval(() => {
                render();
            }, CYCLE_SECONDS * 1000);

            let hasDoneInitialRender = false;

            while (true) {
                 playlistGeneration = [ ...songPool ]; // copy playlist to new generation

                while (playlistGeneration.length != 0) {
                    // Pick a random song and set it as the current song
                    const pickedIndex = Math.floor(Math.random() * playlistGeneration.length);
                    currentSong = songPool[pickedIndex];

                    // Play it!
                    let player = new Audio(currentSong.mediaUrl);
                    player.play();

                    // Remove this selection from the playlist generation
                    playlistGeneration.splice(pickedIndex, 1);

                    // if we haven't run the initial render yet, do it
                    if (!hasDoneInitialRender) {
                        render();
                        hasDoneInitialRender = true;
                    }

                    // Wait for completion
                    await new Promise((resolve) => {
                        player.onended = resolve;
                    })
                }

                console.log(`Playlist generation ${playlistGenerationCount} has completed`);
            }
        } else {
            loadingText =
                "Broadcast configuration error. Please contact your cable provider.";
        }
    });

    function handleKeyPressed(event: KeyboardEvent) {
        if (event.key == "r") {
            // force render
            clearTimeout(renderLoopId);
            render();
        } else if (event.key == "d") {
            // toggle debug
            isDebugVisible = !isDebugVisible;
        }
    }
</script>

<svelte:window on:keydown={handleKeyPressed} />

<div class="loadingOverlay" bind:this={overlayEl}>
    <img src="/logo-fancy.gif" alt="Melodic Decision" height="128" />
    <p>{loadingText}</p>
</div>

{#if isDebugVisible}
    <div class="debugOverlay">
        <p><b>melodic decision debug info</b></p>
        <p>current song: {JSON.stringify(currentSong)}</p>
        <p>cycle: {cycles}</p>
        <p>layout type: V: {verticalLayout}, H: {horizontalLayout}</p>
        <p>
            cycles until horiz switch: {cyclesUntilHorizontalSwitch} ({cyclesUntilHorizontalSwitch *
                CYCLE_SECONDS})
        </p>
        <p>
            cycles until verti switch: {cyclesUntilVerticalSwitch} ({cyclesUntilVerticalSwitch *
                CYCLE_SECONDS})
        </p>
        <p>
            cycles until color switch: {cyclesUntilPrimaryColorSwitch} ({cyclesUntilPrimaryColorSwitch *
                CYCLE_SECONDS})
        </p>
        <p>playlist generation #{playlistGenerationCount}</p>
        <p>remaining: {playlistGeneration.length}/{songPool.length} ({Math.round(playlistGeneration.length / songPool.length)}%)</p>
    </div>
{/if}

<div class="broadcast-viewport">
    <div class="stage">
        <div
            class="stage-inner"
            class:reverse={verticalLayout === "top-details"}
        >
            <div
                class="pictureRow"
                class:reverse={horizontalLayout === "right-picture"}
            >
                <div class="photo">
                    <img
                        src={visiblePhotoMode == "generic"
                            ? "/generic.png"
                            : visiblePhoto}
                        alt="artist"
                    />
                </div>
                <div class="didYouKnow">
                    <div class="title">
                        <p>
                            {data.playlist?.style.didYouKnowOverride ||
                                "DID YOU KNOW?"}
                        </p>
                    </div>
                    <div class="content">
                        <p>{visibleDidYouKnowFact.content}</p>
                    </div>
                </div>
            </div>

            <div class="detailRow">
                <div class="playlist-name">
                    {data.playlist?.displayName || data.playlist?.name || "???"}
                </div>
                <div class="songInfo">
                    <div class="logo">
                        <img
                            src="/logo-transparent.png"
                            height="48"
                            alt="Logo"
                        />
                    </div>
                    <div class="details">
                        <p>{visibleSongInfo.artist}</p>
                        <p>"{visibleSongInfo.title}"</p>
                        <p>
                            {visibleSongInfo.album} ({visibleSongInfo.releaseYear})
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    :root {
        --primary-color: #ff0000;
        --text-color: #a3a3a3;
    }

    .loadingOverlay {
        position: absolute;
        inset: 0; /* fills the positioned parent (.aspect) only */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10;
        background-color: rgb(50, 0, 0);
        color: var(--text-color);
    }

    .debugOverlay {
        position: absolute;
        top: 0;
        right: 0;
        padding: 8px;
        z-index: 11;
        background-color: rgba(0, 0, 0, 0.8);
        background-image: url("/logo-transparent.png");
        background-repeat: no-repeat;
        background-size: 256px;
        background-position: center center;
        background-blend-mode: darken;

        color: white;
        font-size: 12px;
        font-family: monospace;
        max-width: 30vw;
        max-height: 50vh;
        overflow: auto;
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    /* center the stage in the viewport */
    .broadcast-viewport {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9;
        background-color: #0d0d0d;
        color: white;
    }

    /* STAGE: keeps a 4:3 aspect and computes a uniform scale from a 640x480 baseline */
    .stage {
        /* stage width is the smaller of viewport width or 4/3 * viewport height */
        --stage-width: min(100vw, calc((100vh * 4) / 3));
        --scale: calc(var(--stage-width) / 640px);

        width: var(--stage-width);
        /* compute height from width to keep 4:3 */
        height: calc(var(--stage-width) * 3 / 4);
        position: relative;
        overflow: hidden;
    }

    /* inside is a fixed 640x480 canvas that gets uniformly scaled */
    .stage-inner {
        width: 640px; /* baseline design width */
        height: 480px; /* baseline design height */
        transform-origin: top left;
        transform: scale(var(--scale));
        position: relative;
        background-color: transparent;

        /* ADDED: ensure any overflowing content is clipped inside the canvas */
        overflow: hidden;
        box-sizing: border-box;

        /* ADDED: make the inner canvas a column flex container so DOM order controls top/bottom */
        display: flex;
        flex-direction: column;
    }

    /* when .reverse is present, swap top/bottom */
    .stage-inner.reverse {
        flex-direction: column-reverse;
    }

    /* contains artist photo and did you know (baseline 336px high) */
    .pictureRow {
        width: 100%;
        height: 336px; /* baseline */
        background-color: #0d0d0d;
        display: flex;
        flex-direction: row;
        flex: none; /* do not stretch */
    }

    /* picture portion is 380 px on the original 4:3 broadcast */
    .pictureRow .photo {
        width: 380px;
        height: 100%;
        overflow: hidden;
    }

    .pictureRow .photo img {
        /* CHANGED: give the image explicit dimensions so object-fit works,
           make it fill the container and crop if necessary */
        width: 100%;

        height: 100%;
        object-fit: cover;
        display: block; /* removes inline gap/descender issues */
    }

    .pictureRow .didYouKnow {
        flex: 1;
        margin-top: 16px;
        margin-left: 8px;
        box-sizing: border-box;
    }

    .pictureRow .didYouKnow .title {
        margin: 0;
        font-size: 24px; /* baseline */
        text-transform: uppercase;
        color: var(--primary-color);
    }

    .pictureRow .didYouKnow .content {
        margin-top: 14px;
        font-size: 16px; /* baseline */
        color: var(--text-color);
    }

    .pictureRow.reverse {
        flex-direction: row-reverse;
    }

    /* contains currently playing song (baseline 144px high) */
    .detailRow {
        width: 100%;
        height: 144px; /* baseline */
        background-color: #0d0d0d;

        /* REMOVED: absolute positioning so DOM order determines whether this row is top or bottom */
        /* position: absolute;
		bottom: 0; */

        display: flex;
        flex-direction: column;
        flex: none; /* do not stretch — keep baseline height */

        border-bottom: #a3a3a3 4px;
    }

    .detailRow .playlist-name {
        background-color: var(--primary-color);
        color: #000000;
        font-size: 24px; /* baseline */
        font-weight: normal;
        padding-left: 16px;
        text-transform: uppercase;
        height: 24px; /* optional baseline height for the name bar */
        display: flex;
        align-items: center;
    }

    /* UPDATED: use baseline spacing (6px) and font (14px). scaling is handled by stage transform. */
    .detailRow .songInfo {
        display: flex;
        flex-direction: row;
        gap: 6px; /* baseline */
        margin-left: 16px;
        flex: 1;
        align-items: center;
    }

    .detailRow .songInfo p {
        margin: 0;
        line-height: 1.3;
        color: var(--text-color);
        font-size: 14px; /* baseline */
        font-weight: normal;
        padding-left: 16px;
    }

    /* ensure did-you-know and song info also wrap gracefully */
    .pictureRow .didYouKnow .content p,
    .detailRow .songInfo p {
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
    }
</style>
