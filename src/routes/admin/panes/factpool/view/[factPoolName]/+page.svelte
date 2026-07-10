<script lang="ts">
    let { data, form } = $props();

    let newFact = $state("");
</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>{data.factPool?.name || "Unnamed Fact Pool?"}</h2>
            <p>{data.factPool?.description || "No description yet."}</p>
        </div>
    </div>

    <table class="fact-pool-table">
        <thead>
            <tr>
                <th>Fact</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each data.factPool?.facts || [] as fact}
                <tr>
                    <td>{fact.text}</td>
                    <td>
                        <button>Edit</button>
                        <button >Delete</button>
                    </td>
                </tr>
            {/each}
            <tr>
                <td colspan="2">
                    <form method="POST" class="new-fact-form">
                        <input type="text" id="newFact" name="newFact" bind:value={newFact} placeholder="New fact..." />
                        <button type="submit">Add</button>
                    </form>
                </td>
            </tr>
        </tbody>
    </table>

</div>

<style>
    .fact-pool-table {
        width: 100%;
        border-collapse: collapse;
    }

    .fact-pool-table th,
    .fact-pool-table td {
        border: 1px solid #ddd;
        padding: 4px;
    }

    .fact-pool-table th {
        background-color: #f2f2f2df;
        text-align: left;
    }

    .new-fact-form {
        display: flex;
        gap: 8px;
    }

    .new-fact-form input {
        flex: 1;
    }
</style>