import Image from 'next/image';
import Link from 'next/link';
import { getEssays } from '@/lib/essays';
import { getProjects } from '@/lib/projects';
import ProjectCard from './components/ProjectCard';
import SiteNav from './components/SiteNav';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [projectsData, essays] = await Promise.all([
    getProjects(),
    getEssays(),
  ]);
  const latestEssays = essays.slice(0, 3);
  const projects = projectsData.length > 0
    ? projectsData
    : [
        {
          id: 'placeholder-project',
          title: 'Projects are coming online',
          slug: 'projects-coming-online',
          url: null,
          shortStory: 'Add projects from admin once Neon is connected.',
          status: 'building' as const,
          tags: ['admin', 'neon'],
          isPrivate: false,
          featured: false,
          displayOrder: 0,
          startedAt: null,
          endedAt: null,
          stripeEnvVar: null,
          stripeSecretConfigured: false,
          revenueMonths: [],
          revenueUpdatedAt: null,
        },
      ];

  return (
    <main className="home-shell">
      <SiteNav />

      <header className="home-hero">
        <div className="hero-copy">
          <div className="hero-profile">
            <Image
              src="/avatar.jpg"
              alt="Jack Lynch"
              width={88}
              height={88}
              className="avatar"
              priority
            />
            <div>
              <h1>Jack Lynch</h1>
              <p className="hero-meta">NYC · Software developer · Builder</p>
            </div>
          </div>

          <div>
            <p>
              I&apos;m a software developer in New York City documenting the projects, ideas,
              books, and side quests that get me fired up.
            </p>
            <div className="hero-actions">
              <Link href="/essays/my-name-is-jack" className="primary-link">Read the story</Link>
              <Link href="/essays" className="secondary-link">More essays</Link>
            </div>
          </div>

          <p className="social-links">
            <a href="https://twitter.com/jack_lynch00">Twitter</a>
            <a href="https://linkedin.com/in/0-jack-lynch">LinkedIn</a>
            <a href="https://www.instagram.com/jack_lynch00">Instagram</a>
          </p>
        </div>

        <div className="dashboard-stack">
          {latestEssays.length > 0 && (
            <section className="hero-essays" aria-labelledby="latest-essays-heading">
              <h2 id="latest-essays-heading" className="dashboard-section-title">Recent Essays</h2>

              <div className="hero-essay-grid">
                {latestEssays.map((essay) => (
                  <Link href={`/essays/${essay.slug}`} className="hero-essay-card" key={essay.slug}>
                    <span>{essay.date}</span>
                    <strong>{essay.title}</strong>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section id="projects" className="hero-projects" aria-labelledby="project-log-heading">
            <div className="hero-projects-header">
              <div>
                <p className="hero-card-label">Project log</p>
                <h2 id="project-log-heading">Builds in motion</h2>
              </div>
            </div>

            <div className="project-grid hero-project-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} compact />
              ))}
            </div>
          </section>
        </div>
      </header>
    </main>
  );
}
