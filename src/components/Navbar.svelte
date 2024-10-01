<script>
	import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from '@sveltestrap/sveltestrap';
	import { user } from '../stores/userStore';
</script>

<Navbar color="dark" dark expand="md">
	<NavbarBrand href="/"
		><img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" /></NavbarBrand
	>
	<Nav navbar>
		<NavItem>
			<NavLink href="/">Home</NavLink>
		</NavItem>
		<NavItem>
			<NavLink href="/submit">Submit Lifts</NavLink>
		</NavItem>
		<NavItem>
			<NavLink href="/auth">
				{#if $user}
					Profile
				{:else}
					Sign In
				{/if}
			</NavLink>
		</NavItem>
	</Nav>
</Navbar>

<style>
	.logo {
		width: 150px;
	}
</style>
