import ProductsPageClient from '@/components/Products/ProductsPageClient';
import { getProductsByCategoryName } from '@/lib/products';

export default async function CategoryProductsPage({ params, searchParams }) {

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categoryName = decodeURIComponent(resolvedParams.name);
  const page = parseInt(resolvedSearchParams.page || '1');

  try {
    const response = await getProductsByCategoryName(categoryName, page, 100);

    if (!response.products.length) {
      return (
        <div className="text-center text-gray-800 mt-24">
          <h1 className="text-2xl font-bold mb-4">No Products Found</h1>
          <p>There are no products in category: {categoryName}</p>
        </div>
      );
    }

    return (
      <ProductsPageClient
        initialProducts={response.products}
        subCategoryName={response.products[0]?.subCategory.category.name || categoryName}
        filterType="category"
        isLoading={true}
      />
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="text-center mt-24">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Products</h1>
        <p>Failed to load products for: {categoryName}</p>
      </div>
    );
  }
}

// Generate metadata
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.name);

  return {
    title: `${categoryName} Products | Dazzling Diva`,
    description: `Browse our collection of ${categoryName} products`,
  };
}

