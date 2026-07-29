<script lang="ts">
    let { data } = $props();

    let newMediaName = $state("");
</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>{data.advertisementCampaign?.name || "Unnamed Advertisement Campaign?"}</h2>
            <p>{data.advertisementCampaign?.displayName || "No description yet."}</p>
        </div>
    </div>

    <table class="fact-pool-table">
        <thead>
            <tr>
                <th>Media</th>
                <th>Preview</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each data.advertisementCampaignMedia || [] as media}
                <tr>
                    <td>{media.name}</td>
                    <td>
                        <img src={media.mediaPath} alt={media.name} height="150" />
                    </td>
                    <td>
                        <button>Edit</button>
                        <!-- <button formaction="?/deleteMedia" formmethod="post">
                            <input type="hidden" name="mediaId" value={media.id} />
                            Delete
                        </button> -->
                        <form method="POST" action="?/deleteMedia">
                            <input type="hidden" name="mediaId" value={media.id} />
                            <button type="submit">Delete</button>
                        </form>
                    </td>
                </tr>
            {/each}
            <tr>
                <td colspan="2">
                    <form method="POST" class="new-media-form" action="?/addMedia" enctype="multipart/form-data">
                        <input type="text" id="newMediaName" name="newMediaName" bind:value={newMediaName} placeholder="New media name" />
                        <input type="file" id="newMediaFile" name="newMediaFile" />
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