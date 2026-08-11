import { apiClient } from "./apiClient";

export async function getProducts(filters = {}, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return await apiClient(`/api/product?${params.toString()}`, {
      tags: ["products"],
      revalidate: 15, // fast revalidate (15 seconds)
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}


export const getProductsBySubCategory = (id, p = 1, l = 10) =>
  getProducts({ subCategoryId: id }, p, l);

export const getProductsBySubCategoryName = (name, p = 1, l = 10) =>
  getProducts({ subCategoryName: name }, p, l);

export const getProductsByCategoryName = (name, p = 1, l = 10) =>
  getProducts({ categoryName: name }, p, l);

export const getProductsByMainCategoryName = (name, p = 1, l = 10) =>
  getProducts({ mainCategoryName: name }, p, l);

export const getProductsByCategory = (id, p = 1, l = 10) =>
  getProducts({ categoryId: id }, p, l);

export const getProductsByMainCategory = (id, p = 1, l = 10) =>
  getProducts({ mainCategoryId: id }, p, l);


export async function getProductBySlug(slug) {
  return apiClient(`/api/product/${slug}`, {
    tags: ["products", `product-${slug}`],
    revalidate: 15,
  });
}


export async function getRelatedProducts(subCategoryId, currentProductId, limit = 8, categoryId = null, mainCategoryId = null) {
  try {
    let products = [];
    
    // 1. Try fetching by subCategoryId first
    if (subCategoryId) {
      const response = await getProducts({ subCategoryId }, 1, 20);
      const fetched = response?.products || response?.data?.products || response?.data || [];
      if (Array.isArray(fetched)) {
        products.push(...fetched);
      }
    }

    // 2. If fewer than requested limit, fallback to same parent categoryId
    if (products.filter(p => p.id !== currentProductId).length < limit && categoryId) {
      const catResponse = await getProducts({ categoryId }, 1, 20);
      const catProducts = catResponse?.products || catResponse?.data?.products || catResponse?.data || [];
      if (Array.isArray(catProducts)) {
        const existingIds = new Set(products.map(p => p.id));
        for (const p of catProducts) {
          if (!existingIds.has(p.id)) {
            products.push(p);
          }
        }
      }
    }

    // 3. If still fewer, fallback to mainCategoryId
    if (products.filter(p => p.id !== currentProductId).length < limit && mainCategoryId) {
      const mainResponse = await getProducts({ mainCategoryId }, 1, 20);
      const mainProducts = mainResponse?.products || mainResponse?.data?.products || mainResponse?.data || [];
      if (Array.isArray(mainProducts)) {
        const existingIds = new Set(products.map(p => p.id));
        for (const p of mainProducts) {
          if (!existingIds.has(p.id)) {
            products.push(p);
          }
        }
      }
    }

    return products
      .filter(p => p && p.id !== currentProductId)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}


export async function getDiscountProductBySlug(slug) {
  return apiClient(`/api/discount-campaign/discount-product/${slug}`, {
    tags: ["discount-products", `discount-product-${slug}`],
    revalidate: 15,
  });
}

