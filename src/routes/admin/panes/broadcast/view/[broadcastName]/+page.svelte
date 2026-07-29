<script lang="ts">
    let { data } = $props();

    let activeTab = $state("overview");
</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>{data.broadcast?.name}</h2>
            <p>{data.broadcast?.displayName}</p>
        </div>
    </div>

    <!-- tabs -->
    <div class="tabs">
        <button class:active={activeTab === "overview"} onclick={() => activeTab = "overview"}>Overview</button>
        <button class:active={activeTab === "playlist"} onclick={() => activeTab = "playlist"}>Playlist</button>
        <button class:active={activeTab === "style"} onclick={() => activeTab = "style"}>Style</button>
        <button class:active={activeTab === "advertising"} onclick={() => activeTab = "advertising"}>Advertising</button>
        <button class:active={activeTab === "live"} onclick={() => activeTab = "live"}>Live Management</button>
    </div>
    
    <div>
        {#if activeTab === "overview"}
            <p>Overview content goes here.</p>
        {:else if activeTab === "playlist"}
            <p>Playlist content goes here.</p>
        {:else if activeTab === "style"}
            <p>Current style: {data.broadcastStyle?.designVariant}</p> 
        {:else if activeTab === "advertising"}
            <p>Enable campaigns here.</p>
        {:else if activeTab === "live"}
            <p>Live Management content goes here.</p>
        {/if}
    </div>

</div>

<style>
    .tabs {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .tabs button {
        padding: 8px 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .tabs button.active {
        background-color: #007BFF;
        font-weight: bold;
    }

    
</style>
