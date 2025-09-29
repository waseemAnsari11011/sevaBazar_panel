import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { fetchVendorOrders } from './redux/actions/getAllOrdersAction'
import { fetchVendorChatOrders } from './redux/actions/getNewChatOrdersAction'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const ForgotPassword = React.lazy(() => import('./views/pages/forgot-password/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./views/pages/reset-password/ResetPassword'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const dispatch = useDispatch()
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.app.theme)
  const isAuthenticated = useSelector((state) => state.app.isAuthenticated)
  const user = useSelector((state) => state.app.user)

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const vendorId = user._id
      dispatch(fetchVendorOrders(vendorId))
      dispatch(fetchVendorChatOrders(vendorId))
    }

    const urlParams = new URLSearchParams(window.location.search)
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]

    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, [isAuthenticated, user, dispatch, setColorMode, isColorModeSet, storedTheme])

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route
            exact
            path="/login"
            name="Login Page"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
          <Route
            exact
            path="/register"
            name="Register Page"
            element={isAuthenticated ? <Navigate to="/" /> : <Register />}
          />
          <Route
            exact
            path="/forgot-password"
            name="Forgot Password"
            element={<ForgotPassword />}
          />
          <Route
            exact
            path="/reset-password/:token"
            name="Reset Password"
            element={<ResetPassword />}
          />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />

          {/* Protected Route for the main application */}
          <Route
            path="*"
            name="Home"
            element={isAuthenticated ? <DefaultLayout /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
