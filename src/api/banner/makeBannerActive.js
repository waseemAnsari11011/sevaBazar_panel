import axiosInstance from "../../utils/axiosConfig";


// Function to make a banner active
const makeBannerActive = async (id, isActive) => {
  try {
    const response = await axiosInstance.put(`/banner-active/${id}`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Failed to activate banner:', error);
    throw error;
  }
};

export default makeBannerActive
