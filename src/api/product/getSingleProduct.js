import axiosInstance from "../../utils/axiosConfig";

const getProductById = async (id) => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to retrieve product:', error);
      throw error;
    }
  };
  
  export default getProductById;