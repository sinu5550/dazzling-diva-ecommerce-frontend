import ProductsPageClient from '@/components/Products/ProductsPageClient';
import { getProductsBySubCategoryName } from '@/lib/products';

export default async function SubCategoryProductsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const subCategoryName = decodeURIComponent(resolvedParams.name);
  const page = parseInt(resolvedSearchParams.page || '1');

  try {
    const response = await getProductsBySubCategoryName(subCategoryName, page, 100);

    if (!response.products.length) {
      return (
        <div className="text-center text-gray-800 mt-24">
          <h1 className="text-2xl font-bold mb-4">No Products Found</h1>
          <p>There are no products in subcategory: {subCategoryName}</p>
        </div>
      );
    }

    return (
      <ProductsPageClient
        initialProducts={response.products}
        subCategoryName={response.products[0]?.subCategory.name || subCategoryName}
        filterType="subcategory"
        isLoading={true}
      />
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="text-center mt-24">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Products</h1>
        <p>Failed to load products for: {subCategoryName}</p>
      </div>
    );
  }
}

// Generate metadata
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const subCategoryName = decodeURIComponent(resolvedParams.name);
  
  return {
    title: `${subCategoryName} | Dazzling Diva`,
    description: `Browse our collection of ${subCategoryName}`,
  };
}