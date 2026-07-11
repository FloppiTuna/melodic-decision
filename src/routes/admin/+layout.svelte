<script lang="ts">
    import { page } from "$app/state";

    let { data, children } = $props();

    function isActive(path: string) {
        return page.url.pathname === path || page.url.pathname.startsWith(`${path}/`);
    }

    function playlistPath(name: string) {
        return `/admin/panes/playlist/view/${encodeURIComponent(name)}`;
    }

    function factPoolPath(name: string) {
        return `/admin/panes/factpool/view/${encodeURIComponent(name)}`;
    }
</script>

<svelte:head>
    <title>Melodic Decision Administration</title>
</svelte:head>

<div class="admin-root">
    <aside class="tree-view" aria-label="Administration tree">
        <nav>
            <ul class="tree">
                <li>
                    <a class:active={isActive("/admin/panes/config/general")} href="/admin/panes/config/general">
                        General Configuration
                    </a>
                </li>

                <li>
                    <a class:active={isActive("/admin/panes/config/sources")} href="/admin/panes/config/sources">
                        Source Configuration
                    </a>
                </li>

                <li>
                    <details open>
                        <summary>
                            <span>Playlists</span>
                            <small>{data.playlists.length}</small>
                        </summary>

                        <ul class="tree-children">
                            <li>
                                <a class:active={isActive("/admin/panes/playlist/create")} class="positive" href="/admin/panes/playlist/create">
                                    Create New Playlist
                                </a>
                            </li>

                            {#each data.playlists as playlist}
                                <li>
                                    <a
                                        class:active={page.url.pathname === playlistPath(playlist.name)}
                                        href={playlistPath(playlist.name)}
                                    >
                                        {playlist.displayName || playlist.name}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    </details>
                </li>

                <li>
                    <details open>
                        <summary>
                            <span>Fact Pools</span>
                            <small>{data.factPools.length}</small>
                        </summary>

                        <ul class="tree-children">
                            <li>
                                <a class:active={isActive("/admin/panes/factpool/create")} class="positive" href="/admin/panes/factpool/create">
                                    Create New Fact Pool
                                </a>
                            </li>

                            {#each data.factPools as factPool}
                                <li>
                                    <a
                                        class:active={page.url.pathname === factPoolPath(factPool.name)}
                                        href={factPoolPath(factPool.name)}
                                    >
                                        {factPool.name}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    </details>
                </li>
            </ul>
        </nav>
    </aside>

    <main class="content-view">
        {@render children()}
    </main>
</div>

<style>
    :global(body) {
        background-color: #f0f0f0;
        margin: 16px;
        font-family: Helvetica, Arial, sans-serif;
    }

    .admin-root {
        display: flex;
        flex-direction: row;
        gap: 16px;
        min-height: calc(100vh - 32px);
    }

    .tree-view,
    .content-view {
        background-color: #e0e0e0;
        border: 1px solid #9e9e9e;
        box-shadow: inset 3px 3px 6px #bcbcbc, inset -3px -3px 6px #ffffff;
        /* height: calc(100vh - 32px); */
        overflow: auto;
    }

    .tree-view {
        flex: 0 0 300px;
        padding: 16px;
        font-size: 14px;
    }

    .content-view {
        flex: 1;
        padding: 20px;
    }
    
    .tree,
    .tree-children {
        list-style: none;
        padding: 0;
        margin: 16px 0 0;
    }

    .tree {
        display: grid;
        gap: 10px;
    }

    .tree > li {
        display: grid;
        gap: 8px;
    }

    .tree a,
    summary {
        display: block;
        border: 1px solid #9e9e9e;
        background: linear-gradient(180deg, #f7f7f7, #d7d7d7);
        color: #222;
        border-radius: 6px;
        padding: 4px 12px;
        text-decoration: none;
        cursor: pointer;
    }

    .tree a.active {
        background: linear-gradient(180deg, #d6e7ff, #bcd6ff);
        border-color: #6b8fbf;
    }

    :global(.tree a.positive) {
        background: linear-gradient(180deg, #ecf9ee, #ccefd2);
        border-color: #67a56c;
        color: #184d1f;
    }

    :global(.tree a.positive.active) {
        background: linear-gradient(180deg, #d6efda, #bde3c3);
        border-color: #4f9155;
    }

    :global(.tree a.negative) {
        background: linear-gradient(180deg, #fdeeee, #f8d2d2);
        border-color: #c36b6b;
        color: #681f1f;
    }

    :global(.tree a.negative.active) {
        background: linear-gradient(180deg, #f7d9d9, #efbcbc);
        border-color: #b24e4e;
    }

    summary {
        list-style: none;
    }

    summary::-webkit-details-marker {
        display: none;
    }

    summary span {
        font-weight: 700;
    }

    summary small {
        float: right;
        color: #555;
    }

    .tree-children {
        margin-left: 12px;
        padding-left: 12px;
        border-left: 2px solid #b2b2b2;
        display: grid;
        gap: 8px;
    }

    @media (max-width: 900px) {
        .admin-root {
            flex-direction: column;
        }

        .tree-view,
        .content-view {
            height: auto;
            min-height: 0;
        }

        .tree-view {
            flex-basis: auto;
        }
    }

    :global(.hero-row) {
        display: flex;
        gap: 16px;
        align-items: center;
    }

    :global(.hero-row) h2,
    :global(.hero-row) p {
        margin: 0;
    }
</style>