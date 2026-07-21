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

    <table class="query-table">
        <thead>
            <tr>
                <th>Query</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each data.playlistQueries || [] as query}
                <tr>
                    <td>{query.query}</td>
                    <td>
                        <button>Edit</button>
                        <button>Delete</button>
                    </td>
                </tr>
            {/each}
            <tr>
                <td colspan="2">
                    <form
                        method="POST"
                        class="new-query-form"
                    >
                        <input
                            type="text"
                            name="query"
                            placeholder="Query"
                            required
                        />
                        <button type="submit">Add Query</button>
                    </form>
                </td>
            </tr>
        </tbody>
    </table>

    <p>{data.evaluatedQueries?.length || 0} queries evaluated</p>
    {#each data.evaluatedQueries || [] as evaluatedQuery}
        <div class="evaluated-query">
            <p><strong>{evaluatedQuery.query}</strong></p>
            {#if evaluatedQuery.error}
                <p class="error">{evaluatedQuery.error}</p>
            {:else}
                <p>{evaluatedQuery.rows.length} rows</p>
                <ul>
                    {#each evaluatedQuery.rows as row}
                        <li>{row.title}</li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/each}
</div>

<style>
    .query-table {
        width: 100%;
        border-collapse: collapse;
    }

    .query-table th,
    .query-table td {
        border: 1px solid #ddd;
        padding: 4px;
    }

    .query-table th {
        background-color: #f2f2f2df;
        text-align: left;
    }

    .new-query-form {
        display: flex;
        gap: 8px;
    }

    .new-query-form input {
        flex: 1;
    }

    .evaluated-query {
        margin-top: 12px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .error {
        color: #b91c1c;
    }
</style>