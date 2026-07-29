<script>
    let { form } = $props();

    let name = $state("");
    let displayName = $state("");
</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>Advertisement Campaign Creator</h2>
            <p>
                Fill in the form below to create a new advertisement campaign.
            </p>
        </div>
    </div>

    <form method="POST">
        <label for="name">Name</label>
        <input bind:value={name} type="text" id="name" name="name" placeholder="Enter a name for the advertisement campaign" required />

        <label for="displayName">Display Name</label>
        <input bind:value={displayName} type="text" id="displayName" name="displayName" placeholder="Enter a display name for the advertisement campaign" />

        <button type="submit">Create Campaign</button>
    </form>

    {#if form?.success}
        <p>Campaign created.</p>
    {/if}
</div>