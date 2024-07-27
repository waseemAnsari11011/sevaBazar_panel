import axiosInstance from "../../utils/axiosConfig"

const toggleVisibilityApi = async(id) => {
 // Function to make a banner active
    try {
      const response = await axiosInstance.patch(`/products/${id}/toggle-visibility`);
      return response.data;
    } catch (error) {
      console.error('Failed to activate banner:', error);
      throw error;
    }
  };


export default toggleVisibilityApi