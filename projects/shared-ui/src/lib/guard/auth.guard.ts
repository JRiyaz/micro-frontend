import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AppStore } from "../store/app.store";

export function authGuard(): CanActivateFn {
    return (route) => {
        const user = inject(AppStore).user();
        const router = inject(Router);

        if (user) return true;
        console.log("please login to proceed...")
        router.navigate(['/login']);
        return false;
    };
}

export function loginGuard(): CanActivateFn {
    return (route) => {
        const user = inject(AppStore).user();
        const router = inject(Router);

        if (!user) return true;
        console.log("User already logged in :)")
        router.navigate(['/']);
        return false;
    };
}