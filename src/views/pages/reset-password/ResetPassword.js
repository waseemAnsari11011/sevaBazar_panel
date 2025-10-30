import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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
import { cilLockLocked } from '@coreui/icons'
import axiosInstance from '../../../utils/axiosConfig'

const ResetPassword = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, color: '', message: '' })

  const handleResetPassword = async () => {
    setIsLoading(true)
    setAlert({ show: false, color: '', message: '' })
    try {
      const response = await axiosInstance.post(`/vendors/auth/reset-password/${token}`, {
        password,
      })
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
                  <h1>Reset Password</h1>
                  <p className="text-body-secondary">Enter your new password</p>
                  {alert.show && (
                    <CAlert color={alert.color}>
                      {alert.message}
                      {alert.color === 'success' && (
                        <Link to="/login" className="d-block">
                          Go to Login
                        </Link>
                      )}
                    </CAlert>
                  )}
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </CInputGroup>
                  <CButton color="primary" onClick={handleResetPassword} disabled={isLoading}>
                    {isLoading ? <CSpinner size="sm" /> : 'Reset Password'}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ResetPassword
