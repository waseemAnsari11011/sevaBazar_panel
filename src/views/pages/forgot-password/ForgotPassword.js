import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeOpen } from '@coreui/icons'
import axiosInstance from '../../../utils/axiosConfig'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, color: '', message: '' })

  const handleForgotPassword = async () => {
    setIsLoading(true)
    setAlert({ show: false, color: '', message: '' })
    try {
      const response = await axiosInstance.post('/vendors/auth/forgot-password', { email })
      setAlert({ show: true, color: 'success', message: response.data.message })
    } catch (error) {
      setAlert({
        show: true,
        color: 'danger',
        message: error.response?.data?.message || 'Something went wrong.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard>
              <CCardBody>
                <CForm>
                  <h1>Forgot Password</h1>
                  <p className="text-body-secondary">Enter your email to reset your password</p>
                  {alert.show && <CAlert color={alert.color}>{alert.message}</CAlert>}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeOpen} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </CInputGroup>
                  <CRow>
                    <CCol xs={6}>
                      <CButton color="primary" onClick={handleForgotPassword} disabled={isLoading}>
                        {isLoading ? <CSpinner size="sm" /> : 'Submit'}
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-right">
                      <Link to="/login">
                        <CButton color="link" className="px-0">
                          Back to Login
                        </CButton>
                      </Link>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ForgotPassword
