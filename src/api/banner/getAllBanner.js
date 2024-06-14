import axiosInstance from "../../utils/axiosConfig";

// Fetch all categories
const getAllBanner = async () => {
    try {
        const response = await axiosInstance.get('/banner');
        return response.data.categories;
    } catch (error) {
        console.error('Failed to fetch banner:', error);
        throw error;
    }
};

export default getAllBanner