import axiosInstance from "../../utils/axiosConfig";

// Fetch all categories
const getAllCategories = async () => {
    try {
        const response = await axiosInstance.get('/category');
        return response.data.categories;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
    }
};

export default getAllCategories
