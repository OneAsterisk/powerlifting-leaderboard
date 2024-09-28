import { writable } from 'svelte/store';
import { auth } from '../lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

export const user = writable<User | null>(null);

onAuthStateChanged(auth, (currentUser) => {
  user.set(currentUser);
});
