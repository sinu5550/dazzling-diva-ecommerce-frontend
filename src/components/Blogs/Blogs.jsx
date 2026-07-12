"use client";

import Container from "@/components/Container/Container";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaLongArrowAltRight } from "react-icons/fa";
import LoadingSpinner from "../ui/LoadingSpinner";

const Blogs = ({ blogsData }) => {

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (blogsData.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="my-16">
      {/* Breadcrumb */}
      <div className="flex gap-2 text-gray-700 mt-10 text-sm md:text-base">
        <Link href="/" className="hover:underline hover:text-teal-600">
          Home
        </Link>{" "}
        /<p className="font-semibold">Blogs</p>
      </div>

      <div className="mt-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-800 font-philosopher mb-12">
          News about our company and Blogs!
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 pb-16">
          {blogsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((item) => (
              <div
                key={item.id}
                className="flex flex-col h-full transition-shadow duration-300 bg-white shadow-sm hover:shadow-lg rounded-md"
                data-aos="fade-up"
              >
                <div className="overflow-hidden group">
                  <Image
                    src={item.thumbnailImage}
                    alt={item.title}
                    width={400}
                    height={400}
                    className="w-full h-[230px] object-cover transition-transform duration-700 ease-out group-hover:scale-105 rounded-t-md"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col flex-grow p-5">
                  <div className="flex items-center mb-2 text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800 line-clamp-2">
                    {item.title}
                  </h3>
                  <Link href={`/blogs/${item.id}`}>
                    <button className="flex items-center gap-2 mt-2 bg-white text-gray-900  px-2 lg:px-4 py-1 lg:py-2 rounded lg:rounded-md text-sm lg:text-md font-semibold border border-gray-800 hover:border-[#05837F] hover:text-[#05837F] transition-all duration-300 cursor-pointer group">
                      Read More <FaLongArrowAltRight className="mt-0.5 group-hover:translate-x-1 transition-all duration-500" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Container>
  );
};

export default Blogs;
