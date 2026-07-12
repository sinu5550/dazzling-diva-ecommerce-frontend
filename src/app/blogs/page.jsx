import Blogs from "@/components/Blogs/Blogs";
import { apiClient } from "@/lib/apiClient";

export const metadata = {
  title: "Blog | Dazzling Diva",
  description:
    "Read the latest fashion blogs, style guides, trends, and lifestyle insights from Dazzling Diva.",
};
const page = async () => {

  const blogsData = await apiClient("/api/blog");

  return (
    <div>
      <Blogs blogsData={blogsData} />
    </div>
  );
};

export default page;
