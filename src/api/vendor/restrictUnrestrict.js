import axiosInstance from "../../utils/axiosConfig";

export async function restrictVendor(vendorId) {
    const token = localStorage.getItem('token');
    console.log("token-->>", token);
    
    try {
        const response = await axiosInstance.put(`/vendors/restrict/${vendorId}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Vendor restricted:', response.data);
    } catch (error) {
        console.error(error.response?.data?.message || 'Server error.');
    }
}

export async function unRestrictVendor(vendorId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await axiosInstance.put(`/vendors/unrestrict/${vendorId}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Vendor unrestricted:', response.data);
    } catch (error) {
        console.error(error.response?.data?.message || 'Server error.');
    }
}
