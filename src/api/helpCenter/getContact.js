import axiosInstance from "../../utils/axiosConfig";


const getContact = async () => {
    try {
        // Make a GET request to your backend API endpoint
        const response = await axiosInstance.get('/get-contact');

        if (response.status === 200) {
            // If the request is successful, set the contact information
            const contactInfo = response.data;
            // Assuming you have a state setter function named setContactInfo
            return contactInfo
        } else {
            console.error('Error fetching contact:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

export default getContact