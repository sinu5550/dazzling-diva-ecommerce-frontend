// utils/apiClient.js
export async function apiClient(endpoint, { revalidate, ...options } = {}) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        // cache: "no-store",
        next: { revalidate },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error (${res.status}): ${errorText}`);
    }

    return res.json();
}
