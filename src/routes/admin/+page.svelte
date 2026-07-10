<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>General Configuration · Melodic Decision Administration</title>
</svelte:head>

<div class="page-shell">
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>Melodic Decision</h2>
            <p>
                Select an option from the left-hand menu to configure this MD server.
            </p>
        </div>
    </div>
</div>

<style>
    .page-shell {
        display: grid;
        gap: 20px;
    }
</style>