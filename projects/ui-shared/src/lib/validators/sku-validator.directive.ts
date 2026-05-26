import { Directive, forwardRef, inject } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Directive({
  selector: '[libSkuValidator][formControlName],[libSkuValidator][formControl],[libSkuValidator][ngModel]',
  standalone: true,
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => SkuValidatorDirective),
      multi: true
    }
  ]
})
export class SkuValidatorDirective implements AsyncValidator {
  private http = inject(HttpClient);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return timer(0).pipe(map(() => null));
    }
    
    // Debounce backend check to reduce database and network overhead
    return timer(300).pipe(
      switchMap(() => 
        this.http.get<{ exists: boolean }>(`http://localhost:3000/products/check-sku/exists?sku=${encodeURIComponent(control.value)}`).pipe(
          map(res => (res.exists ? { skuTaken: true } : null)),
          catchError(() => timer(0).pipe(map(() => null)))
        )
      )
    );
  }
}
