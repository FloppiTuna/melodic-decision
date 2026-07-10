<script lang="ts">
    let { data } = $props();
    
</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>{data.playlist?.name || "Unnamed Playlist?"}</h2>
            <p>{data.playlist?.displayName || "Unnamed Playlist?"}</p>
        </div>
    </div>
</div>