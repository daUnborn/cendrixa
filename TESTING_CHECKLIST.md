# Enhanced Document Signing - Testing Checklist

## ✅ Pre-Testing Setup (COMPLETED)

- [x] Database migration run successfully
- [x] Resend API key added to Vercel environment variables
- [x] Production deployment successful (https://cendrixa.vercel.app)

## 🧪 Testing Scenarios

### Test 1: PDF Signature Embedding (Core Feature)

**Prerequisites:**
- [ ] Have a test employee with a valid email address
- [ ] Have a contract PDF ready to upload (any PDF will work)

**Steps:**
1. [ ] Login to https://cendrixa.vercel.app/login
2. [ ] Go to Contracts page
3. [ ] Click "Add Contract" button
4. [ ] Fill in contract details:
   - Select an employee
   - Choose contract type (e.g., "Permanent")
   - Set start date
   - **Upload a PDF document** (this is critical!)
   - Add any other optional details
5. [ ] Click "Create Contract"
6. [ ] Verify contract appears in the table

**Expected Result:**
- Contract created successfully
- PDF appears as "Original" link in Document column
- Signing status shows "Unsigned"

---

### Test 2: Email Delivery

**Steps:**
1. [ ] Find the contract you just created in the table
2. [ ] Click the "Send Link" dropdown button
3. [ ] Select "Send via Email"
4. [ ] Wait for success toast message

**Expected Result:**
- Toast appears: "Signing link sent via email to [employee@email.com]"
- Signing status badge changes to "Pending" (amber color)
- No errors in browser console

**Verify Email Delivery:**
5. [ ] Check the employee's email inbox
6. [ ] Look for email from "Cendrixa <noreply@cendrixa.com>"
7. [ ] Subject should be: "Action Required: Sign your [Contract Type]"
8. [ ] Email should have professional HTML formatting
9. [ ] Email should contain a blue "Review and Sign Document" button

**Expected Email Content:**
```
Hello [Employee Name],

[Company Name] has sent you a contract to review and sign.

Document: [Contract Type]

[Review and Sign Document Button]

Important: This link will expire in 7 days.
```

---

### Test 3: PDF Viewing & Signature Zone

**Steps:**
1. [ ] Click the signing link from the email
   - OR copy the link from "Copy Link" option and open in new browser tab
2. [ ] Wait for page to load

**Expected Result:**
- [ ] Page shows contract details (employee name, contract type, dates, salary)
- [ ] PDF renders in the browser (not a download link)
- [ ] You can see the PDF content clearly
- [ ] Page navigation shows (e.g., "Page 1 of 3")
- [ ] Previous/Next buttons work to navigate PDF pages

**Signature Zone Check:**
3. [ ] Navigate to the last page of the PDF
4. [ ] Look for a blue dashed box at the bottom right of the page
5. [ ] Box should display text: "Click to sign here"

**Expected Signature Zone:**
- Position: Bottom right corner, ~250px from right edge
- Size: ~200px wide × 80px tall
- Border: Blue dashed line (2px)
- Background: Light blue semi-transparent (when not signed)
- Cursor: Changes to pointer on hover

---

### Test 4: Signature Capture

**Steps:**
1. [ ] Click inside the signature zone
2. [ ] Modal should appear with title "Sign Document"
3. [ ] Modal contains:
   - [ ] White canvas area for drawing
   - [ ] "Full legal name" text input field
   - [ ] "Cancel" button (gray)
   - [ ] "Confirm Signature" button (blue, disabled)

**Drawing Signature:**
4. [ ] Use mouse/trackpad to draw your signature in the canvas
   - Try: Draw your initials or name
5. [ ] After drawing, a "Clear signature" button should appear
6. [ ] Click "Clear signature" - canvas should become blank again
7. [ ] Draw signature again

**Completing Signature:**
8. [ ] Enter your full legal name in the text field
9. [ ] "Confirm Signature" button should become enabled (no longer disabled)
10. [ ] Click "Confirm Signature"

**Expected Result:**
- Modal closes
- Signature appears in the blue dashed zone as a preview image
- Zone background becomes transparent (no longer light blue)
- A "Submit Signed Document" button appears at the bottom of the page

---

### Test 5: Document Submission

**Steps:**
1. [ ] Review the signature preview in the zone
2. [ ] If happy with signature, click "Submit Signed Document" button
3. [ ] Wait for submission (button may show loading spinner)

**Expected Result:**
- Page changes to success screen
- Green checkmark icon appears
- Message: "Contract Signed"
- Subtext: "Signed by [Your Name]. You may close this page."
- No errors in browser console

**What Happens Behind the Scenes:**
- Original PDF downloaded from Supabase Storage
- Signature PNG embedded into PDF at the exact zone coordinates
- Timestamp and signer name added below signature
- Signed PDF uploaded to: `{company_id}/contracts/{contract_id}_signed.pdf`
- Database updated with signing details

---

### Test 6: Verify Signed PDF in Dashboard

**Steps:**
1. [ ] Go back to the Contracts page: https://cendrixa.vercel.app/contracts
2. [ ] Find the contract you just signed
3. [ ] Check the "Document" column
4. [ ] Check the "Signing" column

**Expected Result in Document Column:**
- [ ] **Green "Signed PDF" link** appears (bold, green text)
- [ ] Original PDF link may still be visible below it

**Expected Result in Signing Column:**
- [ ] Badge shows "Signed" with green background
- [ ] Green checkmark icon with "Signed" text
- [ ] No "Send Link" button (signing already complete)

**Download and Verify Signed PDF:**
5. [ ] Click the green "Signed PDF" link
6. [ ] PDF should download or open in new tab
7. [ ] Navigate to the last page
8. [ ] Look at the bottom right corner

**Expected Content on Signed PDF:**
- [ ] Your signature image embedded in the PDF
- [ ] Text below signature: "Signed by: [Your Full Name]"
- [ ] Text below that: "Date: [DD/MM/YYYY]" (UK format)
- [ ] Signature appears as part of the PDF (not an overlay)
- [ ] PDF can be printed with signature visible

---

### Test 7: Audit Trail Verification

**Steps:**
1. [ ] Go to Audit Logs page: https://cendrixa.vercel.app/audit
2. [ ] Look for recent entries related to the contract

**Expected Audit Log Entries:**
- [ ] "Created contract for employee" (when contract was created)
- [ ] "Sent contract signing link via email to [employee@email.com]" (when email sent)
  - Metadata should include: `delivery_method: 'email'`, `recipient_email`
- [ ] "Contract signed by [Your Name]" (when contract was signed)
  - Metadata should include: `signer_ip: [IP Address]`

**Verify Audit Entry Details:**
3. [ ] Each entry should have:
   - Timestamp
   - Action type ("create" or "update")
   - Entity type ("contract")
   - User who performed action (or "System" for signing)
   - Description text

---

### Test 8: Email Delivery Edge Cases

**Test 8a: Employee with No Email**
1. [ ] Create a new employee without an email address
2. [ ] Create a contract for this employee
3. [ ] Try to click "Send Link" → "Send via Email"

**Expected Result:**
- Error toast: "Employee has no email address"
- Signing status stays "Unsigned"
- Can still use "Copy Link" option

**Test 8b: Manual Copy Link**
1. [ ] For any unsigned contract, click "Send Link" → "Copy Link"
2. [ ] Check clipboard (paste into notepad)

**Expected Result:**
- Link copied: `https://cendrixa.vercel.app/sign/[UUID-TOKEN]`
- Toast: "Signing link copied to clipboard" or similar
- `link_sent_via` in database set to "manual"
- No email sent

---

### Test 9: Security & Validation

**Test 9a: Expired/Invalid Token**
1. [ ] Try to access: https://cendrixa.vercel.app/sign/invalid-token-12345

**Expected Result:**
- Error page: "Link Invalid"
- Message: "Contract not found" or similar
- Cannot proceed to signing

**Test 9b: Already Signed Contract**
1. [ ] Get the signing link for a contract you already signed
2. [ ] Try to access the link again

**Expected Result:**
- Success page immediately: "Contract Signed"
- Message: "Signed by [Your Name]. You may close this page."
- Cannot sign again (prevents duplicate signatures)

**Test 9c: No PDF Document**
1. [ ] Create a contract WITHOUT uploading a PDF
2. [ ] Generate signing link and open it

**Expected Result:**
- Page loads but shows warning
- Message: "No Document Available"
- Explanation: "This contract does not have an attached PDF document. Please contact [Company] for assistance."
- No signature zone displayed

---

### Test 10: Mobile Responsiveness

**Test on Mobile Device (or Chrome DevTools mobile emulation):**

**Steps:**
1. [ ] Open signing link on mobile browser (iOS Safari or Android Chrome)
2. [ ] Check PDF rendering
3. [ ] Check signature zone tap interaction
4. [ ] Try drawing signature with finger/stylus

**Expected Mobile Behavior:**
- [ ] PDF scales to fit mobile screen width
- [ ] Signature zone is tappable (touch-friendly size)
- [ ] Signature modal opens on tap
- [ ] Canvas supports touch drawing (not just mouse)
- [ ] Signature appears smooth (not pixelated)
- [ ] "Submit Signed Document" button is easily tappable

---

## 🐛 Known Issues to Watch For

### Issue: PDF Not Rendering
**Symptoms:** Blank page or "Failed to load PDF" error
**Possible Causes:**
- PDF file is corrupted
- CORS issues with Supabase Storage
- PDF.js worker not loading (check browser console)

**How to Debug:**
- Check browser console for errors
- Try downloading the PDF directly (check if file exists)
- Verify Supabase Storage CORS settings

### Issue: Signature Not Embedding
**Symptoms:** Contract marked as signed, but downloaded PDF has no signature
**Possible Causes:**
- pdf-lib failed to embed signature
- Signature data too large (>500KB)
- PDF format incompatible with pdf-lib

**How to Debug:**
- Check server logs in Vercel for errors
- Try with a different/simpler PDF
- Check `signed_document_url` in database is not null

### Issue: Email Not Sending
**Symptoms:** No email received, error toast appears
**Possible Causes:**
- Resend API key incorrect or missing
- Employee email address invalid
- Resend domain not verified

**How to Debug:**
- Check Resend dashboard logs: https://resend.com/logs
- Verify `RESEND_API_KEY` environment variable in Vercel
- Check employee's email address is valid format
- Look for error in browser console Network tab

### Issue: Signature Zone Not Clickable
**Symptoms:** Clicking blue box does nothing
**Possible Causes:**
- JavaScript error preventing modal from opening
- PDF not on the last page
- CSS z-index issue

**How to Debug:**
- Check browser console for JavaScript errors
- Navigate to last page manually
- Inspect element to verify zone is present in DOM

---

## ✅ Success Criteria

All tests pass when:

- [x] Database migration completed
- [x] Resend API key configured
- [ ] Contract can be created with PDF upload
- [ ] Email delivery works and employee receives email
- [ ] PDF renders in browser with visible signature zone
- [ ] Signature can be drawn and captured
- [ ] Document submission succeeds
- [ ] Signed PDF appears in contracts dashboard
- [ ] Downloaded signed PDF contains embedded signature + timestamp
- [ ] Audit logs track all signing events
- [ ] Mobile devices can sign documents successfully
- [ ] Error cases handled gracefully (no email, invalid token, etc.)

---

## 📊 Test Results

### Test Date: _____________

| Test | Status | Notes |
|------|--------|-------|
| 1. PDF Signature Embedding | ⬜ Pass / ⬜ Fail | |
| 2. Email Delivery | ⬜ Pass / ⬜ Fail | |
| 3. PDF Viewing & Zone | ⬜ Pass / ⬜ Fail | |
| 4. Signature Capture | ⬜ Pass / ⬜ Fail | |
| 5. Document Submission | ⬜ Pass / ⬜ Fail | |
| 6. Signed PDF Verification | ⬜ Pass / ⬜ Fail | |
| 7. Audit Trail | ⬜ Pass / ⬜ Fail | |
| 8. Edge Cases | ⬜ Pass / ⬜ Fail | |
| 9. Security Validation | ⬜ Pass / ⬜ Fail | |
| 10. Mobile Responsiveness | ⬜ Pass / ⬜ Fail | |

---

## 🎯 Next Steps After Testing

If all tests pass:
- ✅ System is production-ready
- ✅ Can start using for real employee contracts
- ✅ Consider implementing Phase 3 (SMS delivery) if needed

If issues found:
- Document the specific error messages
- Check browser console and Vercel logs
- Share error details for debugging support

---

## 📝 Notes

- Test with multiple PDF types (simple, complex, multi-page)
- Test with different browsers (Chrome, Safari, Firefox)
- Test with real employee email addresses (not test accounts)
- Keep a sample signed PDF for legal verification

