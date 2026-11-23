<script lang="ts">
    import { page } from "$app/state";

    let { data } = $props();

    let activeTab = $state("overview");
</script>

<div class="hero-row">
    <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
    <div>
        <h2>{data.artist?.name}</h2>
        <p>This artists has {data.albums.length} album(s) in this library.</p>
    </div>
</div>

<div>

    <div class="tabs">
        <button class:active={activeTab === "overview"} onclick={() => activeTab = "overview"}>Overview</button>
        <button class:active={activeTab === "facts"} onclick={() => activeTab = "facts"}>Facts</button>
    </div>
    
    <div>
        {#if activeTab === "overview"}
            <p>Overview content goes here.</p>
        {:else if activeTab === "facts"}
            {#if data.artistFacts}
                <p>Fact pool: {data.artistFacts.name}</p>
                <p>Facts in this pool: {data.artistFacts.facts.length}</p>
            {:else}
                <p>No fact pool is associated with this artist.</p>
            {/if}
        {/if}
    </div>


</div>