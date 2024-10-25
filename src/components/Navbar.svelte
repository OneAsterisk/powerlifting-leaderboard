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
	const toggle = () => isOpen = !isOpen;
</script>

<Navbar color="dark" dark expand="md" class="justify-content-between">
	<NavbarBrand href="/" style={'color: #f35151'}>
		<img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
	</NavbarBrand>

	<!-- Mobile Toggle Button -->
	<div class="d-md-none">
		<NavbarToggler on:click={toggle} />
	</div>

	<!-- Regular Menu for MD+ screens -->
	<Nav class="d-none d-md-flex ms-auto" navbar>
		<NavItem style="padding-top: 5px;">
			<WeightTypeSelector />
		</NavItem>
		<NavItem style="padding-top: 5px;">
			<SearchBar />
		</NavItem>
		<NavItem>
			<NavLink href="/">Home</NavLink>
		</NavItem>
		<NavItem>
			<NavLink href="/submit">Submit Lifts</NavLink>
		</NavItem>
		<NavItem>
			<NavLink href="/faq">FAQ</NavLink>
		</NavItem>
		<NavItem>
			<NavLink href="/profile">
				{#if $user}
					Profile
				{:else}
					Sign In
				{/if}
			</NavLink>
		</NavItem>
		<NavItem>
			<NavLink href="/feedback">Feedback</NavLink>
		</NavItem>
	</Nav>

	<!-- Mobile Collapse Menu -->
	<Collapse {isOpen} navbar class="d-md-none mobile-menu">
		<Nav navbar>
			<NavItem style="padding-top: 5px;">
				<WeightTypeSelector />
			</NavItem>
			<NavItem style="padding-top: 5px;">
				<SearchBar />
			</NavItem>
			<NavItem>
				<NavLink href="/">Home</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/submit">Submit Lifts</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/faq">FAQ</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/profile">
					{#if $user}
						Profile
					{:else}
						Sign In
					{/if}
				</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/feedback">Feedback</NavLink>
			</NavItem>
		</Nav>
	</Collapse>
</Navbar>

<style>
	.logo {
		width: 150px;
		color: #f35151;
	}

	/* Mobile styles */
	@media (max-width: 768px) {
		:global(.mobile-menu) {
			z-index: 10;
			position: absolute;
			top: 100%;
			right: 0;
			background-color: #212529; /* Match navbar dark color */
			padding: 1rem;
			border-radius: 0 0 0.25rem 0.25rem;
			box-shadow: 0 2px 4px rgba(0,0,0,0.2);
		}
		
		:global(.nav-item) {
			padding: 0.5rem 0;
			text-align: right;
		}
	}

	/* Add space between items on desktop */
	:global(.nav-item) {
		margin-left: 0.5rem;
	}
</style>