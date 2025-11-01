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
import UpdateBusinessInfo from './UpdateBusinessInfo' // <-- Import new component
import UpdateBankDetails from './UpdateBankDetails' // <-- Import new component

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
              Business Info
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              href="#"
              active={activeKey === 2}
              onClick={(e) => {
                e.preventDefault()
                setActiveKey(2)
              }}
            >
              Bank & UPI Details
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              href="#"
              active={activeKey === 3}
              onClick={(e) => {
                e.preventDefault()
                setActiveKey(3)
              }}
            >
              Update Address
            </CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent>
          <CTabPane role="tabpanel" aria-labelledby="business-tab" visible={activeKey === 1}>
            {user && <UpdateBusinessInfo user={user} />}
          </CTabPane>
          <CTabPane role="tabpanel" aria-labelledby="bank-tab" visible={activeKey === 2}>
            {user && <UpdateBankDetails user={user} />}
          </CTabPane>
          <CTabPane role="tabpanel" aria-labelledby="address-tab" visible={activeKey === 3}>
            {user && <UpdateAddress user={user} />}
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default Profile
