<script>
    let { currentSong, playlist } = $props();
</script>

<div class="ascii1998-root">
    <div class="header">
        <div class="header-left">
            <!-- in ref this is the dolby logo -->
            <!-- <img src="/images/dolby.png" alt="Dolby Digital Audio" /> -->
            <!-- placeholder 4 now -->
            <img src="/dolby-transparent.png" alt="MD 1998" />
        </div>

        <div class="header-ident">
            <p>NOW PLAYING</p>
            <p>A 24</p>
            <p>{playlist.displayName || "NOT AVAILABLE"}</p>
        </div>

        <div class="header-right">
            <!-- MD logo, 1998 style -->
            <!-- placeholser 4 now sigh -->
            <img src="/Music_Choice_1st_Logo.png" alt="MD 1998" />
        </div>
    </div>

    <div class="content">
        <p>"{currentSong.title?.toUpperCase() || "NOT AVAILABLE"} "</p>
        <p>By: {currentSong.artistName?.toUpperCase() || "NOT AVAILABLE"}</p>
        <p>CD: {currentSong.albumTitle?.toUpperCase() || "NOT AVAILABLE"}</p>
        <p>On: {currentSong.id}</p>
        <p>Notice: Visit www.melodicdecision.com for CDs and more</p>
    </div>
</div>

<style>
    @font-face {
        font-family: "Pixel Operator";
        src: url("/fonts/PixelOperator.ttf") format("truetype");
    }

    .ascii1998-root {
        width: 100%;
        height: 100%;
        background-color: black;
        color: white;
        font-family: "Pixel Operator", monospace;
        display: flex;
        flex-direction: column;
        font-size: 3.4rem;
    }

    .content {
        color: #3535b4;
        line-height: .8;
        letter-spacing: 0.2rem;
        word-spacing: .6rem;
        padding-left: 48px;
        padding-right: 48px;
    }

    .content p:first-child {
        margin-top: 0;
    }

    .header {
        font-size: 3rem;
        margin-bottom: 0;
        justify-content: space-between;
        display: flex;
        width: 100%;
        
    }

    .header-left,
    .header-right {
        width: 20%;
    }

    .header-right {
        text-align: right;
    }

    .header-ident {
        line-height: 0.2;
        text-align: center;
        font-size: 100%;
    }

    .header-left img {
        width: 88px;
        margin: 48px;
    }

    .header-right img {
        width: 88px;
        margin: 48px;
    }

</style>
