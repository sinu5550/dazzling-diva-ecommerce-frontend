import AllProductsClient from '@/components/Products/AllProductsClient';
import { getProductsByCategoryName } from '@/lib/products';
import { apiClient } from '@/lib/apiClient';

export default async function CategoryProductsPage({ params, searchParams }) {

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categoryName = decodeURIComponent(resolvedParams.name);
  const page = parseInt(resolvedSearchParams.page || '1');

  try {
    const [response, campaignsRes] = await Promise.all([
      getProductsByCategoryName(categoryName, page, 24),
      apiClient('/api/discount-campaign/active').catch(() => [])
    ]);

    let products = response?.products || [];
    const campaigns = Array.isArray(campaignsRes) ? campaignsRes : (campaignsRes?.data || campaignsRes?.campaigns || []);
    const activeCampaign = campaigns.find(c => c.appliesToAll);

    if (activeCampaign && products.length > 0) {
      const campaignInfo = {
        campaignId: activeCampaign.id,
        campaignName: activeCampaign.name,
        campaignType: activeCampaign.campaignType,
        discountType: activeCampaign.discountType,
        discountValue: parseFloat(activeCampaign.discountValue) || 0,
        maxDiscountAmount: activeCampaign.maxDiscountAmount
          ? parseFloat(activeCampaign.maxDiscountAmount)
          : null,
        appliesToAll: activeCampaign.appliesToAll,
        startAt: activeCampaign.startAt,
        endAt: activeCampaign.endAt,
        showCountdown: activeCampaign.showCountdown,
        badgeText: activeCampaign.badgeText,
        badgeColor: activeCampaign.badgeColor,
        priority: activeCampaign.priority || 0,
      };

      products = products.map(p => ({
        ...p,
        campaignInfo: p.campaignInfo || campaignInfo
      }));
    }

    if (!products.length) {
      return (
        <div className="text-center text-gray-800 mt-24">
          <h1 className="text-2xl font-bold mb-4">No Products Found</h1>
          <p>There are no products in category: {categoryName}</p>
        </div>
      );
    }

    return (
      <AllProductsClient
        initialProducts={products}
        title={categoryName}
        breadcrumbLabel={categoryName}
        fetchUrl={`/api/product?categoryName=${encodeURIComponent(categoryName)}&page=1&limit=1000`}
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

