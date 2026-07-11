<script lang="ts">
    import { MDSourceType } from "$lib/types";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let newSource = $state("");
</script>

<div class="hero-row">
    <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
    <div>
        <h2>Source Configuration</h2>
        <p>
            Melodic Decision requires media sources to be defined in order to
            build playlists. You can define sources here.
        </p>
    </div>
</div>

<table class="source-table">
    <thead>
        <tr>
            <th>Source</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#each data.sources || [] as source}
            <tr>
                <td>{source.type}: {source.name}</td>
                <td>
                    <button>Edit</button>
                    <button>Delete</button>
                </td>
            </tr>
        {/each}
        <tr>
            <td colspan="2">
                <form method="POST" class="new-source-form">
                    <input type="text" name="name" placeholder="Source Name" required />
                    <select name="type" id="type">
                        <option value={MDSourceType.LocalFolder}>Local Folder</option>
                        <option value={MDSourceType.Jellyfin}>Jellyfin</option>
                    </select>
                    <input type="text" name="config" placeholder="Source Config (JSON)" required />
                    <button type="submit">Add Source</button>
                </form>
            </td>
        </tr>
    </tbody>
</table>

<style>
    .source-table {
        width: 100%;
        border-collapse: collapse;
    }

    .source-table th,
    .source-table td {
        border: 1px solid #ddd;
        padding: 4px;
    }

    .source-table th {
        background-color: #f2f2f2df;
        text-align: left;
    }

    .new-source-form {
        display: flex;
        gap: 8px;
    }

    .new-source-form input,
    .new-source-form select {
        flex: 1;
    }
</style>
