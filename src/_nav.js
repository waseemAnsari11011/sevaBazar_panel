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
  cilEnvelopeClosed,
  cilPhone,
  cilSpeech
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'


const _nav = [
  {
    component: CNavItem,
    name: 'Overview',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    // badge: {
    //   color: 'info',
    //   text: 'NEW',
    // },
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
      }
      
    ],
  },
  {
    component: CNavGroup,
    name: 'Orders',
    to: '/orders',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Orders',
        to: '/orders/all-orders',
      },
      // {
      //   component: CNavItem,
      //   name: 'Refunds',
      //   to: '/orders/refund',
      // }
      
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

export default _nav
