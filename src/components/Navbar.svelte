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

	let isOpen = false;
	const toggle = () => (isOpen = !isOpen);
</script>

<Navbar color="dark" dark expand="lg" class="custom-navbar">
	<div class="navbar-content">
		<NavbarBrand href="/" class="brand-container">
			<img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
		</NavbarBrand>

		<!-- Mobile Toggle Button -->
		<div class="mobile-controls d-lg-none">
			<NavbarToggler on:click={toggle} />
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
		<Collapse {isOpen} navbar class="d-lg-none mobile-menu">
			<Nav navbar class="mobile-nav-container">
				<!-- Mobile controls section -->
				<div class="mobile-controls-section">
					<NavItem class="mobile-nav-item">
						<div class="mobile-control-wrapper">
							<span class="mobile-control-label">Weight Unit:</span>
							<WeightTypeSelector />
						</div>
					</NavItem>
					<NavItem class="mobile-nav-item">
						<div class="mobile-control-wrapper">
							<span class="mobile-control-label">Search:</span>
							<SearchBar />
						</div>
					</NavItem>
				</div>

				<!-- Navigation links -->
				<div class="mobile-nav-links">
					<NavItem class="mobile-nav-item">
						<NavLink href="/" class="mobile-nav-link" on:click={toggle}>Home</NavLink>
					</NavItem>
					<NavItem class="mobile-nav-item">
						<NavLink href="/submit" class="mobile-nav-link" on:click={toggle}>Submit Lifts</NavLink>
					</NavItem>
					<NavItem class="mobile-nav-item">
						<NavLink href="/faq" class="mobile-nav-link" on:click={toggle}>FAQ</NavLink>
					</NavItem>
					<NavItem class="mobile-nav-item">
						<NavLink href="/profile" class="mobile-nav-link" on:click={toggle}>
							{#if $user}
								Profile
							{:else}
								Sign In
							{/if}
						</NavLink>
					</NavItem>
					<NavItem class="mobile-nav-item">
						<NavLink href="/feedback" class="mobile-nav-link" on:click={toggle}>Feedback</NavLink>
					</NavItem>
				</div>
			</Nav>
		</Collapse>
	</div>
</Navbar>

<style>
	/* Navbar base styles */
	:global(.custom-navbar) {
		padding: 0.75rem 1rem;
		min-height: 70px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.navbar-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	:global(.mobile-menu) {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background-color: #212529;
		border-top: 1px solid #333;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		border-radius: 0 0 8px 8px;
		margin: 0;
		padding: 0;
	}

	.mobile-nav-container {
		width: 100%;
		flex-direction: column;
		padding: 1rem;
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
	}

	:global(.mobile-nav-link:hover) {
		background-color: rgba(255, 255, 255, 0.1) !important;
		color: #f35151 !important;
	}

	:global(.mobile-nav-link:active) {
		background-color: rgba(255, 255, 255, 0.2) !important;
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

		.mobile-nav-container {
			padding: 0.75rem;
		}

		:global(.mobile-nav-link) {
			padding: 0.875rem !important;
			font-size: 0.95rem !important;
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
</style>
