import { Injectable, signal } from '@angular/core';

export interface SubProject {
  name: string;
  status: 'running' | 'offline' | 'error';
  port?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  subProjects = signal<SubProject[]>([
    { name: 'Inventory Shell', status: 'running', port: 4200 }
  ]);
  selectedProjectIndex = signal(0);

  constructor() {
    this.loadManifestProjects();
  }

  private async loadManifestProjects() {
    try {
      const response = await fetch('/federation.manifest.json');
      const manifest = await response.json();

      const projects: SubProject[] = [
        { name: 'Inventory Shell', status: 'running', port: 4200 }
      ];

      Object.entries(manifest).forEach(([key, value]) => {
        const url = value as string;
        const portMatch = url.match(/:(\d+)\//);
        const port = portMatch ? parseInt(portMatch[1], 10) : undefined;
        const name = key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        projects.push({
          name: name,
          status: 'running',
          port: port
        });
      });

      this.subProjects.set(projects);
    } catch (err) {
      console.error('Error loading manifest projects:', err);
    }
  }

  getSelectedProject(): SubProject | undefined {
    return this.subProjects()[this.selectedProjectIndex()];
  }

  selectProject(index: number): void {
    this.selectedProjectIndex.set(index);
  }
}
