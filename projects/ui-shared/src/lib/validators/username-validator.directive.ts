import { Directive, forwardRef, inject } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Directive({
  selector: '[libUsernameValidator][formControlName],[libUsernameValidator][formControl],[libUsernameValidator][ngModel]',
  standalone: true,
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => UsernameValidatorDirective),
      multi: true
    }
  ]
})
export class UsernameValidatorDirective implements AsyncValidator {
  private http = inject(HttpClient);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return timer(0).pipe(map(() => null));
    }
    
    // Debounce backend check to reduce database and network overhead
    return timer(300).pipe(
      switchMap(() => 
        this.http.get<{ exists: boolean }>(`http://localhost:3000/auth/check-username?username=${encodeURIComponent(control.value)}`).pipe(
          map(res => (res.exists ? { usernameTaken: true } : null)),
          catchError(() => timer(0).pipe(map(() => null)))
        )
      )
    );
  }
}
