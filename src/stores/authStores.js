import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

function createAuthStore() {
	const { subscribe, set } = writable(false);

	return {
		subscribe,
		login: () => set(true),
		logout: () => set(false),
		check: () => {
			if (browser) {
				const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
				set(isAuthenticated);
				return isAuthenticated;
			}
			return false;
		}
	};
}

export const auth = createAuthStore();

/**
 * @param {string} url
 */
export function requireAuth(url) {
	if (!auth.check() && url !== '/auth') {
		goto('/auth');
	}
}
