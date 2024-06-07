import axiosInstance from "../../utils/axiosConfig";

export async function restrictCustomer(customerId) {
    const token = localStorage.getItem('token');
    console.log("token-->>", token);
    
    try {
        const response = await axiosInstance.put(`/customers/restrict/${customerId}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Customer restricted:', response.data);
    } catch (error) {
        console.error(error.response?.data?.message || 'Server error.');
    }
}

export async function unRestrictCustomer(customerId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await axiosInstance.put(`/customers/unrestrict/${customerId}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Customer unrestricted:', response.data);
    } catch (error) {
        console.error(error.response?.data?.message || 'Server error.');
    }
}
