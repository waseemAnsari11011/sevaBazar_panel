import React, { useState, useEffect } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { LOGOUT_USER } from 'src/redux/actions/types'
import avatar1 from './../../assets/images/avatars/2.jpg'

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        setVendor(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Failed to parse user data from localStorage', error)
    }
  }, [])

  const handleLogout = () => {
    // Clear user data from storage and redux state
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    dispatch({ type: LOGOUT_USER })
    navigate('/login')
  }

  // Determine which avatar to show
  const avatarSrc =
    vendor &&
    vendor.documents &&
    vendor.documents.shopPhoto &&
    vendor.documents.shopPhoto.length > 0
      ? vendor.documents.shopPhoto[0]
      : avatar1

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatarSrc} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem as={Link} to="/profile">
          <CIcon icon={cilSettings} className="me-2" />
          Profile Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Log Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
