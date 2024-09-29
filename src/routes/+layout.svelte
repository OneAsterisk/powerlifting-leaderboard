<script>
	import { Theme } from '@sveltestrap/sveltestrap';
	import Navbar from '../components/Navbar.svelte';
	import '../lib/styles/global.scss';
</script>

<Theme theme="dark">
	<header>
		<Navbar />
	</header>
	<main>
		<slot />
	</main>
	<footer>
		<!-- Footer content -->
	</footer>
</Theme>

<style lang="scss" global>
	@import '../lib/styles/global.scss';

	main {
		padding: 20px;
		margin-top: 20px; /* Adjust based on your navbar height */
	}
</style>
