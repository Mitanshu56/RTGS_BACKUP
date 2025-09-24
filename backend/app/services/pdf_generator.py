# rtgs_dynamic_form.py
# This version is updated to accept and display dynamic data in the specified template.
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from ..models.remitter import Remitter
from ..utils.amount_to_words import amount_to_words

def generate_dynamic_form(remitter_data, transaction_data):
    """
    Generates a PDF form with dynamic data, keeping blank fields if data is not provided.
    
    Args:
        remitter_data (dict): A dictionary for the remitter's details.
        transaction_data (dict): A dictionary for beneficiary and transaction details.
        
    Returns:
        BytesIO: A buffer containing the generated PDF in memory.
    """
    # 1. --- Document Setup ---
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # 2. --- Define Paragraph Styles ---
    styles = getSampleStyleSheet()
    underlined_style = ParagraphStyle('underline_header', parent=styles['Normal'], fontName='Helvetica', fontSize=12, alignment=TA_CENTER, leading=15)
    underlined_style.textColor = colors.blue
    section_style = ParagraphStyle('section', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=TA_CENTER, spaceBefore=6, spaceAfter=6)
    label_style = ParagraphStyle('label', parent=styles['Normal'], fontName='Helvetica', fontSize=9, alignment=TA_LEFT)
    footer_style = ParagraphStyle('footer', parent=styles['Normal'], fontName='Helvetica', fontSize=8, alignment=TA_LEFT)
    disclaimer_style = ParagraphStyle('disclaimer', parent=footer_style, alignment=TA_CENTER)
    # Style for the dynamic data, making it bold
    data_style = ParagraphStyle('data', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=TA_LEFT)

    # 3. --- Draw the Header Manually (as separate text) ---
    y_pos = height - 1 * inch  # Starting y-position
    
    c.setFont('Helvetica-Bold', 10)
    c.drawCentredString(width / 2.0, y_pos, 'RTGS')
    y_pos -= 0.2 * inch
    
    c.setFont('Helvetica-Bold', 10)
    c.drawCentredString(width / 2.0, y_pos, 'Prime Co-op. Bank Ltd')
    y_pos -= 0.2 * inch
    
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(width / 2.0, y_pos, 'JAHANGIRPURA Branch')
    y_pos -= 0.2 * inch

    p_underline = Paragraph('<u>NEFT/RTGS Applications From</u>', underlined_style)
    p_underline.wrapOn(c, width, height)
    p_underline.drawOn(c, 0, y_pos)
    
    # --- MODIFIED: Reduced this value to remove the space ---
    y_pos -= 0.2 * inch 

    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(width / 2.0, y_pos, "Remitter's/Initiator's Information")

    # --- Space below the header ---
    y_pos -= 0.35 * inch

    # 4. --- Prepare Data for the TWO Tables ---

    # --- Data for the TOP table ---
    # By wrapping all dynamic text in Paragraph objects, we ensure automatic text wrapping.
    form_data_top = [
        [Paragraph('Account with Branch', label_style), Paragraph(remitter_data.get('account_with_branch', ''), data_style)],
        [Paragraph("Name of Remitter/s", label_style), Paragraph(remitter_data.get('name', ''), data_style)],
        [Paragraph("A/C No. of Remitter/s", label_style), Paragraph(remitter_data.get('account_no', ''), data_style)],
        [Paragraph("Mobile No of Remitter/s", label_style), Paragraph(remitter_data.get('mobile', ''), data_style)],
        [Paragraph('Pan No', label_style), Paragraph(remitter_data.get('pan', ''), data_style)],
        # Updated signature field - vertical layout with line break
        [Paragraph('Signature of Remitter/s', label_style), Paragraph('[X]<br/>[X]', data_style)],
        [Paragraph('Cheque No.', label_style), Paragraph(remitter_data.get('cheque_no', ''), data_style)],
    ]

    # --- Data for the BOTTOM table ---
    form_data_bottom = [
        [Paragraph("Beneficiary's Information", section_style)],
        [Paragraph("Beneficiary Party's Name", label_style), Paragraph(transaction_data.get('beneficiary_name', ''), data_style)],
        [Paragraph('Beneficiary Bank', label_style), Paragraph(transaction_data.get('beneficiary_bank', ''), data_style)],
        [Paragraph('Beneficiary A/C No', label_style), Paragraph(transaction_data.get('beneficiary_account_no', ''), data_style)],
        [Paragraph("Beneficiary Bank's Branch & its<br/>Address", label_style), Paragraph(transaction_data.get('beneficiary_address', ''), data_style)],
        [Paragraph("Beneficiary Bank's IFSC Code", label_style), Paragraph(transaction_data.get('beneficiary_ifsc', ''), data_style)],
        [Paragraph('Amount In Figure', label_style), Paragraph(transaction_data.get('amount_fig', ''), data_style)],
        [Paragraph('Amount In Words', label_style), Paragraph(transaction_data.get('amount_words', ''), data_style)],
        [Paragraph("if available, please submit<br/>Beneficiary party's Pan Card No", label_style), ''],
        [Paragraph('Mobile No', label_style), Paragraph(transaction_data.get('beneficiary_mobile', ''), data_style)],
        [Paragraph("--> Please ensure all above information filled correctly bank is not responsible for it <--", disclaimer_style)],
        [Paragraph("""All the input provided above including beneficiary's name are as per bank record & I/We here by
                   authorize you to debit my account and proceed further for NEFT/RTGS/Electronic Fund Trf.""", footer_style)],
        [Paragraph('[X]__________________<br/><br/>[X]__________________', footer_style)],
        [Paragraph("For Bank Use Only", section_style)],
        [Paragraph('Posted By', label_style), Paragraph('Verified By', label_style)],
    ]

    # 5. --- Create and Draw the TOP Table ---
    col_widths = [2.7*inch, 4.3*inch]
    table_top = Table(form_data_top, colWidths=col_widths, rowHeights=None)
    table_top.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))

    table_width, table_height = table_top.wrapOn(c, width, height)
    x_pos = (width - table_width) / 2
    y_pos -= table_height 
    table_top.drawOn(c, x_pos, y_pos)

    # --- Space between the two tables ---
    y_pos -= 0.25 * inch

    # 6. --- Create and Draw the BOTTOM Table ---
    table_bottom = Table(form_data_bottom, colWidths=col_widths, rowHeights=None)
    table_bottom.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, 0), (1, 0)),
        ('SPAN', (0, 10), (1, 10)),
        ('SPAN', (0, 11), (1, 11)),
        ('SPAN', (0, 12), (1, 12)),
        ('SPAN', (0, 13), (1, 13)),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 11), (1, 11), 10),
        ('BOTTOMPADDING', (0, 12), (1, 12), 10),
    ]))
    
    table_width, table_height = table_bottom.wrapOn(c, width, height)
    y_pos -= table_height
    table_bottom.drawOn(c, x_pos, y_pos)

    num_rows_bottom = len(form_data_bottom)
    checkbox_y = y_pos + table_height - (table_height / num_rows_bottom) * 0.5
    c.rect(x_pos + table_width + 0.1*inch, checkbox_y, 0.15*inch, 0.15*inch)

    # 7. --- Save the PDF ---
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

def generate_rtgs_pdf(transaction, user, db):
    """
    Main function called by the API - uses the new template structure
    """
    # Get beneficiary
    beneficiary = transaction.beneficiary
    
    # Get remitter details
    remitter = db.query(Remitter).filter(Remitter.user_id == user.id).first()
    
    # Prepare remitter data dictionary for the template
    if remitter:
        remitter_data = {
            "account_with_branch": f'{remitter.bank_name} - {remitter.branch_name}' if remitter.bank_name and remitter.branch_name else '',
            "name": remitter.account_name or '',
            "account_no": remitter.account_number or '',
            "mobile": remitter.mobile or '',
            "pan": remitter.pan_number or '',
            "cheque_no": transaction.cheque_number or ''
        }
    else:
        remitter_data = {
            "account_with_branch": '',
            "name": user.name or '',
            "account_no": '',
            "mobile": '',
            "pan": '',
            "cheque_no": transaction.cheque_number or ''
        }
    
    # Prepare transaction data dictionary for the template
    amount_in_words = amount_to_words(float(transaction.amount))
    beneficiary_address = f'{beneficiary.branch_name}'
    if hasattr(beneficiary, 'bank_address') and beneficiary.bank_address:
        beneficiary_address += f', {beneficiary.bank_address}'
    
    transaction_data = {
        "beneficiary_name": beneficiary.name or '',
        "beneficiary_bank": beneficiary.bank_name or '',
        "beneficiary_account_no": beneficiary.account_number or '',
        "beneficiary_address": beneficiary_address,
        "beneficiary_ifsc": beneficiary.ifsc_code or '',
        "amount_fig": f'{transaction.amount:,.2f}',
        "amount_words": amount_in_words,
        "beneficiary_mobile": beneficiary.mobile or ''
    }
    
    # Use the new template function
    return generate_dynamic_form(remitter_data, transaction_data)


async def download_pdf(transaction_id: int, user, db):
    """Download PDF for a specific transaction"""
    from sqlalchemy.orm import joinedload
    from ..models.transaction import Transaction
    
    # Get transaction with beneficiary
    transaction = db.query(Transaction).options(
        joinedload(Transaction.beneficiary)
    ).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user.id
    ).first()
    
    if not transaction:
        return None
    
    return generate_rtgs_pdf(transaction, user, db)


# Main method for demonstration purposes
if __name__ == '__main__':
    print("RTGS PDF Generator module loaded successfully!")