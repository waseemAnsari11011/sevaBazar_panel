import axiosInstance from '../../utils/axiosConfig'

/**
 * Fetches the current application settings from the server.
 * @returns {Promise} A promise that resolves with the settings data.
 */
export const getSettings = () => {
  return axiosInstance.get('/settings')
}

/**
 * Updates the application settings on the server.
 * @param {object} data - The settings data to update.
 * @returns {Promise} A promise that resolves with the updated settings data.
 */
export const updateSettings = (data) => {
  return axiosInstance.put('/settings', data)
}
