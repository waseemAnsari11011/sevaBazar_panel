import axiosInstance from "../../utils/axiosConfig";

// Fetch all vendors
const getAllVendors = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/vendors', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("response-->>", response);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch vendors:', error);
        throw error;
    }
};

export default getAllVendors;
