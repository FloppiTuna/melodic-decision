<script lang="ts">

</script>

<svelte:head>
	<!-- optional head changes -->
</svelte:head>

<div class="page-root">
	<div class="aspect">
		<slot />
	</div>
</div>

<style>
	:global(html, body, #svelte) {
		height: 100%;
		margin: 0;
	}

	.page-root {
		/* full-viewport letterbox area (acts as background/letterbox) */
		min-height: 100vh;
		min-width: 100vw;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--broadcast-letterbox, #111); /* letterbox color */
	}

	.aspect {
		/* enforce 4:3 aspect, scale to fit viewport */
		aspect-ratio: var(--aspect-width) / var(--aspect-height);
		/* choose the largest box that fits both width and height */
		width: min(
			100vw,
			calc(100vh * (var(--aspect-width) / var(--aspect-height)))
		);
		height: min(
			100vh,
			calc(100vw * (var(--aspect-height) / var(--aspect-width)))
		);
		max-width: 100%;
		max-height: 100%;
		background: var(--broadcast-stage, #fff); /* content background */
		box-sizing: border-box;
		overflow: auto; /* allow scrolling inside the aspect box if needed */
		position: relative; /* ADDED: confine absolutely positioned children to this box */
	}

	/* Make page content fill the aspect box */
	.aspect > :global(*) {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}
</style>
