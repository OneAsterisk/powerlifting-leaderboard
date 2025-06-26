<script>
	import { Theme } from '@sveltestrap/sveltestrap';
	import Navbar from '../components/Navbar.svelte';
	import '../lib/styles/global.scss';
	import Footer from '../components/Footer.svelte';
	import SearchBar from '../components/SearchBar.svelte';
</script>

<Theme theme="dark">
	<div class="app-container">
		<header class="header-container">
			<Navbar />
		</header>
		<main class="main-content">
			<slot />
		</main>
		<Footer />
	</div>
</Theme>

<style lang="scss" global>
	html,
	body {
		margin: 0;
		padding: 0;
		min-height: 100vh;
		overflow-x: hidden;
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100%;
	}

	.header-container {
		position: sticky;
		top: 0;
		z-index: 1000;
		width: 100%;
	}

	.main-content {
		flex: 1;
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
		margin-bottom: 2rem;

		/* Mobile-first padding */
		padding: 1rem 0.75rem;

		/* Ensure content doesn't get too wide on large screens */
		@media (min-width: 1400px) {
			max-width: 1320px;
			padding: 1.5rem 2rem;
		}

		@media (min-width: 1200px) and (max-width: 1399px) {
			max-width: 1140px;
			padding: 1.5rem 1.5rem;
		}

		@media (min-width: 992px) and (max-width: 1199px) {
			padding: 1.25rem 1.25rem;
		}

		@media (min-width: 768px) and (max-width: 991px) {
			padding: 1rem 1rem;
		}

		@media (min-width: 576px) and (max-width: 767px) {
			padding: 1rem 0.875rem;
		}

		/* Small mobile devices */
		@media (max-width: 575px) {
			padding: 0.75rem 0.5rem;
		}

		/* Very small devices */
		@media (max-width: 380px) {
			padding: 0.75rem 0.25rem;
		}
	}

	/* Global responsive typography */
	h1 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
		text-align: center;

		@media (max-width: 768px) {
			font-size: 1.75rem;
			margin-bottom: 1.25rem;
		}

		@media (max-width: 576px) {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}

		@media (max-width: 380px) {
			font-size: 1.375rem;
			margin-bottom: 0.875rem;
		}
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1.25rem;

		@media (max-width: 768px) {
			font-size: 1.375rem;
			margin-bottom: 1rem;
		}

		@media (max-width: 576px) {
			font-size: 1.25rem;
			margin-bottom: 0.875rem;
		}
	}

	h3 {
		font-size: 1.25rem;
		margin-bottom: 1rem;

		@media (max-width: 768px) {
			font-size: 1.125rem;
			margin-bottom: 0.875rem;
		}

		@media (max-width: 576px) {
			font-size: 1rem;
			margin-bottom: 0.75rem;
		}
	}

	/* Global button responsive styles */
	.btn,
	.btn-primary,
	.btn-secondary {
		@media (max-width: 576px) {
			padding: 0.625rem 1rem;
			font-size: 0.9rem;
		}

		@media (max-width: 380px) {
			padding: 0.5rem 0.875rem;
			font-size: 0.875rem;
		}
	}

	/* Form responsive improvements */
	.form-control,
	.form-select {
		@media (max-width: 576px) {
			font-size: 1rem; /* Prevents zoom on iOS */
		}
	}

	/* Global spacing utilities for mobile */
	.mobile-spacing {
		@media (max-width: 768px) {
			margin-bottom: 1rem !important;
		}

		@media (max-width: 576px) {
			margin-bottom: 0.75rem !important;
		}
	}

	.mobile-padding {
		@media (max-width: 768px) {
			padding: 1rem !important;
		}

		@media (max-width: 576px) {
			padding: 0.75rem !important;
		}

		@media (max-width: 380px) {
			padding: 0.5rem !important;
		}
	}

	/* Container responsive styles */
	.container-responsive {
		width: 100%;
		max-width: 100%;
		margin: 0 auto;

		@media (min-width: 576px) {
			max-width: 540px;
		}

		@media (min-width: 768px) {
			max-width: 720px;
		}

		@media (min-width: 992px) {
			max-width: 960px;
		}

		@media (min-width: 1200px) {
			max-width: 1140px;
		}
	}
</style>
