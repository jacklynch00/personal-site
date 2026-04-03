import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const footnotesDirectory = path.join(process.cwd(), 'content', 'footnotes');

export interface Footnote {
  slug: string;
  title: string;
  date: string;
  prompt: string;
  content: string;
}

export async function getFootnotes(): Promise<Footnote[]> {
  if (!fs.existsSync(footnotesDirectory)) return [];

  const fileNames = fs.readdirSync(footnotesDirectory);
  const footnotes = fileNames
    .filter((f) => f.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(footnotesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        prompt: (data.prompt as string) || '',
        content: fileContents,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return footnotes;
}

export async function getFootnote(slug: string): Promise<Footnote | null> {
  const fullPath = path.join(footnotesDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    prompt: (data.prompt as string) || '',
    content,
  };
}
