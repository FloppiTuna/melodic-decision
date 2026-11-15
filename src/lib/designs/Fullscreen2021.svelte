<script lang="ts">
    import { onMount } from "svelte";

    let {
        currentSong,
        playlist,
        artistFacts,
        artistLikenesses,
        advertisementCampaignsWithMedia,
        designOptions = {},
    } = $props();

    let CYCLE_SECONDS = $state(30);
    let cycles = $state(0);

    let visibleSongInfo = $state({
        title: "",
        artist: "",
        album: "",
        releaseYear: 0,
    });

    function render() {
        cycles += 1;
        visibleSongInfo.title = currentSong.title;
        visibleSongInfo.artist = currentSong.artistName; // TODO: im going to hell cuz of how inconsistent i am with how i name shit bro istg pls fix htis someday
        visibleSongInfo.album = currentSong.albumTitle; // see??
        visibleSongInfo.releaseYear = currentSong.releaseYear;
        console.log(currentSong);
    }

    onMount(() => {
        CYCLE_SECONDS = designOptions["cycle-duration"] || 30;

        const cycleInterval = setInterval(render, CYCLE_SECONDS * 1000);
    });

    setTimeout(render, 1000);
</script>

<main class="fullscreen2021-root">
    <!-- In Fullscreen2021, the image takes up the full background layer, with the infobar on top of it. -->
    <div class="background"></div>

    <!-- The info bar is a semi-transparent overlay that displays information about the current song and playlist. -->
    <div class="info-bar">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div class="info-bar-content">
            <div class="playlist-name">
                <p>{playlist.displayName}</p>
            </div>

            <div class="song-info">
                <p>{visibleSongInfo.artist}</p>
                <p>"{visibleSongInfo.title}"</p>
                <p>{visibleSongInfo.album} ({visibleSongInfo.releaseYear})</p>
            </div>
        </div>
        <!-- in Comcast/Xfinity environments (and probably others), the infobar contains a blurb about invoking the channel using voice commands -->
        <div class="voice-cta">
            <div class="just-say">
                <p>🎤 Just Say:</p>
            </div>
            <div class="phrase">
                <p>"{playlist.displayName}<br/>on Melodic Decision"</p>
            </div>
        </div>
    </div>
</main>

<style>
    .fullscreen2021-root {
        width: 100%;
        height: 100%;
        background-color: rgb(69, 59, 59);
        color: white;
        display: flex;
        flex-direction: column;

        /* this design uses Graphik Compact */
        font-family: "Graphik Compact", sans-serif;
    }

    .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("/loader_bg.png");
        background-size: cover;
        background-position: center;
    }

    .info-bar {
        position: absolute;
        bottom: 0;
        width: calc(100% - 56px);
        background-color: rgba(0, 0, 0, 1);
        height: 145px;
        margin: 28px;
        margin-bottom: 42px;
        display: flex;
        align-items: center;
    }

    .info-bar .info-bar-content {
        display: flex;
        flex-direction: column;
        margin-left: 28px;
        height: 100%;
        
    }

    .info-bar .info-bar-content .playlist-name p {
        margin: 0;
        font-size: 2rem;
        font-weight: bolder;
        font-family: "Graphik Compact", sans-serif;
        margin-top: 0;
    }

    .info-bar .info-bar-content .song-info p {
        margin: 0;
        font-size: 1.5rem;
        color: #d1d1d1;
    }

    .info-bar .voice-cta {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-left: auto;
        margin-right: 28px;
        font-family: "Graphik Compact", sans-serif;
        text-align: left;
        height: 100%;
        margin-right: 7.2rem;
    }
    
    .info-bar .voice-cta .just-say p {
        font-size: 2rem;
        font-weight: bolder;
        color: #25C3FD;
    }

    .info-bar .voice-cta .phrase p {
        font-size: 1.5rem;
        color: #d1d1d1;
    }

    .info-bar .voice-cta .just-say,
    .info-bar .voice-cta .phrase {
        margin: 0;
    }

    .info-bar .voice-cta p {
        margin: 0;
    }
</style>
