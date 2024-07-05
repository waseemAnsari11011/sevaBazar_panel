import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
    <div>
      <span className="ms-1">&copy; Seva Bazar</span>
    </div>
    <div className="ms-auto">
      <span>Created by </span>
      <a href="https://www.waizcom.com" target="_blank" rel="noopener noreferrer">
        waizcom.com
      </a>
    </div>
  </CFooter>
  )
}

export default React.memo(AppFooter)
