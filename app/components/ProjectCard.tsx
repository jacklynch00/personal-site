import Link from 'next/link';
import { formatStatus, Project, projectRevenueTotal } from '@/lib/projectTypes';

function formatMoney(cents: number, compact = false) {
  if (cents === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(cents / 100);
}

function defaultMonths() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
    return {
      month: date.toISOString().slice(0, 7),
      amountCents: 0,
    };
  });
}

function formatMonth(month: string) {
  const date = new Date(`${month}-01T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function Sparkline({ months }: { months: Project['revenueMonths'] }) {
  const safeMonths = months.length ? months : defaultMonths();
  const safeValues = safeMonths.map((month) => month.amountCents);
  const max = Math.max(...safeValues, 1);
  const chartPoints = safeValues.map((value, index) => {
    const x = (index / Math.max(safeValues.length - 1, 1)) * 100;
    const y = 34 - (Math.max(value, 0) / max) * 28;
    return { x, y, value, month: safeMonths[index].month };
  });
  const points = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <span className="sparkline-wrap" aria-label="Trailing 12 month revenue sparkline">
      <svg className="sparkline" viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {chartPoints.map((point) => (
        <span
          key={point.month}
          className="sparkline-point"
          style={{ left: `${point.x}%`, top: `${point.y}px` }}
        >
          <span className="sparkline-tooltip">
            <strong>{formatMonth(point.month)}</strong>
            <span>{formatMoney(point.value, true)}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

function normalizeUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const revenue = projectRevenueTotal(project);
  const content = (
    <>
      <div className="project-card-top">
        <span className={`project-status project-status-${project.status}`}>{formatStatus(project.status)}</span>
        {project.featured && <span className="project-featured">Featured</span>}
      </div>
      <h3>{project.title}</h3>
      <p>{project.shortStory || 'A build from the archive.'}</p>
      <div className="project-tags">
        {project.tags.slice(0, compact ? 3 : 5).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="project-revenue">
        <div>
          <span>TTM revenue</span>
          <strong>{formatMoney(revenue)}</strong>
        </div>
        <Sparkline months={project.revenueMonths} />
      </div>
    </>
  );

  if (project.url) {
    return (
      <a className="project-card" href={normalizeUrl(project.url)} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link className="project-card" href={`/projects#${project.slug}`}>
      {content}
    </Link>
  );
}
