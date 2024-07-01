import axiosInstance from "../../utils/axiosConfig";

export const getTotalSales = async (vendorId) => {
    try {
        const response = await axiosInstance.get(`/get-sales/${vendorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching total sales data', error);
        throw error;
    }
};

export const getMonthlySales = async (vendorId) => {
    try {
        const response = await axiosInstance.get(`/monthly-sales/${vendorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly sales data', error);
        throw error;
    }
};

export const getOrdersCount = async (vendorId) => {
    try {
        const response = await axiosInstance.get(`/orders-counts/${vendorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders count data', error);
        throw error;
    }
};

export const getMonthlyOrderCounts = async (vendorId) => {
    try {
        const response = await axiosInstance.get(`/monthly-orders-counts/${vendorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly orders count', error);
        throw error;
    }
};

