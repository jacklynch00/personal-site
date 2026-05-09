'use client';

import { useEffect, useState } from 'react';
import { PROJECT_STATUSES, Project, ProjectStatus, formatStatus, projectRevenueTotal } from '@/lib/projectTypes';

const emptyForm = {
  title: '',
  slug: '',
  url: '',
  shortStory: '',
  status: 'building' as ProjectStatus,
  tags: '',
  isPrivate: false,
  featured: false,
  displayOrder: 0,
  startedAt: '',
  endedAt: '',
  stripeEnvVar: '',
  stripeSecretKey: '',
};

type ProjectForm = typeof emptyForm;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function projectToForm(project: Project): ProjectForm {
  return {
    title: project.title,
    slug: project.slug,
    url: project.url || '',
    shortStory: project.shortStory,
    status: project.status,
    tags: project.tags.join(', '),
    isPrivate: project.isPrivate,
    featured: project.featured,
    displayOrder: project.displayOrder,
    startedAt: project.startedAt || '',
    endedAt: project.endedAt || '',
    stripeEnvVar: project.stripeEnvVar || '',
    stripeSecretKey: '',
  };
}

export default function ProjectAdmin({ password }: { password: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDrafts, setProjectDrafts] = useState<Record<string, ProjectForm>>({});
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (res.ok) {
        const nextProjects = data.projects || [];
        setProjects(nextProjects);
        setProjectDrafts(Object.fromEntries(nextProjects.map((project: Project) => [project.id, projectToForm(project)])));
      } else {
        setStatus(`Projects error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed to load projects: ${e}`);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      slug: key === 'title' ? slugify(String(value)) : current.slug,
    }));
  }

  function updateProjectDraft<K extends keyof ProjectForm>(id: string, key: K, value: ProjectForm[K]) {
    setProjectDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] || emptyForm),
        [key]: value,
      },
    }));
  }

  function startCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function saveNewProject() {
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          action: 'create',
          ...form,
          tags: form.tags,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Project created');
        setShowForm(false);
        setForm(emptyForm);
        await fetchProjects();
      } else {
        setStatus(`Project error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed to save project: ${e}`);
    }
    setSaving(false);
  }

  async function saveProject(project: Project) {
    const draft = projectDrafts[project.id];
    if (!draft) return;

    setSavingId(project.id);
    setStatus('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          action: 'update',
          id: project.id,
          ...draft,
          tags: draft.tags,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Saved ${draft.title || project.title}`);
        await fetchProjects();
      } else {
        setStatus(`Project error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed to save project: ${e}`);
    }
    setSavingId(null);
  }

  async function deleteProject(project: Project) {
    if (!confirm(`Delete "${project.title}"?`)) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'delete', id: project.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Project deleted');
        await fetchProjects();
      } else {
        setStatus(`Project error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed to delete project: ${e}`);
    }
  }

  async function refreshRevenue(project: Project) {
    setRefreshingId(project.id);
    setStatus('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'refresh-revenue', id: project.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Revenue refreshed');
        const nextProjects = data.projects || [];
        setProjects(nextProjects);
        setProjectDrafts(Object.fromEntries(nextProjects.map((nextProject: Project) => [nextProject.id, projectToForm(nextProject)])));
      } else {
        setStatus(`Revenue error: ${data.error}`);
      }
    } catch (e) {
      setStatus(`Failed to refresh revenue: ${e}`);
    }
    setRefreshingId(null);
  }

  return (
    <section id="projects" className="admin-card admin-card-large">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Build archive</p>
          <h2>Projects</h2>
          <p>Add public projects, status labels, links, tags, and encrypted Stripe keys.</p>
        </div>
        <button className="admin-button admin-button-primary" onClick={startCreate}>
          New project
        </button>
      </div>

      {showForm && (
        <div className="admin-form-panel">
          <div className="admin-form-title">
            <div>
              <h3>Create project</h3>
              <p>Add a new build to the public project log.</p>
            </div>
            <button className="admin-button admin-button-ghost" onClick={() => setShowForm(false)}>
              Close
            </button>
          </div>

          <div className="admin-field-grid">
            <label className="admin-field">
              <span>Title</span>
              <input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Case Study" />
            </label>
            <label className="admin-field">
              <span>Slug</span>
              <input value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="case-study" />
            </label>
          </div>

          <label className="admin-field">
            <span>Project URL</span>
            <input value={form.url} onChange={(e) => updateField('url', e.target.value)} placeholder="https://example.com" />
          </label>

          <label className="admin-field">
            <span>Short story</span>
            <textarea value={form.shortStory} onChange={(e) => updateField('shortStory', e.target.value)} placeholder="What is it, why did you build it, and what happened?" />
          </label>

          <div className="admin-field-grid">
            <label className="admin-field">
              <span>Status</span>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value as ProjectStatus)}>
                {PROJECT_STATUSES.map((projectStatus) => (
                  <option key={projectStatus} value={projectStatus}>{formatStatus(projectStatus)}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Tags</span>
              <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="AI, SaaS, F1" />
            </label>
          </div>

          <div className="admin-field-grid">
            <label className="admin-field">
              <span>Started</span>
              <input type="date" value={form.startedAt} onChange={(e) => updateField('startedAt', e.target.value)} />
            </label>
            <label className="admin-field">
              <span>Ended</span>
              <input type="date" value={form.endedAt} onChange={(e) => updateField('endedAt', e.target.value)} />
            </label>
            <label className="admin-field">
              <span>Display order</span>
              <input type="number" value={form.displayOrder} onChange={(e) => updateField('displayOrder', Number(e.target.value))} />
            </label>
          </div>

          <div className="admin-field-grid">
            <label className="admin-field">
              <span>Stripe secret key</span>
              <input
                value={form.stripeSecretKey}
                onChange={(e) => updateField('stripeSecretKey', e.target.value)}
                placeholder="rk_live_... or sk_live_..."
              />
            </label>
            <label className="admin-field">
              <span>Legacy env var fallback</span>
              <input value={form.stripeEnvVar} onChange={(e) => updateField('stripeEnvVar', e.target.value)} placeholder="STRIPE_PROJECT_SECRET_KEY" />
            </label>
          </div>
          <p className="admin-help">Pasted keys are encrypted in Postgres and never sent back to the browser after saving.</p>

          <div className="admin-toggle-row">
            <label><input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} /> Featured</label>
            <label><input type="checkbox" checked={form.isPrivate} onChange={(e) => updateField('isPrivate', e.target.checked)} /> Private</label>
          </div>

          <div className="admin-form-actions">
            <button className="admin-button admin-button-primary" onClick={saveNewProject} disabled={saving}>
              {saving ? 'Saving...' : 'Create project'}
            </button>
            <button className="admin-button admin-button-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="admin-muted">Loading projects...</p>}
      {!loading && projects.length === 0 && (
        <div className="admin-empty">
          <h3>No projects yet</h3>
          <p>Create the first one and it will appear on the public project log.</p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="admin-project-list">
          {projects.map((project) => {
            const draft = projectDrafts[project.id] || projectToForm(project);
            return (
              <div key={project.id} className="admin-project-editor">
                <div className="admin-project-editor-header">
                  <div>
                    <div className="admin-row-title">
                      <strong>{draft.title || project.title || 'Untitled project'}</strong>
                      <span className={`admin-pill admin-pill-${draft.status}`}>{formatStatus(draft.status)}</span>
                      {draft.isPrivate && <span className="admin-pill">Private</span>}
                      {draft.featured && <span className="admin-pill admin-pill-featured">Featured</span>}
                    </div>
                    <div className="admin-row-meta">
                      <span>{formatMoney(projectRevenueTotal(project))} TTM</span>
                      <span>{project.stripeSecretConfigured ? 'Stripe key saved' : project.stripeEnvVar || 'No Stripe key'}</span>
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <button className="admin-button admin-button-small" onClick={() => refreshRevenue(project)} disabled={refreshingId === project.id}>
                      {refreshingId === project.id ? 'Refreshing...' : 'Refresh $'}
                    </button>
                    <button className="admin-button admin-button-small admin-button-primary" onClick={() => saveProject(project)} disabled={savingId === project.id}>
                      {savingId === project.id ? 'Saving...' : 'Save'}
                    </button>
                    <button className="admin-button admin-button-small admin-button-danger" onClick={() => deleteProject(project)}>Delete</button>
                  </div>
                </div>

                <div className="admin-project-editor-grid">
                  <label className="admin-field">
                    <span>Title</span>
                    <input value={draft.title} onChange={(e) => updateProjectDraft(project.id, 'title', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Slug</span>
                    <input value={draft.slug} onChange={(e) => updateProjectDraft(project.id, 'slug', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Project URL</span>
                    <input value={draft.url} onChange={(e) => updateProjectDraft(project.id, 'url', e.target.value)} placeholder="https://example.com" />
                  </label>
                  <label className="admin-field admin-field-wide">
                    <span>Short story</span>
                    <textarea value={draft.shortStory} onChange={(e) => updateProjectDraft(project.id, 'shortStory', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Status</span>
                    <select value={draft.status} onChange={(e) => updateProjectDraft(project.id, 'status', e.target.value as ProjectStatus)}>
                      {PROJECT_STATUSES.map((projectStatus) => (
                        <option key={projectStatus} value={projectStatus}>{formatStatus(projectStatus)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Tags</span>
                    <input value={draft.tags} onChange={(e) => updateProjectDraft(project.id, 'tags', e.target.value)} placeholder="AI, SaaS, F1" />
                  </label>
                  <label className="admin-field">
                    <span>Display order</span>
                    <input type="number" value={draft.displayOrder} onChange={(e) => updateProjectDraft(project.id, 'displayOrder', Number(e.target.value))} />
                  </label>
                  <label className="admin-field">
                    <span>Started</span>
                    <input type="date" value={draft.startedAt} onChange={(e) => updateProjectDraft(project.id, 'startedAt', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Ended</span>
                    <input type="date" value={draft.endedAt} onChange={(e) => updateProjectDraft(project.id, 'endedAt', e.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Stripe secret key</span>
                    <input
                      value={draft.stripeSecretKey}
                      onChange={(e) => updateProjectDraft(project.id, 'stripeSecretKey', e.target.value)}
                      placeholder="Leave blank to keep current key"
                    />
                  </label>
                  <label className="admin-field">
                    <span>Legacy env var fallback</span>
                    <input value={draft.stripeEnvVar} onChange={(e) => updateProjectDraft(project.id, 'stripeEnvVar', e.target.value)} placeholder="STRIPE_PROJECT_SECRET_KEY" />
                  </label>
                </div>

                <div className="admin-toggle-row admin-project-toggle-row">
                  <label><input type="checkbox" checked={draft.featured} onChange={(e) => updateProjectDraft(project.id, 'featured', e.target.checked)} /> Featured</label>
                  <label><input type="checkbox" checked={draft.isPrivate} onChange={(e) => updateProjectDraft(project.id, 'isPrivate', e.target.checked)} /> Private</label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {status && <p className={status.includes('error') || status.includes('Failed') ? 'admin-status admin-status-error' : 'admin-status'}>{status}</p>}
    </section>
  );
}
