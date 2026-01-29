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
  const [customerTiers, setCustomerTiers] = useState([])
  const [driverTiers, setDriverTiers] = useState([])
  const [driverPayoutMode, setDriverPayoutMode] = useState('tiered')
  const [driverFormula, setDriverFormula] = useState({
    basePay: 30,
    baseDistance: 5,
    perKmRate: 10
  })

  const [newCustomerTier, setNewCustomerTier] = useState({
    conditionType: 'range',
    minDistance: '',
    maxDistance: '',
    deliveryFee: ''
  })

  const [newDriverTier, setNewDriverTier] = useState({
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
          const data = response.data.data;
          setCustomerTiers(data.deliveryChargeConfig || [])
          setDriverTiers(data.driverPaymentConfig || [])
          setDriverPayoutMode(data.driverPayoutMode || 'tiered')
          if (data.driverDeliveryFee) {
            setDriverFormula({
              basePay: data.driverDeliveryFee.basePay || 30,
              baseDistance: data.driverDeliveryFee.baseDistance || 5,
              perKmRate: data.driverDeliveryFee.perKmRate || 10
            })
          }
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

  const handleAddTier = (type) => {
    const isCustomer = type === 'customer';
    const currentNewTier = isCustomer ? newCustomerTier : newDriverTier;
    const { conditionType, minDistance, maxDistance, deliveryFee } = currentNewTier;

    if (deliveryFee === '') {
      alert('Please enter a fee.');
      return;
    }

    const fee = parseFloat(deliveryFee);
    if (isNaN(fee) || fee < 0) {
      alert('Please enter a valid fee.');
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

    if (isCustomer) {
      setCustomerTiers([...customerTiers, tierData]);
      setNewCustomerTier({ conditionType: 'range', minDistance: '', maxDistance: '', deliveryFee: '' });
    } else {
      setDriverTiers([...driverTiers, tierData]);
      setNewDriverTier({ conditionType: 'range', minDistance: '', maxDistance: '', deliveryFee: '' });
    }
  }

  const handleDeleteTier = (index, type) => {
    if (type === 'customer') {
      setCustomerTiers(customerTiers.filter((_, i) => i !== index));
    } else {
      setDriverTiers(driverTiers.filter((_, i) => i !== index));
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const payload = {
        deliveryChargeConfig: customerTiers,
        driverPaymentConfig: driverTiers,
        driverPayoutMode: driverPayoutMode,
        driverDeliveryFee: driverFormula
      }

      const response = await updateSettings(payload)
      if (response.data.success) {
        const data = response.data.data;
        setCustomerTiers(data.deliveryChargeConfig || [])
        setDriverTiers(data.driverPaymentConfig || [])
        setDriverPayoutMode(data.driverPayoutMode || 'tiered')
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

  const TierTable = ({ tiers, type, newTier, setNewTier }) => (
    <div className="mb-5">
      <h5 className="mb-3">{type === 'customer' ? '1. Customer Delivery Charges' : '2. Driver Payout Settings'}</h5>
      <p className="text-medium-emphasis small">
        {type === 'customer'
          ? 'Set what the customer pays based on distance.'
          : 'Set what the driver earns based on total distance (Driver -> Shop -> Customer).'}
      </p>
      <CTable bordered align="middle">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell style={{ width: '25%' }}>Condition</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '35%' }}>Criteria</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '25%' }}>Amount (₹)</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '15%' }}>Action</CTableHeaderCell>
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
                <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDeleteTier(index, type)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
          <CTableRow color="light">
            <CTableDataCell>
              <CFormSelect
                size="sm"
                value={newTier.conditionType}
                onChange={(e) => setNewTier({ ...newTier, conditionType: e.target.value })}
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
              <CButton color="success" size="sm" onClick={() => handleAddTier(type)}>Add</CButton>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
  );

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-white py-3">
            <h4 className="mb-0">Delivery & Payout Settings</h4>
          </CCardHeader>
          <CCardBody className="p-4">
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}

            {loading && !error && !success ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
                <p className="mt-2 text-muted">Loading settings...</p>
              </div>
            ) : (
              <CForm onSubmit={handleSubmit}>
                <TierTable
                  tiers={customerTiers}
                  type="customer"
                  newTier={newCustomerTier}
                  setNewTier={setNewCustomerTier}
                />

                <hr className="my-5" />

                <div className="mb-4">
                  <h5 className="mb-3">2. Driver Payout Settings</h5>
                  <CRow className="align-items-center mb-4">
                    <CCol md={4}>
                      <CFormLabel>Payout Calculation Mode</CFormLabel>
                      <CFormSelect
                        value={driverPayoutMode}
                        onChange={(e) => setDriverPayoutMode(e.target.value)}
                      >
                        <option value="tiered">Range-based (Tiers)</option>
                        <option value="formula">Formula-based (Base + Extra)</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={8}>
                      <CFormText>
                        Choose how drivers are paid. <b>Range-based</b> uses fixed totals for specific distances.
                        <b>Formula-based</b> calculates pay using a base rate plus a per-km fee.
                      </CFormText>
                    </CCol>
                  </CRow>

                  {driverPayoutMode === 'formula' ? (
                    <CCard className="bg-light border-0">
                      <CCardBody>
                        <CRow>
                          <CCol md={4}>
                            <CFormLabel>Base Pay (₹)</CFormLabel>
                            <CFormInput
                              type="number"
                              value={driverFormula.basePay}
                              onChange={(e) => setDriverFormula({ ...driverFormula, basePay: parseFloat(e.target.value) || 0 })}
                              placeholder="e.g. 30"
                            />
                            <CFormText>Amount paid for the first X km.</CFormText>
                          </CCol>
                          <CCol md={4}>
                            <CFormLabel>Base Distance (km)</CFormLabel>
                            <CFormInput
                              type="number"
                              value={driverFormula.baseDistance}
                              onChange={(e) => setDriverFormula({ ...driverFormula, baseDistance: parseFloat(e.target.value) || 0 })}
                              placeholder="e.g. 5"
                            />
                            <CFormText>Initial distance covered by Base Pay.</CFormText>
                          </CCol>
                          <CCol md={4}>
                            <CFormLabel>Extra Rate (₹/km)</CFormLabel>
                            <CFormInput
                              type="number"
                              value={driverFormula.perKmRate}
                              onChange={(e) => setDriverFormula({ ...driverFormula, perKmRate: parseFloat(e.target.value) || 0 })}
                              placeholder="e.g. 10"
                            />
                            <CFormText>Fee for every km beyond Base Distance.</CFormText>
                          </CCol>
                        </CRow>
                        <div className="mt-3 text-primary small">
                          <strong>Logic:</strong> If a delivery is 7 km and your settings are ₹30 for 5km + ₹10/km,
                          the driver earns 30 + (7-5)*10 = <b>₹50</b>.
                        </div>
                      </CCardBody>
                    </CCard>
                  ) : (
                    <TierTable
                      tiers={driverTiers}
                      type="driver"
                      newTier={newDriverTier}
                      setNewTier={setNewDriverTier}
                    />
                  )}
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <CButton type="submit" color="primary" size="lg" disabled={loading} className="px-5">
                    {loading ? <CSpinner size="sm" /> : 'Save All Changes'}
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
