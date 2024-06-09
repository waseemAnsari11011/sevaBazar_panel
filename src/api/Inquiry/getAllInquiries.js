import axiosInstance from "../../utils/axiosConfig";



const getAllInquiries = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axiosInstance.get('/inquiries', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get inquiries:', error);
        throw error;
    }
};

export default getAllInquiries