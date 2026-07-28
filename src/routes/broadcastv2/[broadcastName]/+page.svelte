<script lang="ts">    
    import Ascii1998 from "$lib/designs/Ascii1998.svelte";
    import Bold2012 from "$lib/designs/Bold2012.svelte";
    import type { EvaluatedPlaylistQuery } from "$lib/playlists.js";
    import { MDDesignVariant } from "$lib/types";
    
    let { data } = $props();

    let loadState = $state("Please wait...");
    let errorState = $state("");

    let broadcastStyle = $state({
        aspectRatio: "4:3",
        design: "modern2011",
    });

    let playlistGeneration = []; // should these be states idk im bad at frontend siiiigh
    let playlistGenerationIndex = -1;

    let currentSong = $state({
        title: "",
        artistName: "",
        albumTitle: "",
        releaseYear: 1984,
    });
    
    let player: HTMLAudioElement;

    async function combineEvaluatedQueries(queries: EvaluatedPlaylistQuery[]) {
        const combined = [];
        for (const query of queries) {
            if (query.rows && query.rows.length > 0) {
                combined.push(...query.rows);
            }
        }
        console.debug(`Combined evaluated queries into a single playlist with ${combined.length} songs.`);
        console.debug(`Combined playlist:`, combined);
        return combined;
    }

    async function playPlaylist() {
        const combinedPlaylist = await combineEvaluatedQueries(data.evaluatedQueries);

        playlistGeneration = [ ...combinedPlaylist ]; // create a copy of the combined playlist for this generation
        playlistGenerationIndex++;

        console.log(`Starting playlist playback... generation ${playlistGenerationIndex}, ${playlistGeneration.length} songs.`);
        while (playlistGeneration.length > 0) {
            const randomIndex = Math.floor(Math.random() * playlistGeneration.length);
            const song = playlistGeneration.splice(randomIndex, 1)[0];
            currentSong = song;
            
            if (!song) continue;

            console.log(`Playing song: ${song.title} by ${song.artistName} from album ${song.albumTitle} (${song.releaseYear})`);
            const audio = new Audio(`/media/${song.id}`);
            audio.play();

            await new Promise<void>((resolve) => {
                audio.onended = () => resolve();
            });
        }
    }

    $effect(() => {
        if (loadState == "READY") return;
        if (!data?.playlist) return;

        if (data?.playlist) {
            loadState = `Applying broadcast style configuration...`;

            broadcastStyle.aspectRatio = data.broadcastStyle?.aspectRatio || "4:3";
            broadcastStyle.design = data.broadcastStyle?.designVariant || MDDesignVariant.Bold2012;

            if (broadcastStyle.aspectRatio === "16:9") {
                document.documentElement.style.setProperty(
                    "--aspect-width",
                    "16"
                );
                document.documentElement.style.setProperty(
                    "--aspect-height",
                    "9"
                );
            } else {
                document.documentElement.style.setProperty(
                    "--aspect-width",
                    "4"
                );
                document.documentElement.style.setProperty(
                    "--aspect-height",
                    "3"
                );
            }

            if (data.evaluatedQueries.length > 0) {
                loadState = `Creating first playlist generation and starting the broadcast...`;
                loadState = `READY`;
                playPlaylist();
            } else {
                loadState = `Playlist is empty.`;
                errorState = `The Melodic Decision control server could not locate any content for the playlist: BLAHBLAH. If you are an operator for this network's Melodic Decision channels, please check the playlist configuration and ensure that the playlist has valid queries and content. If you are a viewer, please contact your provider for assistance.`;
            }
        } else {
            loadState = `An error has occurred while loading the playlist.`;
            errorState = `The Melodic Decision control server could not locate the playlist: BLAHBLAH. If you are an operator for this network's Melodic Decision channels, please check the playlist configuration and ensure that the playlist exists and is accessible. If you are a viewer, please contact your provider for assistance.`;
        }
    });
</script>

{#if loadState !== "READY"}
    <div class="loadingOverlay">
        <!-- hero thing or whatever ai loves to call it -->
        <div class="header">
            <img
                class="logo"
                src="/logo.png"
                alt="Melodic Decision Logo"
                height="128"
            />
            <div class="loading-details">
                <h2>Melodic Decision</h2>
                <p><i>{loadState}</i></p>
            </div>
        </div>

        <!-- error -->
        {#if errorState}
            <div class="error">
                <p>{errorState}</p>
                <p>1-800-555-1234 todo: replace with global configurable service contact information</p>
            </div>
        {/if}

        <!-- footer for copyright -->
        <div class="footer">
            <p>
                Copyright &copy; 2026 Melodic Decision. All rights reserved. Do
                not distribute this software.
            </p>
            <p>PLAYLIST {data.playlist?.name || "Unknown Playlist"}</p>
        </div>
    </div>
{/if}



<div class="broadcast-viewport">
    <svelte:boundary onerror={(e) => {
        console.error(`Error in broadcast renderer for ${broadcastStyle.design}:`, e);
        //loadState = `An error has occurred while rendering the broadcast.`;
        //errorState = `The Melodic Decision control server encountered an error while rendering the broadcast for the playlist: ${data.playlist?.name || "Unknown Playlist"}. If you are an operator for this network's Melodic Decision channels, please check the playlist configuration and ensure that the playlist has valid queries and content. If you are a viewer, please contact your provider for assistance.`;
    }}>
        {#if loadState === "READY"}
            {#if broadcastStyle.design === MDDesignVariant.Bold2012}
                <Bold2012 currentSong={currentSong} playlist={data.playlist} artistFacts={data.artistFacts} artistLikenesses={data.artistLikenesses} />
            {:else if broadcastStyle.design === MDDesignVariant.Ascii1998}
                <Ascii1998 currentSong={currentSong} playlist={data.playlist} />
            {:else}
                <!-- fallback for unknown broadcast designs -->
                <p>Unknown broadcast design: {broadcastStyle.design}...</p>
                <p>{data.playlist?.name || "Unknown Playlist"}</p>
                <p>{currentSong?.title || "Unknown Song"}</p>
            {/if}
        {/if}
    </svelte:boundary>
</div>





<style>
    :root {
        --aspect-width: 4;
        --aspect-height: 3;
    }

    .loadingOverlay {
        position: absolute;
        inset: 0; /* fills the positioned parent (.aspect) only */
        display: flex;
        z-index: 10;
        background-image: url("/loader_bg.png");
        background-size: cover;
        background-position: center;
    }

    .loadingOverlay .header {
        position: absolute;
        top: 32px;
        left: 32px;
        right: 32px;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px 28px;
        background-color: rgba(0, 0, 0, 0.6);
    }

    .loadingOverlay .header .logo {
        margin: 0;
        flex-shrink: 0;
    }

    .loadingOverlay .header .loading-details {
        display: flex;
        flex-direction: column;
        color: #f5f5f5;
        gap: 16px;
    }

    .loadingOverlay .header .loading-details h2 {
        margin: 0;
        font-size: 28px;
        line-height: 1.1;
        letter-spacing: 0.04em;
        color: #ffffff;
    }

    .loadingOverlay .header .loading-details p {
        margin: 0;
        font-size: 15px;
        line-height: 1.4;
        color: #d7d7d7;
    }

    .loadingOverlay .error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(255, 0, 0, 0.8);
        color: #ffffff;
        padding: 16px 24px;
        text-align: center;
    }


    .loadingOverlay .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        padding-bottom: 8px;
        color: #d7d7d7;
    }
</style>
