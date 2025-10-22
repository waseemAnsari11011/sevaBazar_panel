import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormText,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { getSettings, updateSettings } from 'src/api/settings/settingsApi'

const DistanceSettings = () => {
  const [distance, setDistance] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Fetch initial settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getSettings()
        if (response.data.success) {
          setDistance(response.data.data.vendorVisibilityRadius)
        } else {
          throw new Error('Failed to fetch settings.')
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch settings. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle form submission to update settings
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Clear previous messages
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const numericDistance = parseFloat(distance)
      if (isNaN(numericDistance) || numericDistance < 0) {
        throw new Error('Please enter a valid, non-negative number for the distance.')
      }

      const response = await updateSettings({ vendorVisibilityRadius: numericDistance })
      if (response.data.success) {
        setDistance(response.data.data.vendorVisibilityRadius)
        setSuccess('Settings updated successfully!')
      } else {
        throw new Error('Failed to update settings.')
      }
    } catch (err) {
      setError(err.message || 'Failed to update settings. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12} md={8} lg={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Vendor Visibility Settings</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis small">
              Set the maximum distance (in kilometers) within which customers can see vendors.
            </p>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}
            {loading && !error && !success ? (
              <div className="text-center p-3">
                <CSpinner />
              </div>
            ) : (
              <CForm onSubmit={handleSubmit}>
                <div className="mb-3">
                  <CFormLabel htmlFor="distanceInput">Visibility Radius (km)</CFormLabel>
                  <CFormInput
                    type="number"
                    id="distanceInput"
                    placeholder="e.g., 10"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    required
                    min="0"
                    step="0.1"
                  />
                  <CFormText>
                    Enter the radius in kilometers. For example, enter `15` for 15km.
                  </CFormText>
                </div>
                <CButton type="submit" color="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <CSpinner as="span" size="sm" aria-hidden="true" /> Updating...
                    </>
                  ) : (
                    'Update Settings'
                  )}
                </CButton>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DistanceSettings
