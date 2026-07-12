"use client";

import Container from "@/components/Container/Container";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaLongArrowAltRight } from "react-icons/fa";

const Blogs = ({ blogs }) => {


  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });


    const blogsData  = blogs.slice(0, 4);

  return (
    <div className="">
      <Container>
        <div className="flex justify-between items-center py-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 font-philosopher">
            From Our Blog
          </h2>
          <Link
            href="/blogs"
            className="btn text-gray-800 underline cursor-pointer"
          >
            View More
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 pb-16 mb-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {[...blogsData]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((item) => (
              <div
                key={item.id}
                className="flex flex-col h-full transition-shadow duration-300 bg-white shadow-xs hover:shadow-lg rounded-md"
                data-aos="fade-up"
                data-aos-anchor-placement="top-bottom"
              >
                <div className=" overflow-hidden group font-">
                  <Image
                    className="w-full h-[230px] object-cover transition-all duration-700 ease-out group-hover:scale-105 rounded"
                    src={item.thumbnailImage}
                    alt={item.title}
                    width={400}
                    height={230}
                  />
                </div>

                <div className="flex flex-col flex-grow p-5">
                  <div className="flex items-center justify-start mb-2 text-sm text-gray-500">
                    <time
                      dateTime={item.createdAt}
                      className="flex items-center gap-1"
                    >
                      <Calendar size={14} />
                      {formatDate(item.createdAt)}
                    </time>
                  </div>
                  <h3 className="mb-3 text-lg lg:text-xl font-bold text-gray-800 line-clamp-2">
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
      </Container>
    </div>
  );
};

export default Blogs;
