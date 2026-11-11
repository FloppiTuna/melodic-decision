<script lang="ts">
    import { MDDesignVariant } from "$lib/types";
    import type { MDDesignMetadata } from "$lib/designs";

    let { data, form } = $props();

    let activeTab = $state("overview");
    let selectedVariant = $state(data.broadcastStyle?.designVariant ?? MDDesignVariant.Bold2012);

    function metadataFor(variant: string): MDDesignMetadata | undefined {
        return data.designMetadata[variant as keyof typeof data.designMetadata] as MDDesignMetadata | undefined;
    }

    function optionValue(option: { id: string; defaultValue?: boolean | string | number }) {
        return data.broadcastStyle?.designOptions?.[option.id] ?? option.defaultValue ?? "";
    }



</script>

<div>
    <div class="hero-row">
        <img src="/logo.png" alt="Melodic Decision Logo" height="112" />
        <div>
            <h2>{data.broadcast?.name}</h2>
            <p>{data.broadcast?.displayName}</p>
        </div>
    </div>

    <!-- tabs -->
    <div class="tabs">
        <button class:active={activeTab === "overview"} onclick={() => activeTab = "overview"}>Overview</button>
        <button class:active={activeTab === "playlist"} onclick={() => activeTab = "playlist"}>Playlist</button>
        <button class:active={activeTab === "style"} onclick={() => activeTab = "style"}>Style</button>
        <button class:active={activeTab === "advertising"} onclick={() => activeTab = "advertising"}>Advertising</button>
        <button class:active={activeTab === "live"} onclick={() => activeTab = "live"}>Live Management</button>
    </div>
    
    <div>
        {#if activeTab === "overview"}
            <p>Overview content goes here.</p>
        {:else if activeTab === "playlist"}
            <p>Playlist content goes here.</p>
        {:else if activeTab === "style"}
            <p>Current style: {data.broadcastStyle?.designVariant}</p> 
            <p>Change the style of the broadcast:</p>
            <form method="POST" action="?/updateStyle">
                <select name="designVariant" bind:value={selectedVariant}>
                    {#each Object.entries(data.designMetadata) as [variant, metadata]}
                        <option value={variant}>
                            {metadata.name}
                        </option>
                    {/each}
                </select>
                {#if !metadataFor(selectedVariant)?.options }
                    <p>No options can be configured for the selected style.</p>
                {/if}
                {#each metadataFor(selectedVariant)?.options ?? [] as section}
                    <fieldset class="option-section">
                        <legend>{section.name}</legend>
                        <p class="description">{section.description}</p>
                        {#each section.options as option}
                            <div class="option">
                                <label for={option.id}>{option.name}</label>
                                <p>{option.description}</p>
                                {#if option.type === "boolean"}
                                    <input
                                        id={option.id}
                                        type="checkbox"
                                        name={`option:${option.id}`}
                                        checked={optionValue(option) === true}
                                    />
                                {:else if option.type === "select"}
                                    <select id={option.id} name={`option:${option.id}`}>
                                        {#each option.options ?? [] as value}
                                            <option value={value} selected={optionValue(option) === value}>{value}</option>
                                        {/each}
                                    </select>
                                {:else}
                                    <input
                                        id={option.id}
                                        type={option.type}
                                        name={`option:${option.id}`}
                                        value={String(optionValue(option))}
                                    />
                                {/if}
                            </div>
                        {/each}
                    </fieldset>
                {/each}
                <button type="submit">Save style</button>
            </form>
            {#if form?.success}
                <p>Style updated.</p>
            {:else if form?.error}
                <p>{form.error}</p>
            {/if}
            <p>Note: selecting a new style will discard the configuration of the current style.</p>
        {:else if activeTab === "advertising"}
            <p>Enable campaigns here.</p>
        {:else if activeTab === "live"}
            <p>Live Management content goes here.</p>
        {/if}
    </div>

</div>

<style>
    .tabs {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .tabs button {
        padding: 8px 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .tabs button.active {
        background-color: #007BFF;
        font-weight: bold;
    }

    .option-section {
        margin-top: 20px;
        padding: 10px;
        border: 1px solid #ccc;
    }

    .option-section legend {
        font-weight: bold;
    }

    .option-section .description {
        font-size: 0.9em;
        color: #666;
    }

    .option-section .option {
        margin-top: 10px;
    }
    
    .option-section .option label {
        display: block;
        font-weight: bold;
    }
    .option-section .option p {
        font-size: 0.9em;
        color: #666;
    }
</style>
