import re


def validate_ifsc_code(ifsc_code: str) -> bool:
    """
    Validate IFSC code format
    Format: First 4 characters are alphabetic (bank code)
           Fifth character is 0
           Last 6 characters are alphanumeric (branch code)
    """
    if not ifsc_code or len(ifsc_code) != 11:
        return False
    
    pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
    return bool(re.match(pattern, ifsc_code.upper()))


def validate_account_number(account_number: str) -> bool:
    """
    Validate account number
    Should be 9-18 digits long
    """
    if not account_number:
        return False
    
    # Remove spaces and check if all are digits
    cleaned = account_number.replace(' ', '')
    return cleaned.isdigit() and 9 <= len(cleaned) <= 18


def validate_mobile_number(mobile: str) -> bool:
    """
    Validate Indian mobile number
    Should start with 6, 7, 8, or 9 and be 10 digits long
    """
    if not mobile:
        return False
    
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, mobile))


def validate_pan_number(pan: str) -> bool:
    """
    Validate PAN number format
    Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    """
    if not pan or len(pan) != 10:
        return False
    
    pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    return bool(re.match(pattern, pan.upper()))


def validate_email(email: str) -> bool:
    """
    Validate email format
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def clean_account_number(account_number: str) -> str:
    """
    Clean account number by removing spaces and non-numeric characters
    """
    return re.sub(r'[^0-9]', '', account_number)


def format_ifsc_code(ifsc_code: str) -> str:
    """
    Format IFSC code to uppercase
    """
    return ifsc_code.upper() if ifsc_code else ""


def validate_cheque_number(cheque_number: str) -> bool:
    """
    Validate cheque number (6-8 digits)
    """
    if not cheque_number:
        return True  # Optional field
    
    return cheque_number.isdigit() and 6 <= len(cheque_number) <= 8
