<script lang="ts">
    import { page } from "$app/state";

    let { data } = $props();
</script>

<div class="hero-row">
    <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
    <div>
        <h2>Artists</h2>
        <p>The artists that are part of the library.</p>
    </div>
</div>

<div>
    <table class="artist-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Tracks</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each data.artists || [] as artist}
                <tr>
                    <td>{artist.name}</td>
                    <td>{data.albums.filter((album) => album.artistId === artist.id).length}</td>
                    <td>
                        <a href={`/admin/panes/library/artists/${artist.id}`}>View</a>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>