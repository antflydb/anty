import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const guidesDirectory = path.join(process.cwd(), 'content/guides');
const blogDirectory = path.join(process.cwd(), 'content/blog');

export interface Post {
  slug: string;
  title: string;
  description: string;
  category?: string;
  date?: string;
  author?: string;
  image?: string;
  content: string;
}

export function getGuides(): Post[] {
  if (!fs.existsSync(guidesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(guidesDirectory);
  const guides = fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.(md|mdx)$/, '');
      const fullPath = path.join(guidesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        category: data.category,
        readTime: data.readTime,
        image: data.image,
        content,
      };
    });

  return guides;
}

export function getGuideBySlug(slug: string): Post | null {
  if (!fs.existsSync(guidesDirectory)) {
    return null;
  }

  const fullPath = path.join(guidesDirectory, `${slug}.md`);
  const fullPathMdx = path.join(guidesDirectory, `${slug}.mdx`);

  let filePath = '';
  if (fs.existsSync(fullPath)) {
    filePath = fullPath;
  } else if (fs.existsSync(fullPathMdx)) {
    filePath = fullPathMdx;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    category: data.category,
    readTime: data.readTime,
    image: data.image,
    content,
  };
}

export function getBlogPosts(): Post[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const posts = fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.(md|mdx)$/, '');
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        date: data.date,
        author: data.author,
        image: data.image,
        content,
      };
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  return posts;
}

export function getBlogPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(blogDirectory)) {
    return null;
  }

  const fullPath = path.join(blogDirectory, `${slug}.md`);
  const fullPathMdx = path.join(blogDirectory, `${slug}.mdx`);

  let filePath = '';
  if (fs.existsSync(fullPath)) {
    filePath = fullPath;
  } else if (fs.existsSync(fullPathMdx)) {
    filePath = fullPathMdx;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date,
    author: data.author,
    image: data.image,
    content,
  };
}
