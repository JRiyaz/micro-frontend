import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedUiService {
  var!: number

  setVar(value: number): void {
    this.var = value;
  }

  getVar(): number {
    return this.var;
  }
}
