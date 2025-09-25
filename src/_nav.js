import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilBasket,
  cilClipboard,
  cilGroup,
  cilInfo,
  cilPhone,
  cilLocationPin,
  cilSpeech,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle, CBadge } from '@coreui/react'

const Navigation = (neworderCount, newChatOrderCount) => {
  const _nav = [
    {
      component: CNavItem,
      name: 'Update Address',
      to: '/profile',
      icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Overview',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    {
      component: CNavTitle,
      name: 'Manage',
    },
    {
      component: CNavGroup,
      name: 'Products',
      to: '/products',
      icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Products',
          to: '/products/products-create',
        },
        {
          component: CNavItem,
          name: 'Categories',
          to: '/products/categories-create',
        },
      ],
    },
    {
      component: CNavGroup,
      name: (
        <>
          Orders
          {(neworderCount !== 0 || newChatOrderCount !== 0) && (
            <CBadge color="info" className="ms-auto">
              {neworderCount + newChatOrderCount}
            </CBadge>
          )}
        </>
      ),
      to: '/orders/all-orders',
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'All Orders',
          to: '/orders/all-orders',
          badge: neworderCount !== 0 && {
            color: 'info',
            text: neworderCount,
          },
        },
        {
          component: CNavItem,
          name: 'Chat Orders',
          to: '/orders/chat-orders',
          badge: newChatOrderCount !== 0 && {
            color: 'info',
            text: newChatOrderCount,
          },
        },
      ],
    },

    {
      component: CNavGroup,
      name: 'Vendors',
      to: '/vendor',
      icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Vendors List',
          to: '/vendor/list',
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Customers',
      to: '/customer',
      icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Customer List',
          to: '/customer/list',
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Banner',
      to: '/banner',
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Add Banner',
          to: '/banner/add-banner',
        },
      ],
    },
    {
      component: CNavTitle,
      name: 'Support',
    },
    {
      component: CNavItem,
      name: 'Customer Inquiries',
      to: '/customer-inquiries',
      icon: <CIcon icon={cilSpeech} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Help Center',
      to: '/faqs',
      icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Contact',
      to: '/contact',
      icon: <CIcon icon={cilPhone} customClassName="nav-icon" />,
    },
  ]

  return _nav
}

export default Navigation
