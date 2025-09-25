import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import UpdateAddress from './UpdateAddress'

const Profile = () => {
  const user = useSelector((state) => state.app?.user)
  console.log('user==>>', user)
  const [activeKey, setActiveKey] = useState(1)

  return (
    <CCard>
      <CCardHeader>
        <strong>Profile</strong>
      </CCardHeader>
      <CCardBody>
        <CNav variant="tabs" role="tablist">
          <CNavItem>
            <CNavLink
              href="#"
              active={activeKey === 1}
              onClick={(e) => {
                e.preventDefault()
                setActiveKey(1)
              }}
            >
              Update Address
            </CNavLink>
          </CNavItem>
          {/* Add other tabs here */}
        </CNav>
        <CTabContent>
          <CTabPane role="tabpanel" aria-labelledby="address-tab" visible={activeKey === 1}>
            {user && <UpdateAddress user={user} />}
          </CTabPane>
          {/* Add other tab panes here */}
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default Profile
