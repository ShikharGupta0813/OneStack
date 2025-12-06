import os
import json
import camelot
import fitz  # PyMuPDF
from config import JSON_FOLDER
from utils.helpers import sanitize_column_name, try_parse_number

INVALID = {"", " ", "-", "unknown", "none", "null", "nan"}


# --------------------------
# Utility: invalid checks
# --------------------------
def is_invalid_value(v):
    if v is None:
        return True
    return str(v).strip().lower() in INVALID


def is_invalid_column_name(name):
    if name is None:
        return True
    return str(name).strip().lower() in INVALID


# --------------------------
# Clean table: row-wise -> column-wise and drop useless columns/tables
# --------------------------
def clean_table(table_rows):
    """
    Input: list of row dicts e.g. [{"a":1,"b":2}, {"a":3,"b":4}]
    Output: column-wise cleaned table OR None if table is useless
    """
    if not isinstance(table_rows, list) or not table_rows:
        return None

    # Row-wise -> Column-wise
    columns = {}
    for row in table_rows:
        if isinstance(row, dict):
            for k, v in row.items():
                columns.setdefault(k, []).append(v)

    cleaned = {}
    for col_name, values in columns.items():
        invalid_name = is_invalid_column_name(col_name)
        all_invalid_vals = all(is_invalid_value(v) for v in values)

        # remove columns that have invalid name AND all invalid values
        if invalid_name and all_invalid_vals:
            continue

        cleaned[col_name] = values

    # If nothing left, table is useless
    if not cleaned:
        return None

    return cleaned


# --------------------------
# Save JSON output
# --------------------------
def save_json(filename, data):
    os.makedirs(JSON_FOLDER, exist_ok=True)
    output_path = os.path.join(JSON_FOLDER, filename + ".json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return output_path


# --------------------------
# Extract tables using Camelot
# --------------------------
def extract_tables(path):
    try:
        # lattice first (good for bordered tables)
        tables = camelot.read_pdf(path, flavor="lattice", pages="all")
        if tables and len(tables) > 0:
            return [t.df for t in tables]

        # fallback to stream
        tables = camelot.read_pdf(path, flavor="stream", pages="all")
        if tables and len(tables) > 0:
            return [t.df for t in tables]

        return []
    except Exception as e:
        print("Camelot Error:", e)
        return []


# --------------------------
# Extract full text using PyMuPDF
# --------------------------
def extract_full_text(path):
    text = ""
    try:
        doc = fitz.open(path)
        for page in doc:
            text += page.get_text()
    except Exception as e:
        print("Text Extraction Error:", e)
    return text


# --------------------------
# Convert text -> key:value pairs
# --------------------------
def text_to_kv(text):
    """
    Extract short key: value pairs from raw text.
    Keeps lines with a ':' and short keys only.
    """
    data = {}

    if not text:
        return data

    for line in text.splitlines():
        line = line.strip()

        # ignore long paragraphs
        if len(line) > 160:
            continue

        if ":" not in line:
            continue

        parts = line.split(":", 1)
        key = parts[0].strip()
        value = parts[1].strip()

        if not key:
            continue

        # skip empty values
        if value == "":
            continue

        # sanitize key and parse numeric values
        key_s = sanitize_column_name(key)
        if len(key_s) == 0 or len(key_s) > 60:
            continue

        value_parsed = try_parse_number(value)
        data[key_s] = value_parsed

    return data


# --------------------------
# Convert Camelot DataFrames -> cleaned column-wise JSON
# --------------------------
def tables_to_full_json(dfs):
    tables_output = {}
    table_index = 1

    for df in dfs:
        # ensure df not empty
        try:
            df = df.fillna("")
        except Exception:
            continue

        # take first row as header
        try:
            headers = [sanitize_column_name(str(h).strip()) for h in df.iloc[0].tolist()]
        except Exception:
            continue

        if not headers or len(headers) == 0:
            continue

        rows = df.iloc[1:].values.tolist()
        row_dicts = []

        for row in rows:
            rd = {}
            for idx, cell in enumerate(row):
                # if header count mismatches row length, skip extra cells
                if idx >= len(headers):
                    continue
                header = headers[idx]
                value = try_parse_number(str(cell).strip())
                rd[header] = value
            # only include non-empty rows (optional)
            row_dicts.append(rd)

        # Clean unknown/useless tables
        cleaned = clean_table(row_dicts)
        if cleaned is None:
            print(f"[SKIP] table_{table_index}: unknown/useless table removed")
        else:
            tables_output[f"table_{table_index}"] = cleaned

        table_index += 1

    return tables_output


# --------------------------
# Master extractor
# --------------------------
def extract_pdf_to_json(path):
    filename = os.path.splitext(os.path.basename(path))[0]

    # 1) tables
    dfs = extract_tables(path)
    tables_json = tables_to_full_json(dfs) if dfs else {}

    # 2) full text
    full_text = extract_full_text(path)

    # 3) key-value text fields
    text_json = text_to_kv(full_text)

    final_data = {
        "tables": tables_json,
        "text_fields": text_json,
        "full_text": full_text
    }

    # save preview
    save_json(filename, final_data)
    return final_data
