<script>
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
	let navbarElement;

	const toggle = () => {
		isOpen = !isOpen;
	};

	const closeMenu = () => {
		isOpen = false;
	};

	// Handle clicks outside the navbar to close the menu
	const handleClickOutside = (event) => {
		if (navbarElement && !navbarElement.contains(event.target) && isOpen) {
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

<div bind:this={navbarElement}>
	<Navbar color="dark" dark expand="lg" class="custom-navbar">
		<div class="navbar-content">
			<NavbarBrand href="/" class="brand-container">
				<img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
			</NavbarBrand>

			<!-- Mobile Toggle Button -->
			<div class="mobile-controls d-lg-none">
				<NavbarToggler on:click={toggle} class="navbar-toggler-custom" />
			</div>

			<!-- Desktop Menu for LG+ screens -->
			<Nav class="d-none d-lg-flex ms-auto desktop-nav" navbar>
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

			<!-- Mobile Collapse Menu -->
			<Collapse {isOpen} navbar class="d-lg-none mobile-menu-collapse">
				<div class="mobile-menu-container">
					<!-- Mobile controls section -->
					<div class="mobile-controls-section">
						<div class="mobile-nav-item">
							<div class="mobile-control-wrapper">
								<span class="mobile-control-label">Weight Unit:</span>
								<WeightTypeSelector />
							</div>
						</div>
						<div class="mobile-nav-item">
							<div class="mobile-control-wrapper">
								<span class="mobile-control-label">Search:</span>
								<SearchBar />
							</div>
						</div>
					</div>

					<!-- Navigation links -->
					<div class="mobile-nav-links">
						<div class="mobile-nav-item">
							<NavLink href="/" class="mobile-nav-link" on:click={closeMenu}>Home</NavLink>
						</div>
						<div class="mobile-nav-item">
							<NavLink href="/submit" class="mobile-nav-link" on:click={closeMenu}
								>Submit Lifts</NavLink
							>
						</div>
						<div class="mobile-nav-item">
							<NavLink href="/faq" class="mobile-nav-link" on:click={closeMenu}>FAQ</NavLink>
						</div>
						<div class="mobile-nav-item">
							<NavLink href="/profile" class="mobile-nav-link" on:click={closeMenu}>
								{#if $user}
									Profile
								{:else}
									Sign In
								{/if}
							</NavLink>
						</div>
						<div class="mobile-nav-item">
							<NavLink href="/feedback" class="mobile-nav-link" on:click={closeMenu}
								>Feedback</NavLink
							>
						</div>
					</div>
				</div>
			</Collapse>
		</div>
	</Navbar>
</div>

<style>
	/* Navbar base styles */
	:global(.custom-navbar) {
		padding: 0.75rem 1rem;
		min-height: 70px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.navbar-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
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
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	:global(.nav-link-custom:hover) {
		background-color: rgba(255, 255, 255, 0.1) !important;
		color: #f35151 !important;
	}

	/* Mobile styles */
	.mobile-controls {
		display: flex;
		align-items: center;
	}

	:global(.navbar-toggler-custom) {
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.5rem;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	:global(.navbar-toggler-custom:hover) {
		border-color: #4fc3f7;
		background-color: rgba(79, 195, 247, 0.1);
	}

	:global(.navbar-toggler-custom:focus) {
		box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.25);
		outline: none;
	}

	/* Mobile dropdown menu */
	:global(.mobile-menu-collapse) {
		position: absolute !important;
		top: 100% !important;
		left: 0 !important;
		right: 0 !important;
		z-index: 1050 !important;
		background-color: #212529 !important;
		border: 1px solid #333 !important;
		border-top: none !important;
		border-radius: 0 0 8px 8px !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	.mobile-menu-container {
		width: 100%;
		padding: 1rem;
		background-color: #212529;
		border-radius: 0 0 8px 8px;
	}

	.mobile-controls-section {
		border-bottom: 1px solid #333;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}

	.mobile-control-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
	}

	.mobile-control-label {
		color: #ffffff;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.mobile-nav-links {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mobile-nav-item {
		width: 100%;
	}

	:global(.mobile-nav-link) {
		display: block !important;
		width: 100% !important;
		padding: 1rem !important;
		color: #ffffff !important;
		text-decoration: none !important;
		border-radius: 6px !important;
		transition: all 0.2s ease !important;
		font-size: 1rem !important;
		font-weight: 500 !important;
		text-align: left !important;
		border: 1px solid transparent !important;
	}

	:global(.mobile-nav-link:hover) {
		background-color: rgba(79, 195, 247, 0.1) !important;
		color: #4fc3f7 !important;
		border-color: rgba(79, 195, 247, 0.3) !important;
	}

	:global(.mobile-nav-link:active) {
		background-color: rgba(79, 195, 247, 0.2) !important;
		transform: translateY(1px) !important;
	}

	/* Responsive breakpoints */
	@media (max-width: 576px) {
		.logo {
			height: 35px;
			max-width: 120px;
		}

		:global(.custom-navbar) {
			padding: 0.5rem 0.75rem;
			min-height: 60px;
		}

		.mobile-menu-container {
			padding: 0.75rem;
		}

		:global(.mobile-nav-link) {
			padding: 0.875rem !important;
			font-size: 0.95rem !important;
		}

		.mobile-control-wrapper {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}

	@media (max-width: 380px) {
		.logo {
			height: 30px;
			max-width: 100px;
		}

		:global(.custom-navbar) {
			padding: 0.5rem;
		}

		.mobile-menu-container {
			padding: 0.5rem;
		}
	}

	/* Medium tablet styles */
	@media (min-width: 577px) and (max-width: 991px) {
		.logo {
			height: 45px;
			max-width: 140px;
		}
	}

	/* Large screen optimization */
	@media (min-width: 1200px) {
		.desktop-nav {
			gap: 1rem;
		}

		.nav-control-item {
			margin-right: 1.5rem;
		}
	}

	/* Ensure proper stacking context */
	:global(.navbar) {
		position: relative;
		z-index: 1000;
	}

	/* Animation for smooth dropdown */
	:global(.collapse.show) {
		animation: slideDown 0.3s ease-out;
	}

	:global(.collapse:not(.show)) {
		animation: slideUp 0.2s ease-in;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideUp {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
</style>
