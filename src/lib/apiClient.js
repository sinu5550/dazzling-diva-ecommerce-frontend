// lib/apiClient.js
export async function apiClient(endpoint, { revalidate, skipAuth = false, ...options } = {}) {
    const baseURL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseURL}${cleanEndpoint}`;

    let token = null;
    if (typeof window !== 'undefined' && !skipAuth) {
        const storedUser = localStorage.getItem('supabase_user');
        if (storedUser) {
            token = localStorage.getItem('supabase_access_token');
        }
    }

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    try {
        let res = await fetch(url, {
            ...options,
            headers,
            ...(revalidate !== undefined ? { next: { revalidate } } : {}),
        });

        if (!res.ok) {
            const errorText = await res.text();

            if (res.status === 401 && typeof window !== 'undefined' && !options._isRetry) {
                const refreshTokenStr = localStorage.getItem('supabase_refresh_token');

                // 1. Try refreshing token if refresh token exists
                if (refreshTokenStr) {
                    try {
                        const refreshRes = await fetch(`${baseURL}/api/auth/refresh-token`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken: refreshTokenStr }),
                        });

                        if (refreshRes.ok) {
                            const refreshData = await refreshRes.json();
                            const newToken = refreshData?.data?.session?.access_token;
                            const newRefreshToken = refreshData?.data?.session?.refresh_token;

                            if (newToken) {
                                localStorage.setItem('supabase_access_token', newToken);
                                if (newRefreshToken) {
                                    localStorage.setItem('supabase_refresh_token', newRefreshToken);
                                }

                                const retryHeaders = {
                                    ...headers,
                                    Authorization: `Bearer ${newToken}`,
                                };

                                const retryRes = await fetch(url, {
                                    ...options,
                                    _isRetry: true,
                                    headers: retryHeaders,
                                    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
                                });

                                if (retryRes.ok) {
                                    return retryRes.json();
                                }
                            }
                        }
                    } catch (refreshErr) {
                        console.error("Token refresh attempt failed:", refreshErr);
                    }
                }

                // 2. If no refresh token or refresh failed, clear stale tokens and retry as guest if applicable
                if (token) {
                    localStorage.removeItem('supabase_access_token');
                    localStorage.removeItem('supabase_refresh_token');
                    localStorage.removeItem('supabase_user');
                    window.dispatchEvent(new Event('authChange'));

                    const fallbackHeaders = { ...headers };
                    delete fallbackHeaders.Authorization;

                    const retryRes = await fetch(url, {
                        ...options,
                        _isRetry: true,
                        headers: fallbackHeaders,
                        ...(revalidate !== undefined ? { next: { revalidate } } : {}),
                    });

                    if (retryRes.ok) {
                        return retryRes.json();
                    }
                }
            }

            console.error(`[apiClient Error ${res.status}] ${options.method || 'GET'} ${url}:`, errorText);

            let responseData = null;
            try {
                responseData = JSON.parse(errorText);
            } catch (e) {}

            const error = new Error(`API Error (${res.status}): ${errorText}`);
            error.status = res.status;
            error.responseData = responseData;
            throw error;
        }

        return res.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            return new Promise(() => {});
        }
        throw error;
    }
}
