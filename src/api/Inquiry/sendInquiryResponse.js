import axiosInstance from "../../utils/axiosConfig";



const sendInquiryResponse = async (selectedInquiryId, Inquiryresponse) => {
    try {
        const token = localStorage.getItem('token'); // or use another method to get the token
        const response = await axiosInstance.put(`/inquiries/${selectedInquiryId}/respond`, 
        { Inquiryresponse }, 
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to respond to inquiry:', error);
        throw error;
    }
};

export default sendInquiryResponse