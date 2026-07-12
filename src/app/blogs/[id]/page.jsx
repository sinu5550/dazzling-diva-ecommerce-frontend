import BlogDetails from "@/components/Blogs/BlogsDetails";
import { apiClient } from "@/lib/apiClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const blog = await apiClient(`/api/blog/${id}`);

    return {
      title: `${blog?.title || "Blog Details"} | Dazzling Diva`,
      description:
        blog?.shortDescription ||
        blog?.description?.slice(0, 160) ||
        "Read the latest fashion insights, style tips, and trend updates from Dazzling Diva.",
      keywords: [
        "Dazzling Diva Blog",
        "Fashion Blog",
        "Style Tips",
        "Fashion Trends",
        blog?.title,
      ],
      openGraph: {
        title: `${blog?.title} | Dazzling Diva`,
        description:
          blog?.shortDescription ||
          "Explore fashion trends and lifestyle insights from Dazzling Diva.",
        images: [
          {
            url: blog?.image,
            width: 1200,
            height: 630,
            alt: blog?.title,
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: "Blog Details | Dazzling Diva",
      description: "Explore the latest blogs and fashion insights from Dazzling Diva.",
    };
  }
}

export default async function BlogDetailsPage({ params }) {
  const { id } = await params;

  let blogData = null;

  try {
    blogData = await apiClient(`/api/blog/${id}`);
  } catch (error) {
    console.error("Error fetching blog:", error);
    notFound();
  }

  return <BlogDetails blogData={blogData} />;
}