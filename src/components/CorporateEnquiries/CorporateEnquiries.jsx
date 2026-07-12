'use client'

import React from 'react';
import Container from "../Container/Container";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Mail, Phone } from "lucide-react";

const CorporateEnquiries = ({ contactData }) => {

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        reset();
    };

    const { phone_number, telephone, primary_email, secondary_email } = contactData?.data || {};

    return (
        <Container className="my-16 pb-16">
            {/* Breadcrumb */}
            <div className="flex gap-2 text-gray-700 mt-10 text-sm md:text-base">
                <Link href="/" className="hover:underline">Home</Link> /
                <p className="font-semibold">Corporate Enquiries</p>
            </div>

            <div className="mt-10">
                <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-800 font-philosopher mb-12">
                    Contact Us
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-8 text-gray-800">
                    {/* Left Side */}
                    <div className="bg-white p-8 rounded-xl shadow-xl space-y-6 border border-gray-200">
                        {/* Call To Us */}
                        <div className="flex items-start gap-4">
                            <div className="bg-[#FDDA06] p-3 rounded-full">
                                <Phone className="w-6 h-6 text-gray-800" />
                            </div>
                            <div className="font-poppins space-y-2">
                                <h3 className="font-semibold text-lg">Call To Us</h3>
                                <p className="text-gray-600 text-sm">
                                    We are available 24/7, 7 days a week.
                                </p>
                                <div className="flex items-center gap-3">
                                    <p>Mobile : </p>
                                    <a
                                        href={`tel:${phone_number}`}
                                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300 text-[14px] font-poppins"
                                    >
                                        {phone_number}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3 mb-10">
                                    <p>Telephone : </p>

                                    <a
                                        href={`tel:${telephone}`}
                                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300 text-[14px] font-poppins"
                                    >
                                        {telephone || 'N/A'}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Write To Us */}
                        <div className="flex items-start gap-4">
                            <div className="bg-[#FDDA06] p-3 rounded-full">
                                <Mail className="w-6 h-6 text-gray-800" />
                            </div>
                            <div className="font-poppins space-y-2">
                                <h3 className="font-semibold text-lg">Write To Us</h3>
                                <p className="text-gray-600 text-sm">
                                    Fill out our form and we will contact you within 24 hours.
                                </p>
                                <div className="flex items-center gap-3">
                                    <p>Email : </p>
                                    <a
                                        href={`mailto:${primary_email}`}
                                        className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-[14px] font-poppins"
                                    >
                                        {primary_email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p>Email : </p>
                                    <a
                                        href={`mailto:${secondary_email}`}
                                        className="text-gray-600 hover:text-gray-900 transition-colors duration-300 text-[14px] font-poppins"
                                    >
                                        {secondary_email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-white p-8 rounded-xl shadow-xl space-y-6 border border-gray-200"
                    >
                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name *"
                                    {...register("name", { required: "Name is required" })}
                                    className="w-full border border-stone-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="email"
                                    placeholder="Your Email *"
                                    {...register("email", { required: "Email is required" })}
                                    className="w-full border border-stone-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Phone *"
                                    {...register("phone", { required: "Phone is required" })}
                                    className="w-full border border-stone-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <textarea
                                placeholder="Your Message"
                                rows="6"
                                {...register("message", { required: "Message is required" })}
                                className="w-full border border-stone-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            />
                            {errors.message && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.message.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary-hover text-black font-medium px-8 py-3 rounded shadow-md transition"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Container>
    );
};

export default CorporateEnquiries;