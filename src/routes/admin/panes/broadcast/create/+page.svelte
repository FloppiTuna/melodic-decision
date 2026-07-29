<script>
    let { form } = $props();

    let name = $state("");
    let displayName = $state("");
    let associatedPlaylist = $state("");
</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>Broadcast Creator</h2>
            <p>
                Fill in the form below to create a new broadcast.
            </p>
        </div>
    </div>

    <form method="POST">
        <label for="name">Name</label>
        <input bind:value={name} type="text" id="name" name="name" placeholder="Enter a name for the broadcast" required />

        <label for="displayName">Display Name</label>
        <input bind:value={displayName} type="text" id="displayName" name="displayName" placeholder="Enter a display name for the broadcast" />

        <label for="associatedPlaylist">Associated Playlist</label>
        <input bind:value={associatedPlaylist} type="number" id="associatedPlaylist" name="associatedPlaylist" placeholder="Enter the ID of the associated playlist" />
        <button type="submit">Create Broadcast</button>
    </form>

    {#if form?.success}
        <p>Broadcast created.</p>
    {/if}
</div>