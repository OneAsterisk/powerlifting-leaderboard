<script>
	import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from '@sveltestrap/sveltestrap';
	import { user } from '../stores/userStore';
</script>

<Navbar color="dark" dark expand="md">
	<NavbarBrand href="/">Powerlifting Leaderboard</NavbarBrand>
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
