<script>
    import MDTabView from "$lib/components/MDTabView.svelte";

</script>
<div class="hero-row">
    <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
    <div>
        <h2>General Configuration</h2>
        <p>
            Configure this MD server.
        </p>
    </div>
</div>

{#snippet Server()}
    <p>Ordinarially this would be where server configuration options are displayed.</p>
{/snippet}


<MDTabView items={[
    {
        label: "Server",
        content: Server
    },
    {
        label: "Database",
        content: null
    },
    {
        label: "Authentication",
        content: null
    }
]} />