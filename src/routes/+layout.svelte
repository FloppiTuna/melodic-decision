<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
  <title>Melodic Decision Broadcast</title>
</svelte:head>

<style lang="postcss">
  :global(body) {
    background-color: black;
    font-family: "Helvetica Neue Heavy";
  }

  /* define Helvetica Neue Heavy */
  @font-face {
    font-family: 'Helvetica Neue Heavy';
    src: url('/fonts/HelveticaNeueHeavy.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
</style>

{@render children()}
