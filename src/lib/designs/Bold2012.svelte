<script lang="ts">
    import createDOMPurify from "dompurify";

    let { currentSong, playlist } = $props();
    let purify = createDOMPurify(window);

    let visiblePhotoMode: "generic" | "artist" = "generic";
    let visiblePhoto = "/generic.png";

    let visibleFactMode: "ad" | "fact" = "fact";
    let visibleFact = "";
    let visibleAd = "";

    let verticalLayout = ""; // from top to bottom
    let horizontalLayout = "";
</script>

<div class="bold2012-root reverse">
    <div class="picture-row">
        <div class="picture-container">
            {#if visiblePhotoMode === "generic"}
                <img src={visiblePhoto} alt="Melodic Decision logo" />
            {:else if visiblePhotoMode === "artist"}
                <img src={visiblePhoto} alt={currentSong.artistName} />
            {/if}
        </div>
        <div class="dyk-container">
            {#if visibleFactMode === "fact"}
                <div class="dyk-title">
                    <p>DID YOU KNOW?</p>
                </div>
            {:else if visibleFactMode === "ad"}
                <p>{visibleAd}</p>
            {/if}
        </div>
    </div>
    <div class="detail-row">
        <div class="playlist-name">{playlist.name}</div>
        <div class="song-details">
            <p>{currentSong.artistName}</p>
            <p>"{currentSong.title}"</p>
            <p>{currentSong.albumTitle} ({currentSong.releaseYear})</p>
        </div>
    </div>
</div>

<style>
    :root {
        --primary-color: #00D9FD;
        --text-color: #a3a3a3;
    }

    .bold2012-root {
        width: 100%;
        height: 100%;
        background-color: black;
        color: white;
        display: flex;
        flex-direction: column;
    }

    .bold2012-root.reverse {
        flex-direction: column-reverse;
    }

    .picture-row {
        flex: .7;
        display: flex;
        flex-direction: row;
    }

    .picture-row .picture-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 0.59375;
        border-right: #a3a3a3 1px solid;
        border-left: none;
    }

    .picture-row.reverse {
        flex-direction: row-reverse;
    }

    .picture-row.reverse .picture-container {
        border-right: none;
        border-left: #a3a3a3 1px solid;
    }

    .picture-row .picture-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .picture-row .dyk-container {
        flex: 0.40625;
        display: flex;
        /* padding: 16px; */
        box-sizing: border-box;
        margin-top: 72px; /* TODO: randomize this? */

    }

    .picture-row .dyk-container .dyk-title  {
        width: 100%;
        padding: 0;
        margin: 0;
        font-size: 3rem;
        text-transform: uppercase;
        color: var(--primary-color);
    }

    .picture-row .dyk-container .dyk-title p {
        margin: 0;
        padding-left: 16px;
        display: inline-block;
        width: 100%;
        line-height: 1;
        border-top: #808080 1px solid;
        border-bottom: #808080 1px solid;
    }

    .detail-row {
        flex: .3;
        display: flex;
        flex-direction: column;
        border-top: none;
    }

    .bold2012-root.reverse .detail-row {
        border-bottom: #a3a3a3 1px solid;
    }

    .detail-row .playlist-name {
        background-color: var(--primary-color);
        padding-left: 64px;
        font-size: 3rem;
        color: var(--text-color);
        flex: .2;
        text-transform: uppercase;
        color: #000000;
        align-items: center;
        display: flex;
    }

    .detail-row .song-details {
        color: var(--text-color);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 48px;
        flex: .83333;
    }

    .detail-row .song-details p {
        margin: 0;
        font-size: 24px;
        line-height: 1.3;
    }
</style>
