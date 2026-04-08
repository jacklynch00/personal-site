import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const essaysDirectory = path.join(process.cwd(), 'content', 'essays');

export interface Essay {
  slug: string;
  title: string;
  date: string;
  draft?: boolean;
  archived?: boolean;
  content: string;
}

export async function getEssays(): Promise<Essay[]> {
  if (!fs.existsSync(essaysDirectory)) return [];

  const fileNames = fs.readdirSync(essaysDirectory);
  const essays = fileNames
    .filter((f) => f.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(essaysDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        draft: data.draft === true,
        archived: data.archived === true,
        content: fileContents,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return essays.filter((e) => !e.draft && !e.archived);
}

export async function getAllEssays(): Promise<Essay[]> {
  if (!fs.existsSync(essaysDirectory)) return [];

  const fileNames = fs.readdirSync(essaysDirectory);
  return fileNames
    .filter((f) => f.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(essaysDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        draft: data.draft === true,
        archived: data.archived === true,
        content: fileContents,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getEssay(slug: string): Promise<Essay | null> {
  const fullPath = path.join(essaysDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  if (data.draft === true || data.archived === true) return null;
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    content,
  };
}

export async function getRawEssay(slug: string): Promise<Essay | null> {
  const fullPath = path.join(essaysDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    draft: data.draft === true,
    archived: data.archived === true,
    content,
  };
}
