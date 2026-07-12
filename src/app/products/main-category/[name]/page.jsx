import ProductsPageClient from '@/components/Products/ProductsPageClient';
import { getProductsByMainCategoryName } from '@/lib/products';

export default async function MainCategoryProductsPage({ params, searchParams }) {

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const mainCategoryName = decodeURIComponent(resolvedParams.name);
  const page = parseInt(resolvedSearchParams.page || '1');

  try {

    const response = await getProductsByMainCategoryName(mainCategoryName, page, 100);

    if (!response.products.length) {
      return (
        <div className="text-center text-gray-800 mt-24">
          <h1 className="text-2xl font-bold mb-4">No Products Found</h1>
          <p>There are no products in main category: {mainCategoryName}</p>
        </div>
      );
    }

    return (
      <ProductsPageClient
        initialProducts={response.products}
        subCategoryName={response.products[0]?.subCategory.category.mainCategory.name || mainCategoryName}
        filterType="main-category"
        isLoading={true}
      />
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="text-center mt-24">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Products</h1>
        <p>Failed to load products for: {mainCategoryName}</p>
      </div>
    );
  }
}

// Generate metadata
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const mainCategoryName = decodeURIComponent(resolvedParams.name);

  return {
    title: `${mainCategoryName} Products | Dazzling Diva`,
    description: `Browse our collection of ${mainCategoryName} products`,
  };
}




