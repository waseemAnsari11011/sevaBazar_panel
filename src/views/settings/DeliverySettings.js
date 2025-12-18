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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import { getSettings, updateSettings } from 'src/api/settings/settingsApi'

const DeliverySettings = () => {
  const [tiers, setTiers] = useState([])
  const [newTier, setNewTier] = useState({ 
    conditionType: 'range', 
    minDistance: '', 
    maxDistance: '', 
    deliveryFee: '' 
  })
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
          setTiers(response.data.data.deliveryChargeConfig || [])
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

  const handleAddTier = () => {
    const { conditionType, minDistance, maxDistance, deliveryFee } = newTier;
    
    if (deliveryFee === '') {
       alert('Please enter a delivery fee.');
       return;
    }

    const fee = parseFloat(deliveryFee);
    if (isNaN(fee) || fee < 0) {
        alert('Please enter a valid delivery fee.');
        return;
    }

    let tierData = { conditionType, deliveryFee: fee, minDistance: 0, maxDistance: 0 };

    if (conditionType === 'range') {
        if (minDistance === '' || maxDistance === '') {
            alert('Please enter both Min and Max distance for Range.');
            return;
        }
        const min = parseFloat(minDistance);
        const max = parseFloat(maxDistance);
        if (isNaN(min) || isNaN(max) || min < 0 || max <= min) {
             alert('Invalid Range: Max must be greater than Min.');
             return;
        }
        tierData.minDistance = min;
        tierData.maxDistance = max;
    } else if (conditionType === 'greaterThan') {
        if (minDistance === '') {
            alert('Please enter the Greater Than distance.');
            return;
        }
        const val = parseFloat(minDistance);
        if (isNaN(val) || val < 0) {
             alert('Invalid Distance.');
             return;
        }
        tierData.minDistance = val;
    } else if (conditionType === 'lessThan') {
        if (maxDistance === '') {
            alert('Please enter the Less Than distance.');
            return;
        }
        const val = parseFloat(maxDistance);
        if (isNaN(val) || val < 0) {
             alert('Invalid Distance.');
             return;
        }
        tierData.maxDistance = val;
    }

    setTiers([...tiers, tierData])
    setNewTier({ conditionType: 'range', minDistance: '', maxDistance: '', deliveryFee: '' })
  }

  const handleDeleteTier = (index) => {
    const updatedTiers = tiers.filter((_, i) => i !== index)
    setTiers(updatedTiers)
  }

  // Handle form submission to update settings
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Clear previous messages
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const payload = {
        deliveryChargeConfig: tiers,
      }

      const response = await updateSettings(payload)
      if (response.data.success) {
        setTiers(response.data.data.deliveryChargeConfig || [])
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
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Delivery & Visibility Settings</strong>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}
            
            {loading && !error && !success ? (
              <div className="text-center p-3">
                <CSpinner />
              </div>
            ) : (
              <CForm onSubmit={handleSubmit}>
                <h5 className="mb-3">Delivery Charges</h5>
                <p className="text-medium-emphasis small">
                  Define delivery fees based on distance ranges.
                </p>

                <CTable bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Condition</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Criteria</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Fee (₹)</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {tiers.map((tier, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                            {tier.conditionType === 'greaterThan' ? 'Greater Than (>)' : 
                             tier.conditionType === 'lessThan' ? 'Less Than (<)' : 'Range'}
                        </CTableDataCell>
                        <CTableDataCell>
                            {tier.conditionType === 'greaterThan' ? `${tier.minDistance} km` : 
                             tier.conditionType === 'lessThan' ? `${tier.maxDistance} km` : 
                             `${tier.minDistance} - ${tier.maxDistance} km`}
                        </CTableDataCell>
                        <CTableDataCell>₹{tier.deliveryFee}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDeleteTier(index)}>
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                      {/* Input Row */}
                      <CTableRow>
                         <CTableDataCell>
                            <CFormSelect 
                                size="sm"
                                value={newTier.conditionType}
                                onChange={(e) => setNewTier({...newTier, conditionType: e.target.value})}
                            >
                                <option value="range">Range</option>
                                <option value="greaterThan">Greater Than</option>
                                <option value="lessThan">Less Than</option>
                            </CFormSelect>
                         </CTableDataCell>
                         
                         <CTableDataCell>
                            <div className="d-flex gap-2">
                                {(newTier.conditionType === 'range' || newTier.conditionType === 'greaterThan') && (
                                    <CFormInput
                                      type="number"
                                      size="sm"
                                      value={newTier.minDistance}
                                      onChange={(e) => setNewTier({ ...newTier, minDistance: e.target.value })}
                                      placeholder={newTier.conditionType === 'range' ? "Min" : "Distance"}
                                    />
                                )}
                                {(newTier.conditionType === 'range' || newTier.conditionType === 'lessThan') && (
                                    <CFormInput
                                      type="number"
                                      size="sm"
                                      value={newTier.maxDistance}
                                      onChange={(e) => setNewTier({ ...newTier, maxDistance: e.target.value })}
                                      placeholder={newTier.conditionType === 'range' ? "Max" : "Distance"}
                                    />
                                )}
                            </div>
                         </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          size="sm"
                          value={newTier.deliveryFee}
                          onChange={(e) => setNewTier({ ...newTier, deliveryFee: e.target.value })}
                          placeholder="Fee"
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton color="success" size="sm" onClick={handleAddTier}>Add</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>

                <div className="mt-4">
                  <CButton type="submit" color="primary" disabled={loading}>
                    Save All Changes
                  </CButton>
                </div>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DeliverySettings
