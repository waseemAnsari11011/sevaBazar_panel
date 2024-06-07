import axiosInstance from "../../utils/axiosConfig";

const getOrdersByVendor = async (vendorId) => {
    try {
      const response = await axiosInstance.get(`/order/vendor/${vendorId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to retrieve product:', error);
      throw error;
    }
  };
  
  export default getOrdersByVendor;