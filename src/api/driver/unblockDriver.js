import axiosInstance from '../../utils/axiosConfig'

const unblockDriver = async (driverId) => {
    try {
        const token = localStorage.getItem('token')
        const response = await axiosInstance.patch(`/driver/${driverId}/unblock`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.error('Failed to unblock driver:', error)
        throw error
    }
}

export default unblockDriver
