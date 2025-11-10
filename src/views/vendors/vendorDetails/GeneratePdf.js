// vendors/vendorDetails/GeneratePdf.js
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Converts image URL to base64 with CORS handling
 * @param {string} url - Image URL
 * @param {boolean} preserveTransparency - Whether to preserve transparency (use PNG)
 * @returns {Promise<string>} Base64 string
 */
const getImageBase64 = async (url, preserveTransparency = false) => {
  try {
    // Create a new image element
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous' // Enable CORS

      img.onload = () => {
        try {
          // Create canvas and draw image
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)

          // Convert to base64 - use PNG for transparency, JPEG otherwise
          const dataURL = preserveTransparency
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', 0.8)
          resolve(dataURL)
        } catch (error) {
          console.error('Canvas error:', error)
          reject(error)
        }
      }

      img.onerror = (error) => {
        console.error('Image load error:', error)
        // Try fallback method
        fetchImageFallback(url, preserveTransparency).then(resolve).catch(reject)
      }

      // Add cache buster to avoid CORS issues
      img.src = url + (url.includes('?') ? '&' : '?') + 'timestamp=' + Date.now()
    })
  } catch (error) {
    console.error('Error loading image:', error)
    return null
  }
}

/**
 * Fallback method using fetch API
 * @param {string} url - Image URL
 * @param {boolean} preserveTransparency - Whether to preserve transparency
 * @returns {Promise<string>} Base64 string
 */
const fetchImageFallback = async (url, preserveTransparency = false) => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    })
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Fetch fallback error:', error)
    return null
  }
}

/**
 * Load company logo from public folder
 * @returns {Promise<string>} Base64 string
 */
const loadCompanyLogo = async () => {
  try {
    const logoPath = `${window.location.origin}/logo_long.png`
    // Pass true to preserve transparency for PNG logo
    return await getImageBase64(logoPath, true)
  } catch (error) {
    console.error('Error loading company logo:', error)
    return null
  }
}

/**
 * Adds a header to the PDF page with company logo and contact info
 * @param {jsPDF} doc - PDF document
 * @param {string} title - Header title
 * @param {string} logoData - Base64 logo data
 */
const addHeader = (doc, title, logoData) => {
  const pageWidth = doc.internal.pageSize.width

  // Header background - white background with bottom border
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, 30, 'F')

  // Add subtle bottom border
  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(0.5)
  doc.line(0, 30, pageWidth, 30)

  // Title on the left side
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text(title, 14, 19)

  // Add logo on the right side if available
  if (logoData) {
    try {
      // Logo positioned on the right side
      doc.addImage(logoData, 'PNG', pageWidth - 65, 8, 55, 16)
    } catch (error) {
      console.error('Error adding logo to header:', error)
    }
  }

  // Reset colors
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')
}

/**
 * Adds a footer to the PDF page
 * @param {jsPDF} doc - PDF document
 * @param {number} pageNumber - Current page number
 */
const addFooter = (doc, pageNumber) => {
  const pageHeight = doc.internal.pageSize.height
  const pageWidth = doc.internal.pageSize.width

  // Footer background - light gray
  doc.setFillColor(220, 220, 220)
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F')

  // Footer text - centered, three lines
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)

  // Line 1: Phone
  doc.text('Phone : 8116341826', pageWidth / 2, pageHeight - 14, { align: 'center' })

  // Line 2: Email
  doc.text('Email : sevabazar.com@gmail.com', pageWidth / 2, pageHeight - 10, { align: 'center' })

  // Line 3: Copyright
  doc.text('All Copyright Reserved © 2024 Seva Bazar', pageWidth / 2, pageHeight - 6, {
    align: 'center',
  })

  // Reset color
  doc.setTextColor(0, 0, 0)
}

/**
 * Adds a section title to the PDF
 * @param {jsPDF} doc - PDF document
 * @param {string} title - Section title
 * @param {number} y - Y position
 * @returns {number} New Y position
 */
const addSectionTitle = (doc, title, y) => {
  doc.setFillColor(236, 240, 241)
  doc.rect(14, y, doc.internal.pageSize.width - 28, 8, 'F')
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(44, 62, 80)
  doc.text(title, 16, y + 5.5)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0, 0, 0)
  return y + 12
}

/**
 * Adds a key-value pair to the PDF
 * @param {jsPDF} doc - PDF document
 * @param {string} key - Label
 * @param {string} value - Value
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} maxWidth - Maximum width for text
 * @returns {number} Height used
 */
const addKeyValue = (doc, key, value, x, y, maxWidth = 85) => {
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text(`${key}:`, x, y)
  doc.setFont(undefined, 'normal')

  const textLines = doc.splitTextToSize(value || 'N/A', maxWidth)
  doc.text(textLines, x, y + 5)

  // Return height with better spacing (5 pixels per line + 3 pixel padding)
  return textLines.length * 5 + 3
}

/**
 * Checks if new content will fit on current page, adds new page if needed
 * @param {jsPDF} doc - PDF document
 * @param {number} currentY - Current Y position
 * @param {number} requiredSpace - Space needed for content
 * @param {number} pageNumber - Current page number
 * @param {string} logoData - Base64 logo data for new pages
 * @returns {Object} New Y position and page number
 */
const checkPageBreak = (doc, currentY, requiredSpace, pageNumber, logoData) => {
  const pageHeight = doc.internal.pageSize.height
  if (currentY + requiredSpace > pageHeight - 25) {
    // Changed from -20 to -25 to account for footer
    doc.addPage()
    pageNumber++
    addHeader(doc, 'Vendor Registration Details', logoData)
    addFooter(doc, pageNumber)
    return { y: 38, pageNumber } // Start at 38 below the 30px header
  }
  return { y: currentY, pageNumber }
}

/**
 * Adds an image to the PDF with caption
 * @param {jsPDF} doc - PDF document
 * @param {string} imageData - Base64 image data
 * @param {string} caption - Image caption
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
const addImage = (doc, imageData, caption, x, y, width, height) => {
  if (imageData) {
    try {
      // Add border
      doc.setDrawColor(200, 200, 200)
      doc.rect(x, y, width, height)

      doc.addImage(imageData, 'JPEG', x, y, width, height)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(caption, x + width / 2, y + height + 4, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    } catch (error) {
      console.error('Error adding image:', error)
      // Draw placeholder box
      doc.setFillColor(245, 245, 245)
      doc.rect(x, y, width, height, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(x, y, width, height)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('[Image Error]', x + width / 2, y + height / 2, { align: 'center' })
      doc.text(caption, x + width / 2, y + height + 4, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    }
  } else {
    // Draw placeholder box
    doc.setFillColor(245, 245, 245)
    doc.rect(x, y, width, height, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.rect(x, y, width, height)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('[Not Available]', x + width / 2, y + height / 2, { align: 'center' })
    doc.text(caption, x + width / 2, y + height + 4, { align: 'center' })
    doc.setTextColor(0, 0, 0)
  }
}

/**
 * Show loading progress
 * @param {string} message - Progress message
 */
const showProgress = (message) => {
  console.log(`PDF Generation: ${message}`)
}

/**
 * Main function to generate vendor details PDF
 * @param {Object} vendor - Vendor data object
 * @returns {Promise<void>}
 */
export const generateVendorPDF = async (vendor) => {
  try {
    showProgress('Starting PDF generation...')

    // Load company logo first
    showProgress('Loading company logo...')
    const logoData = await loadCompanyLogo()
    if (logoData) {
      showProgress('Company logo loaded successfully')
    } else {
      showProgress('Company logo not available, continuing without logo')
    }

    const doc = new jsPDF()
    let yPos = 38 // Start below header (30px) with some spacing
    let pageNumber = 1

    // Add header with logo
    addHeader(doc, 'Vendor Registration Details', logoData)
    addFooter(doc, pageNumber)

    // ========== BASIC INFORMATION ==========
    showProgress('Adding basic information...')

    // Load selfie photo first for basic information section
    showProgress('Loading selfie photo...')
    const documents = vendor.documents || {}
    let selfiePhotoData = null
    if (documents.selfiePhoto) {
      try {
        selfiePhotoData = await getImageBase64(documents.selfiePhoto)
      } catch (error) {
        console.error('Failed to load selfie photo:', error)
      }
    }

    yPos = addSectionTitle(doc, 'Basic Information', yPos)

    // Add selfie photo on the right side
    if (selfiePhotoData) {
      addImage(doc, selfiePhotoData, 'Selfie Photo', 155, yPos, 40, 50)
    }

    let leftHeight = addKeyValue(doc, 'Vendor ID', vendor.vendorId, 14, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 2

    leftHeight = addKeyValue(doc, 'Name', vendor.name, 14, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 2

    leftHeight = addKeyValue(doc, 'Email', vendor.email, 14, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 2

    leftHeight = addKeyValue(doc, 'Role', vendor.role, 14, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 2

    leftHeight = addKeyValue(doc, 'Business Name', vendor.vendorInfo?.businessName, 14, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 2

    leftHeight = addKeyValue(doc, 'Contact Number', vendor.vendorInfo?.contactNumber, 14, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 2

    leftHeight = addKeyValue(
      doc,
      'Alternative Contact',
      vendor.vendorInfo?.alternativeContactNumber,
      14,
      yPos,
      85,
    )
    yPos += Math.max(leftHeight, 6) + 2

    leftHeight = addKeyValue(doc, 'Category', vendor.category?.name, 14, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 4

    // Ensure we're past the selfie photo before continuing
    yPos = Math.max(yPos, addSectionTitle(doc, 'Basic Information', 38) + 58)

    // ========== LOCATION INFORMATION ==========
    const checkResult = checkPageBreak(doc, yPos, 40, pageNumber, logoData)
    yPos = checkResult.y
    pageNumber = checkResult.pageNumber

    yPos = addSectionTitle(doc, 'Location Details', yPos)

    const address = vendor.location?.address
    if (address) {
      leftHeight = addKeyValue(doc, 'Address Line 1', address.addressLine1, 14, yPos, 85)
      let rightHeight = addKeyValue(doc, 'Address Line 2', address.addressLine2, 105, yPos, 85)
      yPos += Math.max(leftHeight, rightHeight) + 2

      leftHeight = addKeyValue(doc, 'Landmark', address.landmark, 14, yPos, 85)
      rightHeight = addKeyValue(doc, 'City', address.city, 105, yPos, 85)
      yPos += Math.max(leftHeight, rightHeight) + 2

      leftHeight = addKeyValue(doc, 'State', address.state, 14, yPos, 85)
      rightHeight = addKeyValue(doc, 'Postal Code', address.postalCode, 105, yPos, 85)
      yPos += Math.max(leftHeight, rightHeight) + 2

      const pincodes = address.postalCodes?.join(', ') || 'N/A'
      const pincodeHeight = addKeyValue(doc, 'Serviceable Pincodes', pincodes, 14, yPos, 175)
      yPos += pincodeHeight + 4
    }
    yPos += 2

    // ========== ACCOUNT STATUS ==========
    const checkResult2 = checkPageBreak(doc, yPos, 25, pageNumber, logoData)
    yPos = checkResult2.y
    pageNumber = checkResult2.pageNumber

    yPos = addSectionTitle(doc, 'Account Status', yPos)

    leftHeight = addKeyValue(doc, 'Restricted', vendor.isRestricted ? 'Yes' : 'No', 14, yPos, 85)
    addKeyValue(doc, 'Created At', new Date(vendor.createdAt).toLocaleString(), 105, yPos, 85)
    yPos += Math.max(leftHeight, 6) + 2

    addKeyValue(doc, 'Last Updated', new Date(vendor.updatedAt).toLocaleString(), 14, yPos, 85)
    yPos += 10

    // ========== BANK DETAILS ==========
    const checkResult3 = checkPageBreak(doc, yPos, 30, pageNumber, logoData)
    yPos = checkResult3.y
    pageNumber = checkResult3.pageNumber

    yPos = addSectionTitle(doc, 'Bank Details', yPos)

    const bankDetails = vendor.bankDetails
    if (bankDetails) {
      leftHeight = addKeyValue(doc, 'Account Holder', bankDetails.accountHolderName, 14, yPos, 85)
      addKeyValue(doc, 'Account Number', bankDetails.accountNumber, 105, yPos, 85)
      yPos += Math.max(leftHeight, 6) + 2

      leftHeight = addKeyValue(doc, 'IFSC Code', bankDetails.ifscCode, 14, yPos, 85)
      addKeyValue(doc, 'Bank Name', bankDetails.bankName, 105, yPos, 85)
      yPos += Math.max(leftHeight, 6) + 2
    }
    yPos += 2

    // ========== DOCUMENTS WITH IMAGES ==========
    // Add new page for documents
    showProgress('Adding documents to PDF...')
    doc.addPage()
    pageNumber++
    yPos = 38 // Start at 38 for new page
    addHeader(doc, 'Vendor Registration Details', logoData)
    addFooter(doc, pageNumber)

    showProgress('Loading images... This may take a moment.')

    // Load all images with progress tracking (excluding selfie photo and UPI QR which are already loaded)
    const imageUrls = {
      aadharFront: documents.aadharFrontDocument,
      aadharBack: documents.aadharBackDocument,
      panCard: documents.panCardDocument,
      gstCert: documents.gstCertificate,
      fssaiCert: documents.fssaiCertificate,
    }

    // Load images with error handling
    const images = {}
    for (const [key, url] of Object.entries(imageUrls)) {
      if (url) {
        showProgress(`Loading ${key}...`)
        try {
          images[key] = await getImageBase64(url)
        } catch (error) {
          console.error(`Failed to load ${key}:`, error)
          images[key] = null
        }
      } else {
        images[key] = null
      }
    }

    // Load shop photos (array)
    const shopPhotos = []
    if (documents.shopPhoto && Array.isArray(documents.shopPhoto)) {
      for (let i = 0; i < Math.min(documents.shopPhoto.length, 4); i++) {
        showProgress(`Loading shop photo ${i + 1}...`)
        try {
          const photoData = await getImageBase64(documents.shopPhoto[i])
          if (photoData) shopPhotos.push(photoData)
        } catch (error) {
          console.error(`Failed to load shop photo ${i + 1}:`, error)
        }
      }
    }

    yPos = addSectionTitle(doc, 'Uploaded Documents', yPos)
    yPos += 5

    // Shop Photos (if any)
    if (shopPhotos.length > 0) {
      const checkResult5 = checkPageBreak(doc, yPos, 55, pageNumber, logoData)
      yPos = checkResult5.y
      pageNumber = checkResult5.pageNumber

      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text('Shop Photos:', 14, yPos)
      doc.setFont(undefined, 'normal')
      yPos += 5

      // Display up to 2 photos per row
      for (let i = 0; i < shopPhotos.length; i += 2) {
        const checkResult6 = checkPageBreak(doc, yPos, 50, pageNumber, logoData)
        yPos = checkResult6.y
        pageNumber = checkResult6.pageNumber

        addImage(doc, shopPhotos[i], `Shop Photo ${i + 1}`, 14, yPos, 45, 40)
        if (shopPhotos[i + 1]) {
          addImage(doc, shopPhotos[i + 1], `Shop Photo ${i + 2}`, 105, yPos, 45, 40)
        }
        yPos += 48
      }
    }

    // Identity Documents
    const checkResult7 = checkPageBreak(doc, yPos, 50, pageNumber, logoData)
    yPos = checkResult7.y
    pageNumber = checkResult7.pageNumber

    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Identity Documents:', 14, yPos)
    doc.setFont(undefined, 'normal')
    yPos += 5

    // Aadhar Front and Back (selfie photo now in basic information)
    const checkResult8 = checkPageBreak(doc, yPos, 50, pageNumber, logoData)
    yPos = checkResult8.y
    pageNumber = checkResult8.pageNumber

    addImage(doc, images.aadharFront, 'Aadhar Front', 14, yPos, 45, 40)
    addImage(doc, images.aadharBack, 'Aadhar Back', 105, yPos, 45, 40)
    yPos += 48

    // Business Documents
    const checkResult9 = checkPageBreak(doc, yPos, 50, pageNumber, logoData)
    yPos = checkResult9.y
    pageNumber = checkResult9.pageNumber

    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Business Documents:', 14, yPos)
    doc.setFont(undefined, 'normal')
    yPos += 5

    // PAN Card
    const checkResult10 = checkPageBreak(doc, yPos, 50, pageNumber, logoData)
    yPos = checkResult10.y
    pageNumber = checkResult10.pageNumber

    addImage(doc, images.panCard, 'PAN Card', 14, yPos, 45, 40)
    yPos += 48

    // GST and FSSAI
    const checkResult11 = checkPageBreak(doc, yPos, 50, pageNumber, logoData)
    yPos = checkResult11.y
    pageNumber = checkResult11.pageNumber

    addImage(doc, images.gstCert, 'GST Certificate', 14, yPos, 45, 40)
    addImage(doc, images.fssaiCert, 'FSSAI Certificate', 105, yPos, 45, 40)
    yPos += 48

    // ========== UPI DETAILS ==========
    const checkResult12 = checkPageBreak(doc, yPos, 60, pageNumber, logoData)
    yPos = checkResult12.y
    pageNumber = checkResult12.pageNumber

    yPos = addSectionTitle(doc, 'UPI Details', yPos)

    const upiDetails = vendor.upiDetails

    // Load UPI QR Code for this section
    showProgress('Loading UPI QR Code...')
    let upiQrCodeData = null
    if (upiDetails?.qrCode) {
      try {
        upiQrCodeData = await getImageBase64(upiDetails.qrCode)
      } catch (error) {
        console.error('Failed to load UPI QR Code:', error)
      }
    }

    if (upiDetails) {
      // Add UPI QR Code on the right side
      if (upiQrCodeData) {
        addImage(doc, upiQrCodeData, 'UPI QR Code', 140, yPos, 50, 50)
      }

      leftHeight = addKeyValue(doc, 'UPI ID', upiDetails.upiId, 14, yPos, 85)
      yPos += Math.max(leftHeight, 6) + 2

      leftHeight = addKeyValue(doc, 'UPI Phone', upiDetails.upiPhoneNumber, 14, yPos, 85)
      yPos += Math.max(leftHeight, 6) + 4

      // Ensure we're past the QR code before continuing
      if (upiQrCodeData) {
        yPos = Math.max(yPos, addSectionTitle(doc, 'UPI Details', checkResult12.y) + 58)
      }
    }

    // Save the PDF
    showProgress('Saving PDF...')
    const fileName = `Vendor_${vendor.vendorInfo?.businessName || vendor.name}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)

    showProgress('PDF generated successfully!')

    return { success: true, fileName }
  } catch (error) {
    console.error('PDF Generation Error:', error)
    alert('Failed to generate PDF. Please check console for details.')
    return { success: false, error }
  }
}
