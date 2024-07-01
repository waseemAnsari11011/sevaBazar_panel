import axiosInstance from "../../utils/axiosConfig";

// Fetch all categories
const getAllCategories = async (token) => {
    

    try {
        const token = localStorage.getItem('token');
        console.log("getAllCategories token", token)

        if (!token) {
            throw new Error('Token not found');
        }

        const response = await axiosInstance.get('/category', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data.categories;
    } catch (error) {
        const token = localStorage.getItem('token');

        console.log("getAllCategories token", token)
        // console.error('Failed to fetch categories:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export default getAllCategories;
