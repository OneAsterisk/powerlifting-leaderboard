<script>
	import { Theme } from '@sveltestrap/sveltestrap';
	import Navbar from '../components/Navbar.svelte';
	import '../lib/styles/global.scss';
	import Footer from '../components/Footer.svelte';
	import SearchBar from '../components/SearchBar.svelte';
</script>

<Theme theme="dark">
	<header>
		<Navbar />
	</header>
	<main>
		<slot />
	</main>
	<Footer />
</Theme>

<style lang="scss" global>
	main {
		padding: 20px;
		margin-top: 20px; /* Adjust based on your navbar height */
	}
</style>
