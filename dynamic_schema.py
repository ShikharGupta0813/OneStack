# dynamic_schema.py
import re
from sqlalchemy import text
from database.db import engine, metadata, reflect_table, execute_raw
from sqlalchemy.sql import insert
from sqlalchemy import Table, select
from datetime import datetime

_identifier_re = re.compile(r'[^0-9a-zA-Z_]')

def _safe_colname(key: str) -> str:
    """
    Convert arbitrary JSON key to safe SQL column name.
    Lowercase, replace invalid chars with underscore, trim leading digits.
    """
    col = _identifier_re.sub('_', key.strip().lower())
    # avoid starting with digit
    if col and col[0].isdigit():
        col = '_' + col
    # keep length reasonable
    return col[:63]

def infer_sql_type(value):
    """Simple type inference: integer, float, boolean, timestamp, text"""
    if value is None:
        return "TEXT"
    if isinstance(value, bool):
        return "BOOLEAN"
    if isinstance(value, int) and not isinstance(value, bool):
        return "INTEGER"
    if isinstance(value, float):
        return "DOUBLE PRECISION"
    # attempt to parse datetime string
    if isinstance(value, str):
        # naive datetime detection (ISO-like)
        try:
            # try common formats
            datetime.fromisoformat(value)
            return "TIMESTAMP"
        except Exception:
            pass
    # fallback
    return "TEXT"

def flatten_json(obj, prefix=''):
    """
    Flatten nested JSON into a single-level dict.
    Keys become prefix_key for nested objects.
    Arrays are converted to JSON string (you may choose differently).
    """
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_key = f"{prefix}{k}" if prefix == '' else f"{prefix}_{k}"
            if isinstance(v, dict):
                out.update(flatten_json(v, new_key))
            elif isinstance(v, list):
                # For lists, convert each element if primitive else stringify
                # join primitives or store JSON string
                items = []
                for i, item in enumerate(v):
                    if isinstance(item, (str, int, float, bool, type(None))):
                        items.append(str(item))
                    elif isinstance(item, dict):
                        # flatten each dict element with index
                        out.update(flatten_json(item, f"{new_key}_{i}"))
                    else:
                        items.append(str(item))
                if items:
                    out[new_key] = ','.join(items)
            else:
                out[new_key] = v
    else:
        # if it's a primitive, put it under prefix
        out[prefix or 'value'] = obj
    return out

def ensure_columns_for_keys(keys_map):
    """
    Ensure pdf_flat table has columns for every key in keys_map.
    keys_map: dict mapping safe_colname -> sample_value (for type inference)
    """
    table_name = "pdf_flat"
    metadata.reflect(bind=engine)
    tbl = reflect_table(table_name)
    existing_cols = set(tbl.columns.keys()) if tbl is not None else set()

    to_add = []
    for safe_col, sample_val in keys_map.items():
        if safe_col not in existing_cols:
            col_type = infer_sql_type(sample_val)
            to_add.append((safe_col, col_type))
    print("Adding columns:", to_add)
        

    # Add columns
    for col_name, col_type in to_add:
        # Use IF NOT EXISTS (Postgres 9.6+). Sanitize names by quoting.
        sql = f'ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS "{col_name}" {col_type};'
        execute_raw(sql)

    if to_add:
        # refresh metadata
        metadata.reflect(bind=engine)

def insert_flat_row(pdf_id, flattened_map):
    """
    Insert a row into pdf_flat. Assumes ensure_columns_for_keys has run.
    All keys should be safe column names.
    """
    table_name = "pdf_flat"
    metadata.reflect(bind=engine)
    tbl = reflect_table(table_name)
    if tbl is None:
        raise RuntimeError("pdf_flat table missing. Call init_db() first.")

    # Build insert dict with pdf_id and the flattened keys
    insert_dict = {"pdf_id": pdf_id}
    for k, v in flattened_map.items():
        insert_dict[k] = v

    # Use SQLAlchemy core insert
    with engine.begin() as conn:
        conn.execute(tbl.insert().values(**insert_dict))
