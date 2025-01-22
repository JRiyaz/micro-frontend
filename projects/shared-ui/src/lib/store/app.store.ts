import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export interface User {
    email: string;
    name?: string;
}

type AppState = { user: User | undefined; };

const initialState: AppState = { user: undefined };

export const AppStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, router = inject(Router)) => ({
        login: () => {
            // call login function
            patchState(store, { user: { email: 'test@example.com', name: 'test' } });
            router.navigate(['/home']);
        },
        logout: () => {
            patchState(store, { user: undefined });
            router.navigate(['/login']);
        }
    }))
);