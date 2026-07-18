import { getProductBySlug } from '@/lib/products';

import ProductDetailsLoader from '@/components/Products/ProductDetailsLoader';

export default async function ProductDetailsPage({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    return (
        <ProductDetailsLoader
            key={slug}
            slug={slug}
            type="product"
        />
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const product = await getProductBySlug(slug);
    
    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    // Remove HTML tags from description
    const plainDescription = product.description
        ?.replace(/<[^>]*>/g, '')
        .substring(0, 160) || '';

    return {
        title: `${product.productName} - ${product.brand?.name || 'Shop'}`,
        description: plainDescription,
        openGraph: {
            title: product.productName,
            description: plainDescription,
            images: product.images.map(img => ({
                url: img,
                alt: product.productName,
            })),
        },
    };
};

