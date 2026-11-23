<script lang="ts">
    import { page } from "$app/state";

    let { data, form } = $props();

    let activeTab = $state("overview");

    let newFact = $state("");
</script>

<div class="hero-row">
    <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
    <div>
        <h2>{data.artist?.name}</h2>
        <p>This artists has {data.albums.length} album(s) in this library.</p>
    </div>
</div>

<div>
    <div class="tabs">
        <button
            class:active={activeTab === "overview"}
            onclick={() => (activeTab = "overview")}>Overview</button
        >
        <button
            class:active={activeTab === "facts"}
            onclick={() => (activeTab = "facts")}>Facts</button
        >
    </div>

    <div>
        {#if activeTab === "overview"}
            <p>Overview content goes here.</p>
        {:else if activeTab === "facts"}
            {#if data.artistFacts}
                <p>Fact pool: {data.artistFacts.name}</p>
                <p>Facts in this pool: {data.artistFacts.facts.length}</p>
                {#if form?.success}
                    <p>Fact added.</p>
                {:else if form?.error}
                    <p>{form.error}</p>
                {/if}

                <table class="fact-pool-table">
                    <thead>
                        <tr>
                            <th>Fact</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.artistFacts?.facts || [] as fact}
                            <tr>
                                <td>{fact.text}</td>
                                <td>
                                    <button>Edit</button>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        {/each}
                        <tr>
                            <td colspan="2">
                                <form method="POST" action="?/createFact" class="new-fact-form">
                                    <input
                                        type="text"
                                        id="newFact"
                                        name="newFact"
                                        bind:value={newFact}
                                        placeholder="New fact..."
                                        required
                                    />
                                    <button type="submit">Add</button>
                                </form>
                            </td>
                        </tr>
                    </tbody>
                </table>
            {:else}
                <p>No fact pool is associated with this artist.</p>
            {/if}
        {/if}
    </div>
</div>
