# PDF Layout Fitting Guide

## Problem: Content Getting Cut Off in PDF

When you update template.docx but the PDF doesn't fit properly, follow these steps:

## ✅ Quick Fix Checklist:

### 1. **Adjust Page Margins in Word**
Open `template.docx` in Microsoft Word:
- Go to: **Page Layout → Margins → Custom Margins**
- Recommended settings:
  ```
  Top:    1.5 cm (0.6")
  Bottom: 1.5 cm (0.6")
  Left:   2.0 cm (0.8")
  Right:  2.0 cm (0.8")
  ```

### 2. **Reduce Font Sizes**
- Main text: 10pt or 11pt (not larger than 12pt)
- Headers: 14pt or 16pt (not larger than 18pt)
- Table text: 9pt or 10pt

### 3. **Adjust Table Properties**
For tables that are too wide:
1. Right-click table → **Table Properties**
2. **Table tab** → Preferred width: 100%
3. **Options** → Cell margins: 0.05 cm (all sides)
4. **Column tab** → Adjust individual column widths

### 4. **Remove Extra Spacing**
- Select all text (Ctrl+A)
- Right-click → **Paragraph**
- Set:
  ```
  Before: 0 pt
  After: 6 pt (or 3 pt for compact layout)
  Line spacing: Single
  ```

### 5. **Check Page Breaks**
- View → Print Layout
- Look for content that flows to next page
- Adjust spacing or font size to keep content on one page

## 🔧 Advanced Fixes:

### If Content Still Doesn't Fit:

#### Option A: Scale Down Entire Document
1. File → Print
2. Settings → 1 Page Per Sheet → Scale to Fit
3. Note the scale percentage (e.g., 95%)
4. Cancel print
5. Manually reduce all fonts by that percentage

#### Option B: Use Narrow Margins
- Page Layout → Margins → Narrow (0.5" all around)

#### Option C: Landscape Orientation (for wide tables)
- Page Layout → Orientation → Landscape

## 📝 Best Practices:

1. **Test After Each Change:**
   - Save template.docx
   - Generate PDF in Streamlit
   - Check if content fits

2. **Keep Variables Safe:**
   - Don't delete {{ variable_name }}
   - Only adjust formatting around them

3. **Use Consistent Fonts:**
   - Marathi: Mangal, Kruti Dev, or Shivaji
   - English: Arial or Calibri
   - Size: 10-11pt for body text

4. **Table Tips:**
   - Use AutoFit to Contents
   - Merge cells if needed
   - Reduce cell padding
   - Use smaller fonts in tables

## 🎯 Specific Fix for Your Screenshot:

Based on the image you shared, the issue is:
- Content is too close to page edges
- Table might be too wide

**Quick Fix:**
1. Open template.docx
2. Select the table
3. Table Tools → Layout → AutoFit → AutoFit to Window
4. Reduce font size in table to 10pt
5. Page Layout → Margins → Set to 2cm all around
6. Save and regenerate PDF

## 💡 Pro Tips:

- **Before making changes:** Save a backup copy of template.docx
- **Test with sample data:** Generate PDF to see actual output
- **Use Print Preview:** In Word, use Print Preview to see how it will look
- **Check all pages:** Make sure all 25 pages fit properly

## 🔄 Updated Code:

The Python code has been updated to use better PDF conversion:
- Uses `pdf:writer_pdf_Export` filter for better quality
- Preserves layout more accurately
- Better handling of Marathi fonts

## ⚠️ Common Mistakes to Avoid:

1. ❌ Don't use very large fonts (>14pt for body text)
2. ❌ Don't use very small margins (<1cm)
3. ❌ Don't make tables wider than page width
4. ❌ Don't add too much content on one page
5. ❌ Don't forget to save template.docx after changes

## 📞 Still Having Issues?

If content still doesn't fit after trying above steps:
1. Check if LibreOffice is updated to latest version
2. Try opening the generated temp_filled_form.docx in Word
3. Manually export to PDF from Word (File → Save As → PDF)
4. Compare with LibreOffice PDF to see the difference
