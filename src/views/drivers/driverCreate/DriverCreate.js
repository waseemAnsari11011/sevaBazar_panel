import React, { useState } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CRow,
    CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import createDriver from '../../../api/driver/createDriver'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'

const DriverCreate = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        plateNumber: '',
        type: 'bike',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        const payload = {
            personalDetails: {
                name: formData.name,
                phone: formData.phone,
                password: formData.password,
            },
            vehicleDetails: {
                plateNumber: formData.plateNumber,
                type: formData.type,
            },
            documents: [], // Optional for now
        }

        try {
            dispatch(startLoading())
            await createDriver(payload)
            setSuccess('Driver created successfully!')
            setTimeout(() => {
                navigate('/drivers/list')
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create driver')
        } finally {
            dispatch(stopLoading())
        }
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Onboard New Driver</strong>
                    </CCardHeader>
                    <CCardBody>
                        {error && <CAlert color="danger">{error}</CAlert>}
                        {success && <CAlert color="success">{success}</CAlert>}
                        <CForm onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="name">Full Name</CFormLabel>
                                <CFormInput
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter driver's name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel htmlFor="phone">Phone Number</CFormLabel>
                                <CFormInput
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel htmlFor="password">Login Password</CFormLabel>
                                <CFormInput
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <hr />
                            <h5>Vehicle Details</h5>
                            <div className="mb-3">
                                <CFormLabel htmlFor="plateNumber">Plate Number</CFormLabel>
                                <CFormInput
                                    type="text"
                                    id="plateNumber"
                                    name="plateNumber"
                                    placeholder="e.g. DL-1-JW-1234"
                                    value={formData.plateNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel htmlFor="type">Vehicle Type</CFormLabel>
                                <CFormSelect id="type" name="type" value={formData.type} onChange={handleChange}>
                                    <option value="bike">Bike</option>
                                    <option value="scooter">Scooter</option>
                                </CFormSelect>
                            </div>
                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <CButton color="secondary" className="me-md-2" onClick={() => navigate('/drivers/list')}>
                                    Cancel
                                </CButton>
                                <CButton color="primary" type="submit">
                                    Save Driver
                                </CButton>
                            </div>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default DriverCreate
