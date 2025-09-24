import math


def number_to_words(n):
    """Convert a number to Indian currency words (0-99999999.99)"""
    
    def convert_hundreds(num):
        """Convert a number less than 1000 to words"""
        ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
        teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 
                'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
        tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
        
        result = ''
        
        # Hundreds place
        if num >= 100:
            result += ones[num // 100] + ' Hundred '
            num %= 100
        
        # Tens and ones place
        if num >= 20:
            result += tens[num // 10]
            if num % 10 != 0:
                result += ' ' + ones[num % 10]
        elif num >= 10:
            result += teens[num - 10]
        elif num > 0:
            result += ones[num]
        
        return result.strip()
    
    if n == 0:
        return 'Zero Rupees Only'
    
    # Split into rupees and paise
    rupees = int(n)
    paise = round((n - rupees) * 100)
    
    result = ''
    
    if rupees > 0:
        # Handle crores
        if rupees >= 10000000:
            crores = rupees // 10000000
            result += convert_hundreds(crores) + ' Crore '
            rupees %= 10000000
        
        # Handle lakhs
        if rupees >= 100000:
            lakhs = rupees // 100000
            result += convert_hundreds(lakhs) + ' Lakh '
            rupees %= 100000
        
        # Handle thousands
        if rupees >= 1000:
            thousands = rupees // 1000
            result += convert_hundreds(thousands) + ' Thousand '
            rupees %= 1000
        
        # Handle remaining hundreds, tens, and ones
        if rupees > 0:
            result += convert_hundreds(rupees) + ' '
        
        result += 'Rupees'
        
        # Handle paise
        if paise > 0:
            result += ' and ' + convert_hundreds(paise) + ' Paise'
    else:
        # Only paise
        if paise > 0:
            result = convert_hundreds(paise) + ' Paise'
    
    return result.strip() + ' Only'


def amount_to_words(amount):
    """
    Convert amount to Indian currency words
    
    Args:
        amount (float): Amount to convert (max 99999999.99)
    
    Returns:
        str: Amount in words
    """
    if amount < 0:
        return "Invalid Amount"
    
    if amount > 99999999.99:
        return "Amount too large"
    
    return number_to_words(amount)


# Test function
if __name__ == "__main__":
    # Test cases
    test_amounts = [0, 1, 15, 100, 1000, 12345, 123456, 1234567, 12345678, 123456.78]
    
    for amount in test_amounts:
        print(f"₹{amount:,.2f} -> {amount_to_words(amount)}")
