import axiosInstance from "../../utils/axiosConfig";

export const getOrdersByVendor = async (vendorId) => {
  try {
    const response = await axiosInstance.get(`/order/vendor/${vendorId}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to retrieve product:', error);
    throw error;
  }
};

export const getRecentOrdersByVendor = async (vendorId) => {
  try {
    const response = await axiosInstance.get(`/order/recent-order/${vendorId}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to retrieve product:', error);
    throw error;
  }
};

export const getProductsLowQuantity = async (vendorId) => {
  try {
    const response = await axiosInstance.get(`/products-low-quantity/${vendorId}`);
    console.log("response.data--->>>", response.data)
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve product:', error);
    throw error;
  }
};

