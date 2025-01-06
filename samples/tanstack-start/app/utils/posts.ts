import { notFound } from "@tanstack/react-router";
import { allPosts } from "content-collections";

export function findPostBySlug(slug: string) {
  const post = allPosts.find((post) => post._meta.path === slug);
  if (!post) {
    throw notFound();
  }
  return post;
}
