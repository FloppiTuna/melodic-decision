<script lang="ts">
    import createDOMPurify from "dompurify";

    import { onMount } from "svelte";

    let { currentSong, playlist, artistFacts, artistLikenesses, advertisementCampaignsWithMedia, designOptions = {}, onDebugInfoChange = () => {}, associatedFactPools = [] } = $props();
    let purify = createDOMPurify(window);
    const artistImageUrls: string[] = [...new Set(
        Object.entries(artistLikenesses || {}).flatMap(([, urls]) =>
            Array.isArray(urls)
                ? urls.filter((url): url is string => typeof url === "string")
                : []
        )
    )];
    const advertisementCampaigns = Array.isArray(advertisementCampaignsWithMedia)
        ? advertisementCampaignsWithMedia as { media?: { mediaPath?: unknown }[] }[]
        : [];
    const advertisementImageUrls: string[] = [...new Set(
        // im lazy leave me alone
        advertisementCampaigns.flatMap((campaign) =>
            (campaign.media || [])
                .map((media) => media.mediaPath)
                .filter((url): url is string => typeof url === "string")
        )
    )];

    let visiblePhotoMode: "generic" | "artist" = $state("generic");
    let visiblePhoto = $state("/generic.png");

    let visibleFactMode: "ad" | "fact" = $state("fact");
    let visibleFact = $state("You're listening to Melodic Decision");
    let visibleAd = $state("");
    
    let visibleSongInfo = $state({
        title: "I Believe In A Thing Called Love",
        artist: "The Darkness",
        album: "Permission to Land",
        releaseYear: 2003,
    });

    let verticalLayout = $state("picture-detail"); // from top to bottom
    let horizontalLayout = $state("picture-dyk"); // from left to right
    let barStyle = $state("inverted"); // inverted or normal

    let CYCLE_SECONDS = $state(30); // 1 cycle = 30.033 secs.
    let cycles = $state(0);

    function randCyclesBetweenMinutes(minMinutes: number, maxMinutes: number) {
        const minSeconds = minMinutes * 60;
        const maxSeconds = maxMinutes * 60;
        const seconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
        return Math.ceil(seconds / CYCLE_SECONDS);
    }
    
    let cyclesUntilHorizontalSwitch = $state(0);
    let cyclesUntilVerticalSwitch = $state(0);
    let cyclesUntilPrimaryColorSwitch = $state(0);
    
    let cyclesUntilBarStyleSwitch = $state(0); // inversion status

    let cyclesUntilAdSwitch = $state(0); // ad/fact status
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
            console.log(advertisementCampaignsWithMedia);
            if (visibleFactMode === "fact") {
                const randomAdCampaign = advertisementCampaignsWithMedia[Math.floor(Math.random() * advertisementCampaignsWithMedia.length)];
                console.log(`Switching to ad mode. Random ad campaign:`, randomAdCampaign);
                if (randomAdCampaign && randomAdCampaign.media && randomAdCampaign.media.length > 0) {
                    const randomMedia = randomAdCampaign.media[Math.floor(Math.random() * randomAdCampaign.media.length)];
                    visibleAd = randomMedia.mediaPath;
                }
                visibleFactMode = "ad";
                cyclesUntilAdSwitch = 1;
            } else {
                visibleFactMode = "fact";
                cyclesUntilAdSwitch = randCyclesBetweenMinutes(1, 5);
            }
        }

        // pick a random fact (TODO: respect attached pools or wtever)
        // uhh i kinda just moved this here for now cuz of the ad switching thing is htere a btter way ti do this siigh

        const facts = artistFacts[currentSong.artistName] || [];
        if (facts.length > 0) {
            if (Math.random() < .6) {
                const randomFact = facts[Math.floor(Math.random() * facts.length)];
                visibleFact = randomFact;
            } else {
                // todo: refactor this 
                const allAssociatedFacts = associatedFactPools.flatMap(pool => pool.facts || []);
                if (allAssociatedFacts.length > 0) {
                    const randomFact = allAssociatedFacts[Math.floor(Math.random() * allAssociatedFacts.length)];
                    visibleFact = randomFact.text;
                } else {
                    visibleFact = "You're listening to Melodic Decision"; // fallback
                }
            }
        } else {
            // random fact from one of the associated fact pools
            const allAssociatedFacts = associatedFactPools.flatMap(pool => pool.facts || []);
            if (allAssociatedFacts.length > 0) {
                const randomFact = allAssociatedFacts[Math.floor(Math.random() * allAssociatedFacts.length)];
                visibleFact = randomFact.text;
            } else {
                visibleFact = "You're listening to Melodic Decision"; // fallback
            }
        }

        // update visible song information for this cycle
        visibleSongInfo = {
            title: currentSong.title,
            artist: currentSong.artistName,
            album: currentSong.albumTitle,
            releaseYear: currentSong.releaseYear,
        };



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

        onDebugInfoChange({
            visiblePhotoMode,
            visiblePhoto,
            visibleFactMode,
            visibleFact,
            visibleAd,
            visibleSongInfo,
            verticalLayout,
            horizontalLayout,
            barStyle,
            cycles,
            cyclesUntilHorizontalSwitch,
            cyclesUntilVerticalSwitch,
            cyclesUntilPrimaryColorSwitch,
            cyclesUntilBarStyleSwitch,
            cyclesUntilAdSwitch,
        });
    }

    onMount(() => {
        console.log(associatedFactPools);
        console.log(`designOptions:`, designOptions);
        CYCLE_SECONDS = designOptions["cycle-duration"] || 30;
        
        cyclesUntilHorizontalSwitch = randCyclesBetweenMinutes(
            designOptions["minimum-cycles-until-horizontal-switch"] || 1,
            designOptions["maximum-cycles-until-horizontal-switch"] || 5
        );
        cyclesUntilVerticalSwitch = randCyclesBetweenMinutes(
            designOptions["minimum-cycles-until-vertical-switch"] || 2,
            designOptions["maximum-cycles-until-vertical-switch"] || 8
        );
        cyclesUntilPrimaryColorSwitch = randCyclesBetweenMinutes(
            designOptions["minimum-cycles-until-primary-color-switch"] || 4,
            designOptions["maximum-cycles-until-primary-color-switch"] || 28
        );
        cyclesUntilBarStyleSwitch = randCyclesBetweenMinutes(
            designOptions["minimum-cycles-until-bar-style-switch"] || 1,
            designOptions["maximum-cycles-until-bar-style-switch"] || 5
        );
        cyclesUntilAdSwitch = randCyclesBetweenMinutes(
            designOptions["minimum-cycles-until-advertisement-switch"] || 1,
            designOptions["maximum-cycles-until-advertisement-switch"] || 5
        );
        const interval = setInterval(render, CYCLE_SECONDS * 1000);
        return () => clearInterval(interval);
    });
    
    // initial render
    setTimeout(render, 1000); // wait a second to let the song info load before rendering

</script>

<div class="bold2012-root" class:reverse={verticalLayout === "detail-picture"}>
    <div class="picture-row" class:reverse={horizontalLayout === "dyk-picture"}>
        <div class="picture-container">
            <img class="preloaded-image" class:visible={visiblePhoto === "/generic.png"} src="/generic.png" alt="Melodic Decision logo" loading="eager" />
            {#each artistImageUrls as imageUrl}
                <img class="preloaded-image" class:visible={visiblePhoto === imageUrl} src={imageUrl} alt={currentSong.artistName} loading="eager" />
            {/each}
        </div>
        <div class="dyk-container" class:ad={visibleFactMode === "ad"}>
            {#if visibleFactMode === "fact"}
                <div class="dyk-title" class:inverted={barStyle === "inverted"}>
                    <p>DID YOU KNOW?</p>
                </div>
                <div class="dyk-content">
                    <p>{@html purify.sanitize(visibleFact, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'] })}</p>
                </div>
            {:else if visibleFactMode === "ad"}
                {#each advertisementImageUrls as imageUrl}
                    <img class="preloaded-image" class:visible={visibleAd === imageUrl} src={imageUrl} alt="Advertisement" loading="eager" />
                {/each}
            {/if}
        </div>
    </div>
    <div class="detail-row">
        <div class="playlist-name" class:inverted={barStyle === "inverted"}>
            <p>{playlist.displayName || playlist.name}</p>
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

    .bold2012-root {
        width: 100%;
        height: 100%;
        background-color: black;
        color: white;
        display: flex;
        flex-direction: column;
        container-type: size;
        overflow: hidden;
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

    .preloaded-image {
        display: none !important;
    }

    .preloaded-image.visible {
        display: block !important;
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
        box-sizing: border-box;
        margin-top: 6cqw;
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
        font-size: 4.5cqw;
        text-transform: uppercase;
        flex: 0 0 auto;

    }

    .picture-row .dyk-container .dyk-title p {
        margin: 0;
        padding-left: 1.333cqw;
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
        padding: 1.333cqw;
        box-sizing: border-box;
        font-size: 2.25cqw;
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
        padding-left: 5.333cqw;
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
        font-size: 5cqw;
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
        padding-left: 4cqw;
        flex: .83333;
        gap: 2.667cqw;
        min-width: 0;
        overflow: hidden;
    }

    .detail-row .song-details .logo img {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        height: 6cqw;
        max-width: 20cqw;
        object-fit: contain;
    }

    .detail-row .song-details .details {
        min-width: 0;
        overflow: hidden;
    }

    .detail-row .song-details .details p {
        margin: 0;
        font-size: 2cqw;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
