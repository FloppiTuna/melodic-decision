<script lang="ts">
    let { form } = $props();

    let name = $state("");
    let description = $state("");
</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>Factpool Creator</h2>
            <p>
                Fill in the form below to create a new fact pool.
            </p>
        </div>
    </div>

    <form method="POST">
        <label for="name">Name</label>
        <input bind:value={name} type="text" id="name" name="name" placeholder="Enter a name for the fact pool" required />

        <label for="description">Description</label>
        <input bind:value={description} type="text" id="description" name="description" placeholder="Enter a description for the fact pool" />

        <button type="submit">Create Fact Pool</button>
    </form>

    {#if form?.success}
        <p>Fact pool created.</p>
    {/if}
</div>