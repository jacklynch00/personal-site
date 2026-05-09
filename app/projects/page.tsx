import { Metadata } from 'next';
import ProjectCard from '../components/ProjectCard';
import SiteNav from '../components/SiteNav';
import { getProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects — Jack Lynch',
  description: 'Things Jack Lynch is building, launching, pausing, and retiring.',
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="public-page-shell">
      <SiteNav />

      <section className="page-hero">
        <h1>Project log</h1>
        <p>
          The live record of things I am building, launching, pausing, retiring, and learning from.
        </p>
      </section>

      {projects.length > 0 ? (
        <section className="project-grid project-grid-full">
          {projects.map((project) => (
            <div id={project.slug} key={project.id}>
              <ProjectCard project={project} />
            </div>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>Projects are warming up.</h2>
          <p>
            Connect `DATABASE_URL`, add projects in admin, and this page becomes the public build archive.
          </p>
        </section>
      )}
    </main>
  );
}
