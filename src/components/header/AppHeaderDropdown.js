// src/components/header/AppHeaderDropdown.js
import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilSettings, cilUser } from '@coreui/icons' // 1. Import cilSettings
import CIcon from '@coreui/icons-react'
import { Link, useNavigate } from 'react-router-dom' // 2. Import Link
import { useDispatch } from 'react-redux'
import { LOGOUT_USER } from 'src/redux/actions/types'
import avatar1 from './../../assets/images/avatars/2.jpg'

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch({ type: LOGOUT_USER })
    navigate('/login')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar1} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        {/* 👇 START: ADD THIS SECTION */}
        <CDropdownItem as={Link} to="/profile">
          <CIcon icon={cilSettings} className="me-2" />
          Profile Settings
        </CDropdownItem>
        {/* 👆 END: ADD THIS SECTION */}

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
