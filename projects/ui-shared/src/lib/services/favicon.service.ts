import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  setFavicon(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel*='icon']");
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.type = 'image/png';
    link.href = url;
  }
}
