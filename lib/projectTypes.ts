export const PROJECT_STATUSES = [
  'building',
  'live',
  'paused',
  'retired',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface RevenueMonth {
  month: string;
  amountCents: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  url: string | null;
  shortStory: string;
  status: ProjectStatus;
  tags: string[];
  isPrivate: boolean;
  featured: boolean;
  displayOrder: number;
  startedAt: string | null;
  endedAt: string | null;
  stripeEnvVar: string | null;
  stripeSecretConfigured: boolean;
  revenueMonths: RevenueMonth[];
  revenueUpdatedAt: string | null;
}

export function formatStatus(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    building: 'Building',
    live: 'Live',
    paused: 'Paused',
    retired: 'Retired',
  };
  return labels[status];
}

export function projectRevenueTotal(project: Pick<Project, 'revenueMonths'>) {
  return project.revenueMonths.reduce((total, month) => total + month.amountCents, 0);
}
