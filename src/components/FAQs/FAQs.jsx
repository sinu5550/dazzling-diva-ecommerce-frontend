'use client'

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import Container from "../Container/Container";

const FAQs = () => {

    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            category: "SHIPPING",
            faqs: [
                {
                    question: "Where are you located?",
                    answer: "We are located in Dhaka, Bangladesh."
                },
                {
                    question: "Do you ship outside the United States?",
                    answer:
                        "Yes, we ship worldwide. Shipping costs will be calculated at checkout."
                },
                {
                    question: "What carriers do you ship through and how is cost calculated?",
                    answer:
                        "We use DHL, FedEx, and UPS. Costs are calculated by weight and location."
                }
            ]
        },
        {
            category: "PRODUCT",
            faqs: [
                {
                    question: "What are the key features of this product?",
                    answer: "Our product is eco-friendly, durable, and easy to use."
                },
                {
                    question: "How does this product work?",
                    answer:
                        "Simply plug it in and follow the instructions provided in the manual."
                },
                {
                    question: "What materials is this product made from?",
                    answer: "It is made from 100% recycled and sustainable materials."
                }
            ]
        },
        {
            category: "PAYMENT",
            faqs: [
                {
                    question: "What are the key features of this product?",
                    answer: "Our product is eco-friendly, durable, and easy to use."
                },
                {
                    question: "How does this product work?",
                    answer:
                        "Simply plug it in and follow the instructions provided in the manual."
                },
                {
                    question: "What materials is this product made from?",
                    answer: "It is made from 100% recycled and sustainable materials."
                }
            ]
        },
        {
            category: "WHOLESALE",
            faqs: [
                {
                    question: "What are the key features of this product?",
                    answer: "Our product is eco-friendly, durable, and easy to use."
                },
                {
                    question: "How does this product work?",
                    answer:
                        "Simply plug it in and follow the instructions provided in the manual."
                },
                {
                    question: "What materials is this product made from?",
                    answer: "It is made from 100% recycled and sustainable materials."
                }
            ]
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Container>
            <div className="my-16">
                {/* Breadcrumb */}
                <div className="flex gap-2 text-gray-700 text-sm md:text-base mb-6">
                    <Link href="/" className="hover:underline hover:text-teal-600 transition-colors">Home</Link> /
                    <p className="font-semibold">FAQs</p>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold mb-10 text-gray-800 text-center font-philosopher my-5">Frequently Asked Questions</h2>

                {/* Categories */}
                {faqData.map((section, sectionIdx) => (
                    <div
                        key={sectionIdx}
                        className="mb-12 lg:flex gap-[10%]  w-full">
                        <h3 className="text-xl font-bold uppercase tracking-wider text-teal-600 mb-6 pb-2 border-b border-teal-100 uppercase">
                            {section.category}
                        </h3>

                        {/* Accordion */}
                        <div className="bg-white diva-rounded shadow-sm divide-y overflow-hidden w-full ">
                            {section.faqs?.map((item, faqIdx) => {
                                const index = `${sectionIdx}-${faqIdx}`;
                                const isOpen = openIndex === index;

                                return (
                                    <div key={faqIdx} className="border-b border-gray-100 last:border-b-0">
                                        <button
                                            className="w-full flex justify-between items-center py-5 px-6 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors duration-00"
                                            onClick={() => toggleAccordion(index)}
                                            aria-expanded={isOpen}
                                        >
                                            <span className="pr-4">{item.question}</span>
                                            {isOpen ? (
                                                <ChevronUp size={20} className="text-teal-600 flex-shrink-0" />
                                            ) : (
                                                <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />
                                            )}
                                        </button>

                                        {/* Smooth Transition */}
                                        <div
                                            className={`overflow-hidden transition-all duration-1000 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                        >
                                            <div className="pb-5 px-6 text-gray-600 leading-relaxed">
                                                {item.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default FAQs;
