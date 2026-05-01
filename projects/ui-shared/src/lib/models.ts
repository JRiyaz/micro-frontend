export interface Breadcrumb {
  label: string;
  link?: string;
}

export interface StatItem {
  label: string;
  value: string | number;
  color?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  icon?: string;
}
