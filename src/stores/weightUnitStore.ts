import { writable } from 'svelte/store';
export const weightUnit = writable<'lbs' | 'kg'>('lbs');
