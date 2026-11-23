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

  :global(.tabs) {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  :global(.tabs button),
  :global(.tabs .tab) {
    min-height: 24px;
    padding: 4px 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  :global(.tabs button.active),
  :global(.tabs .tab.active) {
    background-color: #007BFF;
    font-weight: bold;
  }
</style>

{@render children()}
