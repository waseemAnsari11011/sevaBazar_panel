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
export const getAllVendorsEarnings = async (params) => {
    try {
        const response = await axiosInstance.get(`/all-vendors-earnings`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching all vendors earnings', error);
        throw error;
    }
};

export const getVendorEarningsDetails = async (vendorId, params) => {
    try {
        const response = await axiosInstance.get(`/vendor-earnings-details/${vendorId}`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor earnings details', error);
        throw error;
    }
};

export const bulkUpdateVendorPaymentStatus = async (formData) => {
    try {
        const response = await axiosInstance.post(`/bulk-update-payment-status`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error bulk updating payment status', error);
        throw error;
    }
};

export const updateSingleOrderPaymentStatus = async (data) => {
    try {
        const response = await axiosInstance.post(`/update-order-payment-status`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating order payment status', error);
        throw error;
    }
};

// Driver Earnings APIs
export const getAllDriversEarnings = async (params) => {
    try {
        const response = await axiosInstance.get(`/all-drivers-earnings`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching all drivers earnings', error);
        throw error;
    }
}

export const getDriverEarningsDetails = async (driverId, params) => {
    try {
        const response = await axiosInstance.get(`/driver-earnings-details/${driverId}`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching driver earnings details', error);
        throw error;
    }
}

export const bulkUpdateDriverPaymentStatus = async (data) => {
    try {
        const response = await axiosInstance.post(`/bulk-update-driver-payment-status`, data);
        return response.data;
    } catch (error) {
        console.error('Error bulk updating driver payment status', error);
        throw error;
    }
}
