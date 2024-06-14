// deleteBanner.js
import axiosInstance from "../../utils/axiosConfig";

const deleteBanner = async (id) => {
    try {
        const response = await axiosInstance.delete(`/banner/${id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to delete banner:', error);
        throw error;
      }
}

export default deleteBanner