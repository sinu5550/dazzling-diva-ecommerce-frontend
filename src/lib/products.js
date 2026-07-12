import { apiClient } from "./apiClient";

export async function getProducts(filters = {}, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return await apiClient(`/api/product?${params.toString()}`, {
      revalidate: 60, // cache for 1 minute
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
    revalidate: 60,
  });
}


export async function getRelatedProducts(subCategoryId, currentProductId, limit = 4) {
  const response = await getProducts({ subCategoryId }, 1, limit + 1);

  const products = response?.data?.products || [];

  return products
    .filter(p => p.id !== currentProductId)
    .slice(0, limit);
}


export async function getDiscountProductBySlug(slug) {
  return apiClient(`/api/discount-campaign/discount-product/${slug}`, {
    revalidate: 60,
  });
}
