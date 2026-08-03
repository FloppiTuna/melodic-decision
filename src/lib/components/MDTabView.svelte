<script lang="ts">
    let { items = [] } = $props();
    let currentTab = $state(0);
</script>

<div>
    <!-- tabs -->
     <div class="tabs">
        {#each items as item, index}
            <button type="button" class="tab" onclick={() => currentTab = index} class:active={currentTab === index}>
                {item.label}
            </button>
        {/each}
     </div>

    <!-- content -->
    <div class="content">
        {#snippet MissingError(label: string)}
            <p class="errortext">Missing content for tab {currentTab}: {label}</p>
        {/snippet}

        {#if !items[currentTab]?.content}
            {@render MissingError(items[currentTab]?.label)}
        {:else}
            {@render items[currentTab]?.content()}
        {/if}
    </div> 
</div>

<style>
    .errortext {
        color: red;
    }


    .tabs .tab {
        height: 24px;
        cursor: pointer;
    }

    .tabs .tab.active {
        font-weight: bold;
        background-color: #D2E4FF;
    }
</style>