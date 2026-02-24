import axiosInstance from '../../utils/axiosConfig'

const createDriver = async (driverData) => {
    try {
        const token = localStorage.getItem('token')
        const response = await axiosInstance.post('/create-driver', driverData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.error('Failed to create driver:', error)
        throw error
    }
}

export default createDriver
