import ProductDetailsClient from '@/components/Products/ProductDetailsClient';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { notFound } from 'next/navigation';

export default async function ProductDetailsPage({ params }) {

    
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const product = await getProductBySlug(slug);

    if (!product) {
        console.log('❌ Product not found, showing 404');
        notFound();
    }


    // Fetch related products
    const relatedProducts = await getRelatedProducts(
        product.subCategoryId,
        product.id,
        4
    );

    return (
        <ProductDetailsClient
            product={product} 
            relatedProducts={relatedProducts}
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

