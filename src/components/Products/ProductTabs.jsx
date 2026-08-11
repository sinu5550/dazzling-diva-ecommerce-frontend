// components/products/ProductTabs.jsx
'use client';

import { useState } from 'react';

export default function ProductTabs({ product }) {
    const [activeTab, setActiveTab] = useState('description');

    const tabs = [
        { id: 'description', label: 'Description' },
        { id: 'specifications', label: 'Specifications' },
        { id: 'warranty', label: 'Warranty & Delivery' },
    ];

    return (
        <div className="border border-gray-200 diva-rounded overflow-hidden">
                {/* Tab Headers - Horizontal scroll on mobile */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 text-xs md:text-sm px-4 py-3 sm:px-6 sm:py-3.5 font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-secound border-b-2 border-secound'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6 bg-white">
                    {activeTab === 'description' && (
                        <div
                            className="prose prose-sm max-w-none text-gray-600 text-xs md:text-sm"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    {activeTab === 'specifications' && (
                        <div className="space-y-3 text-xs md:text-sm">
                            {/* Desktop: Grid layout, Mobile: Stacked layout */}
                            <div className="block sm:grid sm:grid-cols-2 sm:gap-6">
                                <div className="space-y-2 mb-2 sm:mb-0">
                                    <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-700 sm:w-36 sm:flex-shrink-0">SKU:</span>
                                        <span className="text-gray-600 mt-0.5 sm:mt-0 break-words">{product.sku}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-700 sm:w-36 sm:flex-shrink-0">Brand:</span>
                                        <span className="text-gray-600 mt-0.5 sm:mt-0 break-words">{product.brand?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-700 sm:w-36 sm:flex-shrink-0">Unit:</span>
                                        <span className="text-gray-600 mt-0.5 sm:mt-0 break-words">{product.unit?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-700 sm:w-36 sm:flex-shrink-0">Selling Type:</span>
                                        <span className="text-gray-600 mt-0.5 sm:mt-0 capitalize break-words">{product.sellingType}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-700 sm:w-36 sm:flex-shrink-0">Store:</span>
                                        <span className="text-gray-600 mt-0.5 sm:mt-0 break-words">{product.store}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-700 sm:w-36 sm:flex-shrink-0">Warehouse:</span>
                                        <span className="text-gray-600 mt-0.5 sm:mt-0 break-words">{product.warehouse}</span>
                                    </div>
                                    {product.manufacturer && (
                                        <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-2">
                                            <span className="font-semibold text-gray-700 sm:w-36 sm:flex-shrink-0">Manufacturer:</span>
                                            <span className="text-gray-600 mt-0.5 sm:mt-0 break-words">{product.manufacturer}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'warranty' && (
                        <div className="space-y-5 text-xs md:text-sm">
                            {product.warranty && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2 text-sm md:text-base">
                                        {product.warranty.name}
                                    </h4>
                                    <p className="text-gray-600 mb-1.5">
                                        <strong className="font-semibold text-gray-700">Duration:</strong> {product.warranty.duration} {product.warranty.period}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong className="font-semibold text-gray-700">Description:</strong> {product.warranty.description}
                                    </p>
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Delivery Information</h4>
                                <ul className="list-disc list-inside text-gray-600 space-y-1.5">
                                    <li>Standard delivery: 3-7 business days</li>
                                    <li>Express delivery available in major cities</li>
                                    <li>Cash on delivery available</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            );
}
