// lib/apiClient.js
export async function apiClient(endpoint, { revalidate, tags, ...options } = {}) {
    const baseURL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("supabase_access_token")
            : null;

    const res = await fetch(`${baseURL}${cleanEndpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
            ...(options.headers || {}),
        },
        ...(revalidate !== undefined || tags !== undefined ? { next: { revalidate, tags } } : {}),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || data);
}

