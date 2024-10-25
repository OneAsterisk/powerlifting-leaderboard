<script>
	import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Button } from '@sveltestrap/sveltestrap';
	import { user } from '../stores/userStore';
	import SearchBar from './SearchBar.svelte';
	import WeightTypeSelector from './WeightTypeSelector.svelte';
</script>

<Navbar color="dark" dark expand="md">
	<NavbarBrand href="/" style={'color: #f35151'}
		><img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
	</NavbarBrand>
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
</Navbar>

<style>
	.logo {
		width: 150px;
		color: #f35151;
	}
</style>
