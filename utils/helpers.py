import re
import unicodedata

def sanitize_column_name(name: str) -> str:
    """
    Converts any extracted key into a safe SQL column name.
    Example: "Total Assets (%)" → "total_assets"
    """
    if not name:
        return "unknown"

    name = str(name)
    name = unicodedata.normalize("NFKD", name)
    name = name.strip().lower()

    # Replace non-alphanumeric characters with underscores
    name = re.sub(r"[^\w]+", "_", name)
    name = re.sub(r"_+", "_", name)
    name = name.strip("_")

    # Columns cannot start with a number
    if name and name[0].isdigit():
        name = "col_" + name

    return name


def try_parse_number(value):
    """
    Converts numeric strings to int/float.
    Example: "1,234.50" → 1234.50
    """
    if value is None:
        return None

    text = str(value).replace(",", "").strip()

    # Remove currency symbols like ₹ $
    text = re.sub(r"[^\d.\-]", "", text)

    if text == "":
        return value

    try:
        if "." in text:
            return float(text)
        return int(text)
    except:
        return value
