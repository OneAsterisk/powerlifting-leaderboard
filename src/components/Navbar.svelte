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

<div bind:this={navbarElement} class="navbar-wrapper">
	<Navbar color="dark" dark expand="lg" class="custom-navbar">
		<div class="navbar-content">
			<!-- Logo - Always Visible -->
			<NavbarBrand href="/" class="brand-container">
				<img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
			</NavbarBrand>

			<!-- Mobile Hamburger Menu Button - Only on Small Screens -->
			<div class="mobile-toggle d-lg-none">
				<button
					class="hamburger-btn {isOpen ? 'open' : ''}"
					on:click={toggle}
					aria-label="Toggle navigation menu"
				>
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
				</button>
			</div>

			<!-- Desktop Menu - Only on Large Screens -->
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
		</div>
	</Navbar>

	<!-- Mobile Dropdown Menu - Only on Small Screens -->
	<div class="mobile-menu d-lg-none {isOpen ? 'show' : ''}">
		<div class="mobile-menu-content">
			<!-- Mobile Controls Section -->
			<div class="mobile-controls-section">
				<div class="mobile-control-item">
					<span class="control-label">Weight Unit:</span>
					<WeightTypeSelector />
				</div>
				<div class="mobile-control-item">
					<span class="control-label">Search:</span>
					<SearchBar />
				</div>
			</div>

			<!-- Mobile Navigation Links -->
			<nav class="mobile-nav-links">
				<a href="/" class="mobile-nav-link" on:click={closeMenu}>
					<span class="nav-icon">🏠</span>
					Home
				</a>
				<a href="/submit" class="mobile-nav-link" on:click={closeMenu}>
					<span class="nav-icon">📝</span>
					Submit Lifts
				</a>
				<a href="/faq" class="mobile-nav-link" on:click={closeMenu}>
					<span class="nav-icon">❓</span>
					FAQ
				</a>
				<a href="/profile" class="mobile-nav-link" on:click={closeMenu}>
					<span class="nav-icon">👤</span>
					{#if $user}
						Profile
					{:else}
						Sign In
					{/if}
				</a>
				<a href="/feedback" class="mobile-nav-link" on:click={closeMenu}>
					<span class="nav-icon">💬</span>
					Feedback
				</a>
			</nav>
		</div>
	</div>
</div>

<style>
	/* Navbar Wrapper */
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

	/* Navbar Base Styles */
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

	/* Logo Styles */
	.brand-container {
		flex-shrink: 0;
		z-index: 1001;
	}

	.logo {
		height: 40px;
		width: auto;
		max-width: 150px;
		color: #f35151;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	/* Desktop Navigation Styles */
	.desktop-nav {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-control-item {
		margin-right: 1rem;
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		padding: 0.25rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
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

	/* Mobile Toggle Button */
	.mobile-toggle {
		z-index: 1001;
	}

	.hamburger-btn {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.hamburger-btn:hover {
		background: rgba(79, 195, 247, 0.1);
	}

	.hamburger-line {
		width: 100%;
		height: 3px;
		background: #ffffff;
		border-radius: 2px;
		transition: all 0.3s ease;
		transform-origin: center;
	}

	/* Hamburger Animation */
	.hamburger-btn.open .hamburger-line:nth-child(1) {
		transform: rotate(45deg) translate(7px, 7px);
	}

	.hamburger-btn.open .hamburger-line:nth-child(2) {
		opacity: 0;
	}

	.hamburger-btn.open .hamburger-line:nth-child(3) {
		transform: rotate(-45deg) translate(7px, -7px);
	}

	/* Mobile Menu */
	.mobile-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: rgba(33, 37, 41, 0.95);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		transform: translateY(-100%);
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s ease;
		z-index: 999;
	}

	.mobile-menu.show {
		transform: translateY(0);
		opacity: 1;
		visibility: visible;
	}

	.mobile-menu-content {
		padding: 1.5rem;
		max-height: calc(100vh - 70px);
		overflow-y: auto;
	}

	/* Mobile Controls Section */
	.mobile-controls-section {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.mobile-control-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.mobile-control-item:last-child {
		border-bottom: none;
	}

	.control-label {
		color: #4fc3f7;
		font-weight: 600;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Mobile Navigation Links */
	.mobile-nav-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mobile-nav-link {
		display: flex;
		align-items: center;
		padding: 1rem 1.25rem;
		color: #ffffff;
		text-decoration: none;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
		font-weight: 500;
		font-size: 1rem;
	}

	.mobile-nav-link:hover {
		background: rgba(79, 195, 247, 0.15);
		color: #4fc3f7;
		border-color: rgba(79, 195, 247, 0.3);
		transform: translateX(4px);
		text-decoration: none;
	}

	.nav-icon {
		margin-right: 0.75rem;
		font-size: 1.2rem;
		width: 24px;
		text-align: center;
	}

	/* Responsive Styles */
	@media (max-width: 576px) {
		.logo {
			height: 35px;
			max-width: 120px;
		}

		:global(.custom-navbar) {
			padding: 0.5rem 0.75rem;
			min-height: 60px;
		}

		.mobile-menu-content {
			padding: 1rem;
		}

		.mobile-nav-link {
			padding: 0.875rem 1rem;
			font-size: 0.95rem;
		}

		.mobile-control-item {
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

		.mobile-menu-content {
			padding: 0.75rem;
		}
	}

	/* Large Screen Optimization */
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

	/* Additional Blur Effects */
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

	/* Entrance Animation */
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
