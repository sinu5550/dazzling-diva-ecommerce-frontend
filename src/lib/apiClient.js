// utils/apiClient.js
export async function apiClient(endpoint, { revalidate, ...options } = {}) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem('supabase_access_token') : null;

    try {
        const res = await fetch(`${baseURL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {}),
            },
            // cache: "no-store",
            next: { revalidate },
        });

        if (!res.ok) {
            if (res.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('supabase_access_token');
                localStorage.removeItem('supabase_refresh_token');
                localStorage.removeItem('supabase_user');
                window.dispatchEvent(new Event('authChange'));
            }
            const errorText = await res.text();
            throw new Error(`API Error (${res.status}): ${errorText}`);
        }

        return res.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            // Return a never-resolving promise for browser/navigation aborts
            // to suppress downstream state updates and errors on unmounted components
            return new Promise(() => {});
        }
        throw error;
    }
}

