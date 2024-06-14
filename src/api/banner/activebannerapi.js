import axiosInstance from "../../utils/axiosConfig"

const activebannerapi = async(id, isActive) => {
 // Function to make a banner active
    try {
      const response = await axiosInstance.put(`/banner-active/${id}`, { isActive });
      console.log(id)
      return response.data;
    } catch (error) {
      console.error('Failed to activate banner:', error);
      throw error;
    }
  };


export default activebannerapi