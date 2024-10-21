import { writable } from 'svelte/store';
import { getUserInfoNew} from '../dbFunctions';
import type { UserInfo } from '../types';

function createUserInfoStore() {
    const { subscribe, set, update } = writable<UserInfo | null>(null);
    let unsubscribe: (() => void) | null = null;

    return {
        subscribe,
        fetchUserInfo: (userId: string) => {
            if (unsubscribe) {
                unsubscribe();
            }
            unsubscribe = getUserInfoNew(userId, (userInfo) => {
                if (userInfo) {
                    set(userInfo);
                } else {
                    set(null);
                }
            });
        },
        updateUserInfo: (updatedData: Partial<UserInfo>) => {
            update(currentData => {
                if (currentData) {
                    return { ...currentData, ...updatedData };
                }
                return currentData;
            });
            // Note: You'll need to implement the actual update in Firebase separately
        },
        clearUserInfo: () => {
            set(null);
            if (unsubscribe) {
                unsubscribe();
                unsubscribe = null;
            }
        }
    };
}

export const userInfoStore = createUserInfoStore();