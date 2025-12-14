<script lang="ts">
    import { onMount } from "svelte";
    import type { MDSong, MDSongPool } from "$lib/types";

    export let data; // playlist data

    let loadingText = "";
    let overlayEl: HTMLDivElement;
    let debugEl: HTMLDivElement;

    let songPool: MDSongPool = [];

    let currentSong: MDSong = {
        title: "",
        artist: "",
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

	let rowLayout = "top-picture";
    let pictureLayout = "left-picture";

	const LAYOUT_CHANGE_EVERY = 2; // TODO: make random; or need to figure out how it works on MC

	let cycles = 0;
	let cyclesSinceLastLayoutChange = 0;

    function render() {
        // this function is responsible for cycling through the various layouts, as well as updating song info, images, etc.
        
        // update song info display
        console.debug(`RENDER: currentSong =`, currentSong);
        visibleSongInfo = {
            title: currentSong?.title || "",
            artist: currentSong?.artist || "",
            album: currentSong?.album || "",
            releaseYear: currentSong?.releaseYear || 0,
        }

        // pick a random "did you know" fact from global database
        if (data?.didYouKnowGlobal && data.didYouKnowGlobal.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.didYouKnowGlobal.length);
            console.debug(`RENDER: selected DYK fact index ${randomIndex} ("${data.didYouKnowGlobal[randomIndex].text}")`);

            visibleDidYouKnowFact = { content: data.didYouKnowGlobal[randomIndex].text };
        } else {
            visibleDidYouKnowFact = { content: "" };
        }
        

        // layout cycling logic
		cycles++;
		cyclesSinceLastLayoutChange++;

		if (cyclesSinceLastLayoutChange >= LAYOUT_CHANGE_EVERY) {
			rowLayout = rowLayout === "top-picture" ? "top-details" : "top-picture";
			cyclesSinceLastLayoutChange = 0;
			console.debug('Horizontal layout toggled! rowLayout=', rowLayout);

            pictureLayout = pictureLayout === "left-picture" ? "right-picture" : "left-picture";
            console.debug('Picture layout toggled! pictureLayout=', pictureLayout);
		}

        return null;
    }


    // onMount(() => {
    onMount(async () => {
        if (data?.playlist) {
            loadingText = `Loading playlist "${data.playlist.name}"...`;

            // set css variables
            document.documentElement.style.setProperty(
                "--accent-color",
                data.playlist.style.primaryColor,
            );

            // process sources
            loadingText = `Processing sources...`;

            // WAIT for all source processors to finish
            await Promise.all(
                data.playlist.sources.map(async (source: any) => {
                    loadingText = `Processing sources... (${source.type})`;
                    if (!source.config) return;

                    if (source.type === "jellyfin") {
                        console.log(
                            "Initializing Jellyfin source with config:",
                            source.config,
                        );

                        try {
                            const res = await fetch(
                                `/api/music/fetchSongsJellyfin/${source.config.playlistId}`,
                            );
                            const songs = await res.json();

                            songs.Items.forEach((element: any) => {
                                songPool.push({
                                    title: element.Name,
                                    artist: (element.Artists || []).join(", "),
                                    album: element.Album,
                                    releaseYear: element.ProductionYear,
                                    mediaUrl: `/api/music/getSongJellyfin/${element.Id}`,
                                });
                            });
                        } catch (err) {
                            console.error("Error fetching songs from Jellyfin:", err);
                        }
                    }
                }),
            );

            // after songpool has been fully populated
            loadingText = `Finalizing playlist... (${songPool.length} songs)`;
            console.log("Final song pool:", songPool);

            overlayEl?.remove();

            // begin shuffling thru songs in the song pool
            // begin render loop...cycle every 30 seconds

            setInterval(() => {
                render();
            }, 30000); // every 30 seconds

            let hasDoneInitialRender = false;
            let lastSong = null;
            while (true) {
                const randomIndex = Math.floor(Math.random() * songPool.length);
                currentSong = songPool[randomIndex];

                // avoid repeating the same song twice in a row
                if (currentSong === lastSong) continue;
                lastSong = currentSong;

                let audio = new Audio(currentSong.mediaUrl);
                audio.play();

                if (!hasDoneInitialRender) {
                    render();
                    hasDoneInitialRender = true;
                }

                // wait for song to finish
                await new Promise((resolve) => {
                    audio.onended = resolve;
                });



            }
        } else {
            loadingText =
                "Broadcast configuration error. Please contact your cable provider.";
        }
    });
</script>

<div class="loadingOverlay" bind:this={overlayEl}>
	<img src="/logo.png" alt="Melodic Decision" height="128" />
	<p>{loadingText}</p>
</div>


<div class="debugOverlay" bind:this={debugEl}>
    <p><b>melodic decision debug info</b></p>
    <p>current song: {JSON.stringify(currentSong)}</p>
    <p>cycle: {cycles}</p>
    <p>layout type: {rowLayout} {pictureLayout}</p>
</div>

<div class="broadcast-viewport">
	<div class="stage">
		<div class="stage-inner" class:reverse="{rowLayout === 'top-details'}">
			<!-- render once, flip with CSS class -->
			<div class="pictureRow" class:reverse="{pictureLayout === 'right-picture'}">
				<div class="photo">
					<img src="/temp.jpg" alt="Artist Photo" />
				</div>
				<div class="didYouKnow">
					<div class="title">
						<p>{data.playlist?.style.didYouKnowOverride || "DID YOU KNOW?"}</p>
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
						<img src="/logo-transparent.png" height="48" alt="Logo" />
					</div>
					<div class="details">
						<p>{visibleSongInfo.artist}</p>
						<p>"{visibleSongInfo.title}"</p>
						<p>{visibleSongInfo.album} ({visibleSongInfo.releaseYear})</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:root {
		--accent-color: #ff0000;
		--text-color: #a3a3a3;

        --is-playlistBar-hollowed: false;
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
        background-image: url('/logo-transparent.png');
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
		background-color: #0D0D0D;
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
		background-color: #0D0D0D;
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
        color: var(--accent-color);
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
		background-color: #0D0D0D;

		/* REMOVED: absolute positioning so DOM order determines whether this row is top or bottom */
		/* position: absolute;
		bottom: 0; */

		display: flex;
		flex-direction: column;
		flex: none; /* do not stretch — keep baseline height */
	}

	.detailRow .playlist-name {
		background-color: var(--accent-color);
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
