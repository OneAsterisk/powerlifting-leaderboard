<script lang="ts">
	import {
		Navbar,
		NavbarBrand,
		Nav,
		NavItem,
		NavLink,
		NavbarToggler,
		Collapse
	} from '@sveltestrap/sveltestrap';
	import { user } from '../stores/userStore';
	import SearchBar from './SearchBar.svelte';
	import WeightTypeSelector from './WeightTypeSelector.svelte';
	import { onMount } from 'svelte';

	let isOpen = false;
	let navbarElement: HTMLDivElement;

	const toggle = () => {
		isOpen = !isOpen;
	};

	const closeMenu = () => {
		isOpen = false;
	};

	// Handle clicks outside the navbar to close the menu
	const handleClickOutside = (event: Event) => {
		if (navbarElement && !navbarElement.contains(event.target as Node) && isOpen) {
			closeMenu();
		}
	};

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div bind:this={navbarElement} class="navbar-wrapper d-none d-lg-block">
	<Navbar color="dark" dark expand="lg" class="custom-navbar">
		<div class="navbar-content">
			<NavbarBrand href="/" class="brand-container">
				<img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
			</NavbarBrand>

			<!-- Desktop Menu for LG+ screens -->
			<Nav class="ms-auto desktop-nav" navbar>
				<NavItem class="nav-control-item">
					<WeightTypeSelector />
				</NavItem>
				<NavItem class="nav-control-item">
					<SearchBar />
				</NavItem>
				<NavItem>
					<NavLink href="/" class="nav-link-custom">Home</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/submit" class="nav-link-custom">Submit Lifts</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/faq" class="nav-link-custom">FAQ</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/profile" class="nav-link-custom">
						{#if $user}
							Profile
						{:else}
							Sign In
						{/if}
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/feedback" class="nav-link-custom">Feedback</NavLink>
				</NavItem>
			</Nav>
		</div>
	</Navbar>
</div>

<style>
	/* Navbar wrapper for desktop only */
	.navbar-wrapper {
		position: sticky;
		top: 0;
		z-index: 1000;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		background: rgba(33, 37, 41, 0.85);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
	}

	/* Navbar base styles */
	:global(.custom-navbar) {
		padding: 0.75rem 1rem;
		min-height: 70px;
		position: relative;
		background: transparent !important;
	}

	.navbar-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Logo styles */
	.brand-container {
		flex-shrink: 0;
	}

	.logo {
		height: 40px;
		width: auto;
		max-width: 150px;
		color: #f35151;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	/* Desktop navigation */
	.desktop-nav {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-control-item {
		margin-right: 1rem;
	}

	:global(.nav-link-custom) {
		padding: 0.5rem 1rem !important;
		color: #ffffff !important;
		text-decoration: none !important;
		border-radius: 6px;
		transition: all 0.3s ease;
		font-weight: 500;
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	:global(.nav-link-custom:hover) {
		background: rgba(79, 195, 247, 0.15) !important;
		color: #4fc3f7 !important;
		border-color: rgba(79, 195, 247, 0.3);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(79, 195, 247, 0.2);
	}

	:global(.nav-link-custom:active) {
		transform: translateY(0);
	}

	/* Enhanced glass morphism effect */
	:global(.nav-control-item) {
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		padding: 0.25rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Large screen optimization */
	@media (min-width: 1200px) {
		.desktop-nav {
			gap: 1rem;
		}

		.nav-control-item {
			margin-right: 1.5rem;
		}

		:global(.custom-navbar) {
			padding: 0.875rem 1.5rem;
		}
	}

	@media (min-width: 1400px) {
		.navbar-content {
			max-width: 1320px;
		}
	}

	/* Ensure proper stacking context */
	:global(.navbar) {
		position: relative;
		z-index: 1000;
	}

	/* Additional blur and backdrop effects */
	.navbar-wrapper::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			rgba(33, 37, 41, 0.9) 0%,
			rgba(33, 37, 41, 0.8) 50%,
			rgba(33, 37, 41, 0.9) 100%
		);
		z-index: -1;
	}

	/* Smooth entrance animation */
	.navbar-wrapper {
		animation: slideInFromTop 0.6s ease-out;
	}

	@keyframes slideInFromTop {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
