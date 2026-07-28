import { apiClient } from "./apiClient";

export async function getTestimonials() {
  try {
    return await apiClient("/api/testimonials", { revalidate: 60 });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    throw error;
  }
}

/**
 * Creates a new testimonial using apiClient (which attaches Bearer token from localStorage)
 * @param {Object} testimonialData
 * @param {string} testimonialData.name
 * @param {string} testimonialData.image
 * @param {number} testimonialData.rating
 * @param {string} testimonialData.description
 */
export async function createTestimonial(testimonialData) {
  try {
    return await apiClient("/api/testimonials", {
      method: "POST",
      body: JSON.stringify(testimonialData),
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
}

/**
 * Seed multiple testimonials sequentially using logged-in user's token
 */
export async function seedTestimonials(items) {
  const results = [];
  for (const item of items) {
    try {
      const res = await createTestimonial(item);
      results.push({ success: true, item: item.name, res });
    } catch (err) {
      results.push({ success: false, item: item.name, error: err.message });
    }
  }
  return results;
}
