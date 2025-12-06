from sqlalchemy import Table, Column, Integer, String, MetaData, text
from database.db import engine, metadata
import re

# --------------------------- #
#   CLEANING HELPERS
# --------------------------- #

INVALID = {"unknown", "", "none", "null", "nan", "-", "--", "n/a"}


def _safe_name(name: str):
    """Convert dictionary keys into safe SQL column names."""
    if name is None:
        return "unknown"

    name = str(name).strip().lower()
    name = re.sub(r"[^a-z0-9_]", "_", name)
    name = re.sub(r"_+", "_", name)

    if name == "" or name in INVALID:
        return "unknown"

    return name


def is_invalid_value(value):
    """Check if a value is empty / meaningless."""
    if value is None:
        return True
    return str(value).strip().lower() in INVALID


def clean_table_columns(table_dict):
    """
    Remove columns where:
    1) Column name is invalid (unknown)
    2) All values inside are invalid
    """
    cleaned = {}

    for col, values in table_dict.items():
        safe_col = _safe_name(col)

        # Ensure list format
        if not isinstance(values, list):
            values = [values]

        # Check all invalid
        if safe_col == "unknown" and all(is_invalid_value(v) for v in values):
            continue  # remove column

        cleaned[safe_col] = values

    return cleaned


def is_table_unknown(table_dict):
    """If ALL values in ALL columns are invalid → table is useless."""
    values = []

    for col, col_values in table_dict.items():
        if not isinstance(col_values, list):
            col_values = [col_values]

        values.extend(col_values)

    cleaned = [str(v).strip().lower() for v in values]
    return all(v in INVALID for v in cleaned)


# --------------------------- #
#   TABLE CREATION / UPDATE
# --------------------------- #

def create_or_update_table(table_name, column_names):
    """
    Create a new table or add missing columns for a PDF table.
    column_names: cleaned + safe column list
    """
    safe_table = _safe_name(f"pdf_{table_name}")

    metadata.reflect(bind=engine)

    if safe_table not in metadata.tables:
        # ---- CREATE TABLE ----
        cols = [
            Column("id", Integer, primary_key=True),
            Column("pdf_id", Integer)
        ]

        for col in column_names:
            safe_col = _safe_name(col)
            if safe_col != "unknown":
                cols.append(Column(safe_col, String))

        Table(safe_table, metadata, *cols)
        metadata.create_all(engine)
        print(f"[TABLE CREATED] {safe_table}")

    else:
        # ---- UPDATE TABLE (ADD COLUMNS) ----
        tbl = metadata.tables[safe_table]
        existing = set(tbl.columns.keys())

        with engine.begin() as conn:
            for col in column_names:
                safe_col = _safe_name(col)
                if safe_col not in existing and safe_col != "unknown":
                    conn.execute(
                        text(f'ALTER TABLE "{safe_table}" ADD COLUMN "{safe_col}" TEXT')
                    )
                    print(f"[COLUMN ADDED] {safe_col} → {safe_table}")


# --------------------------- #
#   INSERT DATA
# --------------------------- #

def insert_table_data(pdf_id, table_name, table_dict):
    """
    Insert CLEANED table data into the database.
    table_dict: column-wise dictionary
    """
    safe_table = _safe_name(f"pdf_{table_name}")
    tbl = metadata.tables[safe_table]

    cleaned = clean_table_columns(table_dict)
    columns = list(cleaned.keys())

    # convert column-wise → row-wise
    max_len = max(len(v) for v in cleaned.values())
    rows = []

    for i in range(max_len):
        row = {}
        for col in columns:
            values = cleaned[col]
            row[col] = values[i] if i < len(values) else None
        rows.append(row)

    # Insert rows
    with engine.begin() as conn:
        for row in rows:
            data = {"pdf_id": pdf_id}
            data.update(row)
            conn.execute(tbl.insert().values(**data))

    print(f"[INSERTED] {len(rows)} rows → {safe_table}")
