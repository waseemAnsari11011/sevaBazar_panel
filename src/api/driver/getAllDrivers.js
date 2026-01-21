import axiosInstance from '../../utils/axiosConfig'

const getAllDrivers = async () => {
    try {
        const token = localStorage.getItem('token')
        const response = await axiosInstance.get('/drivers', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.error('Failed to fetch drivers:', error)
        throw error
    }
}

export default getAllDrivers
