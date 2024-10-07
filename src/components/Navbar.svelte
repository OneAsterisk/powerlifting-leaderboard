<script>
	import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Dropdown } from '@sveltestrap/sveltestrap';
	import { user } from '../stores/userStore';
</script>

<Navbar color="dark" dark expand="md">
	<NavbarBrand href="/" style={'color: #f35151'}
		><img class="logo" alt="Collegiate Strength Logo" src="/Logo.svg" />
		Beta V0.1.2
	</NavbarBrand>
	<Nav navbar>
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
