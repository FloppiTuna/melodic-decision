<script lang="ts">    
    import Ascii1998 from "$lib/designs/Ascii1998.svelte";
    import Bold2012 from "$lib/designs/Bold2012.svelte";
    import Fullscreen2021 from "$lib/designs/Fullscreen2021.svelte";
    import type { EvaluatedPlaylistQuery } from "$lib/playlists.js";
    import { MDDesignVariant } from "$lib/types";
    import { onDestroy } from "svelte";

    let { data } = $props();

    let loadState = $state("Please wait...");
    let errorState = $state("");
    let preloadProgress = $state({ loaded: 0, total: 0 });

    let broadcastStyle = $state({
        aspectRatio: "4:3",
        design: "modern2011",
        designOptions: {} as Record<string, boolean | string | number>,
    });

    let playlistGeneration = []; // should these be states idk im bad at frontend siiiigh
    let playlistGenerationIndex = -1;

    let currentSong = $state({
        title: "Loading...",
        artistName: "Loading...",
        albumTitle: "Loading...",
        releaseYear: 1984,
    });

    let player: HTMLAudioElement = $state(null);
    let resolveCurrentSong: (() => void) | undefined;
    let playbackPaused = $state(false);

    let debugMode = $state(false);
    let designDebugInfo = $state<Record<string, unknown>>({});

    let playbackStarted = false;
    let playbackCancelled = false;
    let loadingStarted = false;

    function preloadImage(url: string, onComplete: () => void) {
        return new Promise<void>((resolve) => {
            const image = new Image();
            let completed = false;
            const complete = () => {
                if (completed) return;
                completed = true;
                onComplete();
                resolve();
            };

            image.onload = complete;
            image.onerror = () => {
                console.error(`Error preloading image: ${url}`);
                complete();
            };
            image.src = url;

            // Cached images may already be complete before the handlers run.
            if (image.complete) complete();
        });
    }

    async function preloadImages() {
        const imageUrls = new Set<string>([
            "/generic.png",
            "/logo-transparent.png",
            "/logo.png",
            "/loader_bg.png",
        ]);

        for (const likenesses of Object.values(data.artistLikenesses || {})) {
            for (const likeness of likenesses || []) {
                if (likeness) imageUrls.add(likeness);
            }
        }

        for (const campaign of data.advertisementCampaignsWithMedia || []) {
            for (const media of campaign.media || []) {
                if (media.mediaPath) imageUrls.add(media.mediaPath);
            }
        }

        preloadProgress = { loaded: 0, total: imageUrls.size };
        loadState = `Preloading images (0/${imageUrls.size})...`;

        await Promise.all([...imageUrls].map((url) => preloadImage(url, () => {
            preloadProgress.loaded += 1;
            loadState = `Preloading images (${preloadProgress.loaded}/${preloadProgress.total})...`;
        })));
    }

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
        while (!playbackCancelled && playlistGeneration.length > 0) {
            const randomIndex = Math.floor(Math.random() * playlistGeneration.length);
            const song = playlistGeneration.splice(randomIndex, 1)[0];
            currentSong = song;
            
            if (!song) continue;

            console.log(`Playing song: ${song.title} by ${song.artistName} from album ${song.albumTitle} (${song.releaseYear})`);
            player = new Audio(`/media/${song.id}`);
            player.onplay = () => playbackPaused = false;
            player.onpause = () => playbackPaused = true;

            try {
                await player.play();
            } catch (error) {
                console.error(`Error playing song ${song.title}:`, error); //todo: error reporting somehow idk
                continue; // skip to the next song
            }

            await new Promise<void>((resolve) => {
                resolveCurrentSong = resolve;
                console.log(`Waiting for song to finish: ${song.title}`);
                player.onended = () => { 
                    playbackPaused = false;
                    resolveCurrentSong = undefined;
                    console.log(`Song ended: ${song.title}`);
                    resolve(); 
                };
            });

            if (playbackCancelled) return;
        }
    }

    async function startPlaybackOnce() {
        if (playbackStarted) return;

        playbackStarted = true;
        await playPlaylist();
    }

    $effect(() => {
        if (loadingStarted || loadState == "READY") return;
        if (!data) return;
        loadingStarted = true;

        void (async () => {
            try {
            if (!data.playlist) {
                loadState = `An error has occurred while loading the playlist.`;
                errorState = `The Melodic Decision control server could not locate the playlist: ${data.broadcast?.name || "Unknown Broadcast"}. If you are an operator for this network's Melodic Decision channels, please check the broadcast configuration and ensure that it has an associated playlist. If you are a viewer, please contact your provider for assistance.`;
                return;
            }

            loadState = `Applying broadcast style configuration...`;

            broadcastStyle.aspectRatio = data.broadcastStyle?.aspectRatio || "4:3";
            broadcastStyle.design = data.broadcastStyle?.designVariant || MDDesignVariant.Bold2012;
            broadcastStyle.designOptions = data.broadcastStyle?.designOptions || {};

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
                await preloadImages();
                loadState = `READY`;
                startPlaybackOnce();
            } else {
                loadState = `Playlist is empty.`;
                errorState = `The Melodic Decision control server could not locate any content for the playlist: BLAHBLAH. If you are an operator for this network's Melodic Decision channels, please check the playlist configuration and ensure that the playlist has valid queries and content. If you are a viewer, please contact your provider for assistance.`;
            }
            } catch (error) {
                console.error("Error while loading broadcast:", error);
                loadState = `An error has occurred while loading the playlist.`;
                errorState = `The Melodic Decision control server encountered an error while loading the broadcast. Please contact your provider for assistance.`;
            }
        })();
    });

    function handleSpecialKey(event: KeyboardEvent) {
        if (event.key === "s") {
            console.log("SKIP");
            player?.pause();
            playbackPaused = true;
            resolveCurrentSong?.();
            resolveCurrentSong = undefined;
        } else if (event.key === "d") {
            debugMode = !debugMode;
        }
    }

    onDestroy(() => {
        playbackCancelled = true;
        player?.pause();
        player?.removeAttribute("src");
        player?.load();
        resolveCurrentSong?.();
        resolveCurrentSong = undefined;
    });
</script>

<svelte:window onkeydown={(e) => handleSpecialKey(e)} />

{#if playbackPaused}
    <div class="alert-overlay">
        <p>PLAYBACK PAUSED</p>
    </div>
{/if}

{#if debugMode}
    <div class="debug-overlay">
        <pre>current song: {JSON.stringify(currentSong, null, 2)}</pre>
        <pre>in playlist generation {playlistGenerationIndex}, with {playlistGeneration.length} songs remaining</pre>
        <pre>{broadcastStyle.design} renderer state: {JSON.stringify(designDebugInfo, null, 2)}</pre>
        <pre>{broadcastStyle.design} configuration: {JSON.stringify(broadcastStyle.designOptions, null, 2)}</pre>
    </div>
{/if}

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
                {#if preloadProgress.total > 0}
                    <progress value={preloadProgress.loaded} max={preloadProgress.total}></progress>
                    <p>{preloadProgress.loaded} of {preloadProgress.total} images ready</p>
                {/if}
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
                <Bold2012 currentSong={currentSong} playlist={data.playlist} artistFacts={data.artistFacts} artistLikenesses={data.artistLikenesses} advertisementCampaignsWithMedia={data.advertisementCampaignsWithMedia} designOptions={broadcastStyle.designOptions} onDebugInfoChange={(info: Record<string, unknown>) => designDebugInfo = info} />
            {:else if broadcastStyle.design === MDDesignVariant.Ascii1998}
                <Ascii1998 currentSong={currentSong} playlist={data.playlist} designOptions={broadcastStyle.designOptions} />
            {:else if broadcastStyle.design === MDDesignVariant.Fullscreen2021}
                <Fullscreen2021 currentSong={currentSong} playlist={data.playlist} artistFacts={data.artistFacts} artistLikenesses={data.artistLikenesses} advertisementCampaignsWithMedia={data.advertisementCampaignsWithMedia} designOptions={broadcastStyle.designOptions} />
            {:else}
                <p>Unsupported design variant: {broadcastStyle.design}</p>
            {/if}
        {/if}
    </svelte:boundary>
</div>





<style>
    :root {
        --aspect-width: 4;
        --aspect-height: 3;
    }

    .debug-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 16px;
        z-index: 1000;
    }

    .alert-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 0, 0, 0.7);
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2rem;
        z-index: 1000;
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
