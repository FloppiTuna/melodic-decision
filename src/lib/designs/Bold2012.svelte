<script lang="ts">
    import createDOMPurify from "dompurify";

    import { onMount } from "svelte";

    let { currentSong, playlist, artistFacts, artistLikenesses } = $props();
    let purify = createDOMPurify(window);

    let visiblePhotoMode: "generic" | "artist" = $state("generic");
    let visiblePhoto = $state("/generic.png");

    let visibleFactMode: "ad" | "fact" = $state("fact");
    let visibleFact = $state("<i>FACT TEXT</i> <b>FACT TEXT</b> <u>FACT TEXT</u> <a href='https://example.com'>FACT TEXT</a>");
    let visibleAd = $state("");
    
    let visibleSongInfo = $state({
        title: "",
        artist: "",
        album: "",
        releaseYear: 0,
    });

    let verticalLayout = $state("picture-detail"); // from top to bottom
    let horizontalLayout = $state("picture-dyk"); // from left to right
    let barStyle = $state("inverted"); // inverted or normal

    const CYCLE_SECONDS = 30.033; // 1 cycle = 30.033 secs.
    let cycles = $state(0);

    function randCyclesBetweenMinutes(minMinutes: number, maxMinutes: number) {
        const minSeconds = minMinutes * 60;
        const maxSeconds = maxMinutes * 60;
        const seconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
        return Math.ceil(seconds / CYCLE_SECONDS);
    }
    
    let cyclesUntilHorizontalSwitch = $state(randCyclesBetweenMinutes(1, 5));
    let cyclesUntilVerticalSwitch = $state(randCyclesBetweenMinutes(2, 8));
    let cyclesUntilPrimaryColorSwitch = $state(randCyclesBetweenMinutes(4, 28));
    
    let cyclesUntilBarStyleSwitch = $state(randCyclesBetweenMinutes(1, 5)); // inversion status

    let cyclesUntilAdSwitch = $state(randCyclesBetweenMinutes(1, 5)); // ad/fact status
    function render() {
        cycles++;
        cyclesUntilHorizontalSwitch--;
        cyclesUntilVerticalSwitch--;
        cyclesUntilPrimaryColorSwitch--;
        cyclesUntilBarStyleSwitch--;
        cyclesUntilAdSwitch--;

        // Time for a horizontal layout switch?
        if (cyclesUntilHorizontalSwitch <= 0) {
            horizontalLayout = horizontalLayout === "picture-dyk" ? "dyk-picture" : "picture-dyk";
            cyclesUntilHorizontalSwitch = randCyclesBetweenMinutes(1, 5);
        }

        // Time for a vertical layout switch?
        if (cyclesUntilVerticalSwitch <= 0) {
            verticalLayout = verticalLayout === "picture-detail" ? "detail-picture" : "picture-detail";
            cyclesUntilVerticalSwitch = randCyclesBetweenMinutes(2, 8);
        }

        // Time for a primary color switch?
        if (cyclesUntilPrimaryColorSwitch <= 0) {
            const colors = [
                "#FF1FAD",
                "#00D9FD",
                "#FFE500",
                "#15D991"
            ] // temp until i have these stored in the db somewhere maybe idk
            const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            let newColor = currentColor;
            while (newColor === currentColor) {
                newColor = colors[Math.floor(Math.random() * colors.length)];
            }
            document.documentElement.style.setProperty('--primary-color', newColor);
            cyclesUntilPrimaryColorSwitch = randCyclesBetweenMinutes(4, 28);
        }

        // Time for a bar style switch?
        if (cyclesUntilBarStyleSwitch <= 0) {
            barStyle = barStyle === "inverted" ? "normal" : "inverted";
            cyclesUntilBarStyleSwitch = randCyclesBetweenMinutes(1, 5);
        }

        // Time for an ad/fact switch?
        if (cyclesUntilAdSwitch <= 0) {
            if (visibleFactMode === "fact") {
                visibleFactMode = "ad";
                visibleAd = "/kids1.png"; // TODO: pick a random ad from the pool
                cyclesUntilAdSwitch = 1;
            } else {
                visibleFactMode = "fact";
                cyclesUntilAdSwitch = randCyclesBetweenMinutes(1, 5);
            }
        }

        // update visible song information for this cycle
        visibleSongInfo = {
            title: currentSong.title,
            artist: currentSong.artistName,
            album: currentSong.albumTitle,
            releaseYear: currentSong.releaseYear,
        };

        // pick a random fact (TODO: respect attached pools or wtever)
        const facts = artistFacts[currentSong.artistName] || [];
        if (facts.length > 0) {
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            visibleFact = randomFact;
            visibleFactMode = "fact";
        } else {
            visibleFact = "Fact unavailable.";
        }

        // pick a random likeness
        console.log(`artistLikenesses:`, artistLikenesses);
        const likenesses = artistLikenesses[currentSong.artistName] || [];
        if (likenesses.length > 0) {
            const randomLikeness = likenesses[Math.floor(Math.random() * likenesses.length)];
            visiblePhoto = randomLikeness;
            visiblePhotoMode = "artist";
        } else {
            visiblePhoto = "/generic.png";
            visiblePhotoMode = "generic";
        }
    }

    onMount(() => {
        const interval = setInterval(render, CYCLE_SECONDS * 1000);
        return () => clearInterval(interval);
    });

    let debugOpen = $state(false);
    function handleSpecialKey(event: KeyboardEvent) {
        if (event.key === "r") {
            render();
        } else if (event.key === "d") {
            debugOpen = !debugOpen;
        }
    }

</script>

<svelte:window on:keydown={handleSpecialKey} />

<div class="debug-panel" class:open={debugOpen}>
    <p>Bold2012 debugging panel - press d to close</p>
    <p>layout info</p>
    <table>
        <tbody>
            <tr>
                <td>Current song (visible):</td>
                <td>{visibleSongInfo.title} by {visibleSongInfo.artist} from {visibleSongInfo.album} ({visibleSongInfo.releaseYear})</td>
            </tr>
            <tr>
                <td>Current song (actual):</td>
                <td>{currentSong.title} by {currentSong.artistName} from {currentSong.albumTitle} ({currentSong.releaseYear})</td>
            </tr>
            <tr>
                <td>Visible photo mode:</td>
                <td>{visiblePhotoMode}</td>
            </tr>
            <tr>
                <td>Visible photo:</td>
                <td>{visiblePhoto}</td>
            </tr>
            <tr>
                <td>Visible fact mode:</td>
                <td>{visibleFactMode}</td>
            </tr>
            <tr>
                <td>Visible fact:</td>
                <td>{@html purify.sanitize(visibleFact, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] })}</td>
            </tr>
            <tr>
                <td>Visible ad:</td>
                <td>{visibleAd}</td>
            </tr>
            <tr>
                <td>Vertical layout:</td>
                <td>{verticalLayout}</td>
            </tr>
            <tr>
                <td>Horizontal layout:</td>
                <td>{horizontalLayout}</td>
            </tr>
            <tr>
                <td>Bar style:</td>
                <td>{barStyle}</td>
            </tr>
        </tbody>
    </table>

    <p>cycle info</p>
    <table>
        <tbody>
            <tr>
                <td>Cycles:</td>
                <td>{cycles}, {cycles * CYCLE_SECONDS} seconds </td>
            </tr>
            <tr>
                <td>Cycles to horiz switch:</td>
                <td>{cyclesUntilHorizontalSwitch}, {cyclesUntilHorizontalSwitch * CYCLE_SECONDS} seconds</td>
            </tr>
            <tr>
                <td>Cycles to vert switch:</td>
                <td>{cyclesUntilVerticalSwitch}, {cyclesUntilVerticalSwitch * CYCLE_SECONDS} seconds</td>
            </tr>
            <tr>
                <td>Cycles to color switch:</td>
                <td>{cyclesUntilPrimaryColorSwitch}, {cyclesUntilPrimaryColorSwitch * CYCLE_SECONDS} seconds</td>
            </tr>
            <tr>
                <td>Cycles to bar switch:</td>
                <td>{cyclesUntilBarStyleSwitch}, {cyclesUntilBarStyleSwitch * CYCLE_SECONDS} seconds</td>
            </tr>
            <tr>
                <td>Cycles to ad/fact switch:</td>
                <td>{cyclesUntilAdSwitch}, {cyclesUntilAdSwitch * CYCLE_SECONDS} seconds, switch to {visibleFactMode === "fact" ? "ad" : "fact"}</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="bold2012-root" class:reverse={verticalLayout === "detail-picture"}>
    <div class="picture-row" class:reverse={horizontalLayout === "dyk-picture"}>
        <div class="picture-container">
            {#if visiblePhotoMode === "generic"}
                <img src={visiblePhoto} alt="Melodic Decision logo" />
            {:else if visiblePhotoMode === "artist"}
                <img src={visiblePhoto} alt={currentSong.artistName} />
            {/if}
        </div>
        <div class="dyk-container" class:ad={visibleFactMode === "ad"}>
            {#if visibleFactMode === "fact"}
                <div class="dyk-title" class:inverted={barStyle === "inverted"}>
                    <p>DID YOU KNOW?</p>
                </div>
                <div class="dyk-content">
                    <p>{@html purify.sanitize(visibleFact, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] })}</p>
                </div>
            {:else if visibleFactMode === "ad"}
                <img src={visibleAd} alt="Advertisement" />
            {/if}
        </div>
    </div>
    <div class="detail-row">
        <div class="playlist-name" class:inverted={barStyle === "inverted"}>
            <p>{playlist.name}</p>
        </div>
        <div class="song-details">
            <div class="logo">
                <img
                    src="/logo-transparent.png"
                    alt="Logo"
                />
            </div>
            <div class="details">
                <p>{visibleSongInfo.artist}</p>
                <p>"{visibleSongInfo.title}"</p>
                <p>{visibleSongInfo.album} ({visibleSongInfo.releaseYear})</p>
            </div>
        </div>
    </div>
</div>

<style>
    :root {
        --primary-color: #00D9FD;
        --text-color: #a3a3a3;
    }

    .debug-panel {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        display: none;
        flex-direction: column;
        z-index: 1000;
        padding: 16px;
    }

    .debug-panel.open {
        display: flex;
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
        min-height: 0; /* important in flex layouts */
    }

    .picture-row .picture-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 0 0 59.375%;
        border-right: #a3a3a3 1px solid;
        border-left: none;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        flex-shrink: 1;
    }

    .picture-row .picture-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
    }

    .picture-row.reverse {
        flex-direction: row-reverse;
    }

    .picture-row.reverse .picture-container {
        border-right: none;
        border-left: #a3a3a3 1px solid;
        overflow: hidden;
        flex-grow: 0;
    }

    .picture-row .picture-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .picture-row .dyk-container {
        flex: 0 0 40.625%;
        display: flex;
        /* padding: 16px; */
        box-sizing: border-box;
        margin-top: 72px; /* TODO: randomize this? */
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
    }

    .picture-row .dyk-container.ad {
        margin-top: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    .picture-row .dyk-container.ad img {
        width: 100%;
        height: 100%;
        object-fit: fill;
        display: block;
    }

    .picture-row .dyk-container .dyk-title  {
        width: 100%;
        padding: 0;
        margin: 0;
        font-size: 3rem;
        text-transform: uppercase;
        flex: 0 0 auto;

    }

    .picture-row .dyk-container .dyk-title p {
        margin: 0;
        padding-left: 16px;
        display: inline-block;
        width: 100%;
        line-height: 1;
        background-color: var(--primary-color);
        color: black;
    }

    .picture-row .dyk-container .dyk-title.inverted p {
        background-color: black;
        color: var(--primary-color);
        border-top: #808080 1px solid;
        border-bottom: #808080 1px solid;
    }

    .picture-row .dyk-container .dyk-content {
        width: 100%;
        padding: 16px;
        box-sizing: border-box;
        font-size: 1.5rem;
        margin-top: 0px;
        color: var(--text-color);
        overflow: hidden;
        flex: 1;
        min-height: 0; /* allow flexbox to shrink this div */
        overflow-wrap: anywhere;
    }

    .picture-row .dyk-container .dyk-content p {
        margin: 0;
        line-height: 1.2;
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
        color: var(--text-color);
        flex: .2;
        text-transform: uppercase;
        color: #000000;
        align-items: center;
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
    }

    .detail-row .playlist-name p {
                align-items: center;
        display: flex;
        height: 100%;
        width: 100%;
        margin: 0;
        line-height: 1;
        font-size: 6vh;

    }

    .detail-row .playlist-name.inverted {
        background-color: black;
        color: var(--primary-color);
        border-top: #a3a3a3 1px solid;
        border-bottom: #a3a3a3 1px solid;

    }

    .detail-row .song-details {
        color: var(--text-color);
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: 48px;
        flex: .83333;
        gap: 32px;
    }

    .detail-row .song-details .logo img {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        height: 72px;
    }

    .detail-row .song-details .details p {
        margin: 0;
        font-size: 24px;
        line-height: 1.3;
    }
</style>
