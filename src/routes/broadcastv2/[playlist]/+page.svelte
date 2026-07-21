<script>
    let { data } = $props();

    let loadState = $state("Please wait...");
    let errorState = $state("");

    let broadcastStyle = $state({
        aspectRatio: "4:3",
        design: "modern2011",
    });

    $effect(() => {
        if (data?.playlist) {
            loadState = `Applying broadcast style configuration...`;

            broadcastStyle.aspectRatio = data.playlistStyle?.aspectRatio || "4:3";
            broadcastStyle.design = data.playlistStyle?.design || "modern2011";

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
                loadState = `READY`;
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

{#if loadState === "READY"}
    {#if broadcastStyle.design === "modern2011"}
        <p>true broadcasgt here soon yay</p>
    {/if}
{/if}







<style>
    :root {
        --primary-color: #ff0000;
        --text-color: #a3a3a3;

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
    }

    .artistGrid {
        display: grid;
        grid-template-columns: repeat(
            auto-fit,
            minmax(clamp(24px, 9vw, 88px), 1fr)
        );
        gap: 12px;
        width: 85%;
        max-width: 960px;
        /* margin-top: 24px; */
    }

    .artistSquare {
        aspect-ratio: 1 / 1;
        background-color: #1a1a1a;
        border: 2px solid var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .artistSquare img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .artistFallback {
        font-size: 12px;
        color: var(--text-color);
        text-align: center;
        padding: 2px;
        word-break: break-word;
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
        border-right: #a3a3a3 1px solid;
        border-left: none;
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
        /* todo: implement hollowed out titles ughhhh */
        /* background-color: var(--primary-color); */
    }

    .pictureRow .didYouKnow .title p {
        margin: 0;
        padding: 0;
        display: inline-block;
        width: 100%;
        line-height: 1;
        margin-left: -8px;
        width: calc(100% + 8px);
        border-top: #808080 1px solid;
        border-bottom: #808080 1px solid;
    }

    .pictureRow .didYouKnow .content {
        margin-top: 14px;
        font-size: 16px; /* baseline */
        color: var(--text-color);
    }

    .pictureRow.reverse {
        flex-direction: row-reverse;
    }

    .pictureRow.reverse .photo {
        border-right: none;
        border-left: #a3a3a3 1px solid;
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
