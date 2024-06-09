import axiosInstance from "../../utils/axiosConfig";

export const getTotalSales = async () => {
    try {
        const response = await axiosInstance.get('/get-sales');
        return response.data;
    } catch (error) {
        console.error('Error fetching total sales data', error);
        throw error;
    }
};

export const getMonthlySales = async () => {
    try {
        const response = await axiosInstance.get('/monthly-sales');
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly sales data', error);
        throw error;
    }
};

export const getOrdersCount = async () => {
    try {
        const response = await axiosInstance.get('/orders-counts');
        return response.data;
    } catch (error) {
        console.error('Error fetching orders count data', error);
        throw error;
    }
};

export const getMonthlyOrderCounts = async () => {
    try {
        const response = await axiosInstance.get('/monthly-orders-counts');
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly orders count', error);
        throw error;
    }
};

