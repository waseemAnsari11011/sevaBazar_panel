import axiosInstance from '../../utils/axiosConfig'

const updateDriverStatus = async (driverId, status) => {
    try {
        const token = localStorage.getItem('token')
        const response = await axiosInstance.patch(`/driver/${driverId}/status`, { status }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.error('Failed to update driver status:', error)
        throw error
    }
}

export default updateDriverStatus
