# QR Code Generation Flow - Complete Documentation

## Overview
This document explains the complete flow of how QR codes are generated and displayed on certificates, including how the verification URL metadata is embedded.

---

## Flow Diagram

```
1. Certificate Page Loads (/c/:id)
   ↓
2. Fetch Certificate Data from Supabase
   ↓
3. Extract Elements Data (including QR element)
   ↓
4. Set QR Code URL with Certificate ID
   ↓
5. Render Certificate with QR Element
   ↓
6. QrElement Component Generates QR Code
   ↓
7. QR Code Displayed with Logo Overlay
```

---

## Step-by-Step Flow

### Step 1: Certificate Page Initialization
**File:** `src/pages/displayCertificate/DisplayCertificate.tsx`

When a user visits `/c/:id`, the `DisplayCertificate` component:
- Extracts the certificate ID from the URL parameter
- Calls `fetchData()` to retrieve certificate data from Supabase

```typescript
const { id } = useParams(); // Gets certificate ID from URL
```

### Step 2: Fetch Certificate Data
**File:** `src/pages/displayCertificate/DisplayCertificate.tsx` (Lines 42-68)

The component fetches certificate data including:
- Certificate metadata
- Template configuration
- **Elements data** (this includes QR code element configuration)

```typescript
const { data, error } = await supabase.rpc(
  "get_certificate_data_for_certificate_creation", 
  { certificate_id: id, certificate_short_id: id }
);
```

The response contains:
- `certificateData.config` - Certificate dimensions and rendering config
- `certificateData.elements` - All certificate elements including QR code
- `certificateData.id` - The unique certificate ID

### Step 3: Set QR Code URL with Verification Metadata
**File:** `src/pages/displayCertificate/DisplayCertificate.tsx` (Lines 123-170)

This is the **KEY STEP** where the verification URL is set:

```typescript
useEffect(() => {
  Object.keys(elementsData).map((key, index) => {
    if (key === "gmc_link") {
      // Sets the verification link text
      elementsData[key]["data"]["text"].set(
        "Verify at https://mindmerge.verification.givemycertificate.com/v/" + certificateData.id
      );
    } else if (key === "gmc_qr") {
      // ⭐ THIS IS WHERE THE QR CODE URL IS SET ⭐
      elementsData[key]["data"]["url"].set(
        "https://mindmerge.verification.givemycertificate.com/v/" + certificateData.id
      );
    }
    // ... other elements
  });
}, [certificateData]);
```

**Important Points:**
- The QR code URL is: `https://mindmerge.verification.givemycertificate.com/v/{certificate_id}`
- The certificate ID is embedded in the URL as metadata
- This URL points to the verification page where users can verify the certificate

### Step 4: Certificate Rendering
**File:** `src/components/certificate/PreviewCertificate.tsx`

The `PreviewCertificate` component:
- Loads the certificate background image
- Renders all elements using the `DrawingSheet` component
- Handles responsive sizing and scaling

### Step 5: Drawing Sheet Renders Elements
**File:** `src/components/certificate/DrawingSheet.tsx` (Line 44-45)

The `DrawingSheet` component iterates through all elements and renders them:

```typescript
case "qr":
  return <QrElement 
    key={key} 
    elementProps={element.get()} 
    url={element.data.url.get()}  // ⭐ Verification URL passed here
    attrs={{ ...element.data.get(), id: key } as QrProps} 
    isWhiteLabeled={isWhiteLabeled} 
  />;
```

### Step 6: QR Code Generation
**File:** `src/components/elements/QrElement.tsx` (Lines 50-62)

This is where the actual QR code is generated:

```typescript
const loadImage = async () => {
  let image = new window.Image();
  image.crossOrigin = "Anonymous";
  
  // ⭐ QR CODE GENERATION HAPPENS HERE ⭐
  let data = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",  // High error correction (30% recovery)
    scale: 6,                    // Size multiplier
  });
  
  image.src = data;
  qrImageRef.current = image;
  qrImageRef.current.addEventListener("load", () => {
    setQrImage(qrImageRef.current);
  });
};
```

**QR Code Library:** Uses `qrcode` npm package (`QRCode.toDataURL()`)

**Configuration:**
- **Error Correction Level:** `"H"` (High) - Can recover up to 30% of damaged QR code
- **Scale:** `6` - Determines the pixel density of the QR code
- **URL:** The verification URL containing the certificate ID

### Step 7: Logo Overlay (Optional)
**File:** `src/components/elements/QrElement.tsx` (Lines 26-48, 80-89)

The QR code can have a logo overlay in the center:

```typescript
// Logo configuration
const gmcLogoUrl = 'https://gpnmjenofbfeawopmhkj.supabase.co/storage/v1/object/public/public/gmc_files/gmc_logo_sq_small_compress.png';

// Logo is displayed if:
// 1. gmcLogo is enabled in elementProps
// 2. customLogo is set with customLogoUrl
// 3. Certificate is NOT white-labeled (!isWhiteLabeled)

if (displayLogoOnQr) {
  <KonvaImage
    height={attrs.size / logoRatio}  // Logo is 1/4 the size of QR
    width={attrs.size / logoRatio}
    image={logoImg}
    x={attrs.x + (attrs.size * (1 - 1 / logoRatio)) / 2}  // Centered
    y={attrs.y + (attrs.size * (1 - 1 / logoRatio)) / 2}
  />
}
```

### Step 8: Final Rendering
**File:** `src/components/elements/QrElement.tsx` (Lines 69-91)

The QR code is rendered as a Konva Image component:

```typescript
return (
  <>
    {qrImage && 
      <KonvaImage 
        {...attrs}           // Position (x, y) and size
        height={attrs.size} 
        width={attrs.size} 
        image={qrImage}      // The generated QR code image
      />
    }
    {displayLogoOnQr && /* Logo overlay */}
  </>
);
```

---

## Key Components Summary

### 1. **DisplayCertificate.tsx**
- Fetches certificate data
- **Sets the QR code URL** with verification link
- Manages certificate state

### 2. **PreviewCertificate.tsx**
- Main certificate canvas component
- Handles responsive sizing
- Renders background and elements

### 3. **DrawingSheet.tsx**
- Renders all certificate elements
- Routes QR elements to `QrElement` component

### 4. **QrElement.tsx**
- **Generates the actual QR code** using `qrcode` library
- Handles logo overlay
- Renders QR code on canvas

---

## Verification URL Structure

The QR code contains this URL format:
```
https://mindmerge.verification.givemycertificate.com/v/{certificate_id}
```

**Example:**
```
https://mindmerge.verification.givemycertificate.com/v/d0d93d04-720b-4019-aa74-b3fabf47bb4a
```

When scanned, this URL:
1. Takes the user to the verification page
2. The verification page extracts the certificate ID from the URL
3. Displays certificate verification details

---

## QR Code Metadata

The QR code itself contains:
- **URL:** The verification page URL
- **Certificate ID:** Embedded in the URL path
- **No additional metadata:** The certificate ID in the URL is the only metadata

The verification page uses the certificate ID from the URL to:
- Fetch certificate details
- Display verification status
- Show certificate information

---

## Dependencies

### QR Code Generation Library
```json
"qrcode": "^1.4.4"
```

### Usage
```typescript
import QRCode from "qrcode";

// Generate QR code as data URL
const dataURL = await QRCode.toDataURL(url, {
  errorCorrectionLevel: "H",
  scale: 6,
});
```

---

## Error Correction Level

The QR code uses **Error Correction Level H (High)**:
- Can recover up to **30%** of damaged/missing data
- Makes the QR code more robust for printing
- Slightly increases QR code complexity but ensures reliability

---

## Logo Overlay Logic

The QR code logo is displayed when:
1. **Default:** Certificate is NOT white-labeled → Shows GMC logo
2. **Custom:** `gmcLogo` or `customLogo` is enabled in element properties
3. **Logo Size:** 1/4 of the QR code size (logoRatio = 4)
4. **Position:** Centered in the QR code

---

## Complete Data Flow

```
Certificate ID (from URL)
    ↓
Supabase RPC Call
    ↓
Certificate Data (elements, config)
    ↓
Set QR URL: verification.givemycertificate.com/v/{id}
    ↓
QrElement receives URL
    ↓
QRCode.toDataURL() generates QR image
    ↓
Logo overlay added (if applicable)
    ↓
Rendered on Konva canvas
    ↓
Displayed on certificate
```

---

## Testing the Flow

To verify the QR code generation:

1. **Check the URL being set:**
   - Open browser DevTools
   - Check console for certificate data
   - Verify `elementsData.gmc_qr.data.url` contains the verification URL

2. **Verify QR code content:**
   - Scan the QR code with a QR scanner app
   - Should redirect to: `https://mindmerge.verification.givemycertificate.com/v/{certificate_id}`

3. **Check QR code generation:**
   - Inspect `QrElement` component in React DevTools
   - Verify `url` prop contains the verification URL
   - Check that `qrImage` state is populated

---

## Notes

- The QR code is generated **client-side** using the `qrcode` library
- The verification URL is **dynamically constructed** using the certificate ID
- The QR code is rendered on a **Konva canvas** for high-quality display
- Logo overlay is optional and configurable per certificate template
- Error correction level H ensures the QR code works even if partially damaged

