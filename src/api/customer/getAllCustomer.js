import axiosInstance from "../../utils/axiosConfig";

// Fetch all customers
const getAllCustomers = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/customers', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("response-->>", response);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        throw error;
    }
};

export default getAllCustomers;
