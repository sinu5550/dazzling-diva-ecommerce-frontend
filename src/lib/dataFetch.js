import useSWR from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Enhanced fetcher
const fetcher = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        const error = new Error('An error occurred while fetching the data');
        error.status = response.status;
        try {
            error.info = await response.json();
        } catch {
            error.info = {};
        }
        throw error;
    }

    return response.json();
};


//  Data Fetch Hook
export const useAddress = () => {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        `${API_URL}/api/customer`, fetcher);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
        isEmpty: !isLoading && !error && data?.length === 0,
    };
};


//  Data Fetch Hook
export const useCustomers = () => {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        `${API_URL}/api/customer`, fetcher);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
        isEmpty: !isLoading && !error && data?.length === 0,
    };
};


export const useCoupons = () => {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        `${API_URL}/api/coupon`, fetcher);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
        isEmpty: !isLoading && !error && data?.length === 0,
    };
};


export const useCouponsActive = () => {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        `${API_URL}/api/coupon/validate`, fetcher);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
        isEmpty: !isLoading && !error && data?.length === 0,
    };
};

