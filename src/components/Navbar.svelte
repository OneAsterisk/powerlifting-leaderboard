<script lang="ts">
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
	<nav class="custom-navbar">
		<div class="navbar-content">
			<!-- Logo - Always visible -->
			<a href="/" class="brand-container">
				<img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
			</a>

			<!-- Desktop Navigation - Only visible on large screens -->
			<div class="desktop-nav">
				<div class="nav-controls">
					<div class="control-item">
						<WeightTypeSelector />
					</div>
					<div class="control-item">
						<SearchBar />
					</div>
				</div>
				<div class="nav-links">
					<a href="/" class="nav-link">Home</a>
					<a href="/submit" class="nav-link">Submit Lifts</a>
					<a href="/faq" class="nav-link">FAQ</a>
					<a href="/profile" class="nav-link">
						{#if $user}
							Profile
						{:else}
							Sign In
						{/if}
					</a>
					<a href="/feedback" class="nav-link">Feedback</a>
				</div>
			</div>

			<!-- Mobile Hamburger Button - Only visible on small screens -->
			<button
				class="hamburger-btn {isOpen ? 'active' : ''}"
				on:click={toggle}
				aria-label="Toggle navigation menu"
			>
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
			</button>
		</div>
	</nav>

	<!-- Mobile Menu Dropdown - Only visible on small screens -->
	<div class="mobile-menu {isOpen ? 'open' : ''}">
		<div class="mobile-menu-content">
			<!-- Mobile Controls -->
			<div class="mobile-controls">
				<div class="mobile-control">
					<span class="control-label">Weight Unit:</span>
					<WeightTypeSelector />
				</div>
				<div class="mobile-control">
					<span class="control-label">Search:</span>
					<SearchBar />
				</div>
			</div>

			<!-- Mobile Navigation Links -->
			<nav class="mobile-nav">
				<a href="/" class="mobile-link" on:click={closeMenu}>
					<span class="link-icon">🏠</span>
					Home
				</a>
				<a href="/submit" class="mobile-link" on:click={closeMenu}>
					<span class="link-icon">📝</span>
					Submit Lifts
				</a>
				<a href="/faq" class="mobile-link" on:click={closeMenu}>
					<span class="link-icon">❓</span>
					FAQ
				</a>
				<a href="/profile" class="mobile-link" on:click={closeMenu}>
					<span class="link-icon">👤</span>
					{#if $user}
						Profile
					{:else}
						Sign In
					{/if}
				</a>
				<a href="/feedback" class="mobile-link" on:click={closeMenu}>
					<span class="link-icon">💬</span>
					Feedback
				</a>
			</nav>
		</div>
	</div>
</div>

<style>
	/* Base Navbar Wrapper */
	.navbar-wrapper {
		position: sticky;
		top: 0;
		z-index: 1000;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		background: rgba(33, 37, 41, 0.9);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
	}

	.custom-navbar {
		padding: 0.75rem 1rem;
		min-height: 70px;
	}

	.navbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	/* Logo */
	.brand-container {
		flex-shrink: 0;
		text-decoration: none;
		z-index: 1001;
	}

	.logo {
		height: 40px;
		width: auto;
		max-width: 150px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	/* Desktop Navigation - Hidden on mobile */
	.desktop-nav {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.nav-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.control-item {
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		padding: 0.25rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-link {
		padding: 0.5rem 1rem;
		color: #ffffff;
		text-decoration: none;
		border-radius: 6px;
		transition: all 0.3s ease;
		font-weight: 500;
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-link:hover {
		background: rgba(79, 195, 247, 0.15);
		color: #4fc3f7;
		border-color: rgba(79, 195, 247, 0.3);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(79, 195, 247, 0.2);
		text-decoration: none;
	}

	/* Mobile Hamburger Button - Hidden on desktop */
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
		z-index: 1001;
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
	.hamburger-btn.active .hamburger-line:nth-child(1) {
		transform: rotate(45deg) translate(7px, 7px);
	}

	.hamburger-btn.active .hamburger-line:nth-child(2) {
		opacity: 0;
	}

	.hamburger-btn.active .hamburger-line:nth-child(3) {
		transform: rotate(-45deg) translate(7px, -7px);
	}

	/* Mobile Menu - Hidden on desktop */
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

	.mobile-menu.open {
		transform: translateY(0);
		opacity: 1;
		visibility: visible;
	}

	.mobile-menu-content {
		padding: 1.5rem;
		max-height: calc(100vh - 70px);
		overflow-y: auto;
	}

	.mobile-controls {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.mobile-control {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.mobile-control:last-child {
		border-bottom: none;
	}

	.control-label {
		color: #4fc3f7;
		font-weight: 600;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.mobile-nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mobile-link {
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

	.mobile-link:hover {
		background: rgba(79, 195, 247, 0.15);
		color: #4fc3f7;
		border-color: rgba(79, 195, 247, 0.3);
		transform: translateX(4px);
		text-decoration: none;
	}

	.link-icon {
		margin-right: 0.75rem;
		font-size: 1.2rem;
		width: 24px;
		text-align: center;
	}

	/* Media Queries for Responsive Behavior */

	/* Desktop View - 992px and up */
	@media (min-width: 992px) {
		.desktop-nav {
			display: flex;
		}

		.hamburger-btn {
			display: none;
		}

		.mobile-menu {
			display: none;
		}
	}

	/* Mobile View - Below 992px */
	@media (max-width: 991px) {
		.desktop-nav {
			display: none;
		}

		.hamburger-btn {
			display: flex;
		}

		.mobile-menu {
			display: block;
		}
	}

	/* Small Mobile Adjustments */
	@media (max-width: 576px) {
		.logo {
			height: 35px;
			max-width: 120px;
		}

		.custom-navbar {
			padding: 0.5rem 0.75rem;
			min-height: 60px;
		}

		.mobile-menu-content {
			padding: 1rem;
		}

		.mobile-link {
			padding: 0.875rem 1rem;
			font-size: 0.95rem;
		}

		.mobile-control {
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

		.custom-navbar {
			padding: 0.5rem;
		}

		.mobile-menu-content {
			padding: 0.75rem;
		}
	}

	/* Large Desktop Optimization */
	@media (min-width: 1200px) {
		.desktop-nav {
			gap: 2.5rem;
		}

		.nav-controls {
			gap: 1.5rem;
		}

		.custom-navbar {
			padding: 0.875rem 1.5rem;
		}
	}

	@media (min-width: 1400px) {
		.navbar-content {
			max-width: 1320px;
		}
	}

	/* Background Gradient Effect */
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
