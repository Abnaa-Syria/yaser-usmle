import { useQuery } from "@tanstack/react-query";
import {
  fetchPublicCourseById,
  fetchPublicCourses,
  fetchPublicCategories,
  fetchPublicPackageById,
  fetchPublicPackages,
  fetchPublicLandingPage,
  fetchPublicPostBySlug,
  fetchPublicPosts,
  fetchPublicCmsPage,
  fetchRecommendedCourses,
  type PublicCoursesQuery,
  type PublicPostsQuery,
} from "./api";

export function useRecommendedCourses(filter = "bestseller", limit = 8) {
  return useQuery({
    queryKey: ["public", "courses", "recommended", filter, limit],
    queryFn: () => fetchRecommendedCourses({ filter, limit }),
    retry: false,
    staleTime: 60_000,
  });
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ["public", "categories"],
    queryFn: fetchPublicCategories,
    retry: false,
    staleTime: 60_000,
  });
}

export function usePublicCourses(params: PublicCoursesQuery, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["public", "courses", params],
    queryFn: () => fetchPublicCourses(params),
    enabled: options.enabled !== false,
    retry: false,
  });
}

export function usePublicCourse(id: string | undefined) {
  return useQuery({
    queryKey: ["public", "course", id],
    queryFn: () => fetchPublicCourseById(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function usePublicPackages() {
  return useQuery({
    queryKey: ["public", "packages"],
    queryFn: fetchPublicPackages,
    retry: false,
  });
}

export function usePublicPackage(id: string | undefined) {
  return useQuery({
    queryKey: ["public", "package", id],
    queryFn: () => fetchPublicPackageById(id as string),
    enabled: !!id,
    retry: false,
  });
}

export function usePublicLandingPage() {
  return useQuery({
    queryKey: ["public", "landing-page"],
    queryFn: () => fetchPublicLandingPage(),
    retry: false,
  });
}

export function usePublicPosts(params: PublicPostsQuery) {
  return useQuery({
    queryKey: ["public", "posts", params],
    queryFn: () => fetchPublicPosts(params),
    retry: false,
  });
}

export function usePublicPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["public", "post", slug],
    queryFn: () => fetchPublicPostBySlug(slug as string),
    enabled: !!slug,
    retry: false,
  });
}

export function usePublicCmsPage(slug: string | undefined) {
  return useQuery({
    queryKey: ["public", "cms-page", slug],
    queryFn: () => fetchPublicCmsPage(slug as string),
    enabled: !!slug,
    retry: false,
    staleTime: 60_000,
  });
}
