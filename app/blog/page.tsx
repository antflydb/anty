import { getBlogPosts } from "@/lib/markdown";
import { BlogPageClient } from "./blog-page-client";

export default function BlogPage() {
  const posts = getBlogPosts();

  return <BlogPageClient posts={posts} />;
}
