# dynamic_tables.py
from sqlalchemy import Table, Column, Integer, String, MetaData, text
from database.db import engine, metadata
import re

INVALID = {"unknown", "", "none", "null", "nan", "-", "--", "n/a"}

def _safe_name(name: str):
    if name is None:
        return None

    name = str(name).strip().lower()
    name = re.sub(r"[^a-z0-9_]", "_", name)
    name = re.sub(r"_+", "_", name)

    if name == "" or name in INVALID:
        return None  # <---- DO NOT RETURN 'unknown'

    return name



def clean_table_columns(table_dict):
    cleaned = {}

    for col, values in table_dict.items():
        safe_col = _safe_name(col)

        if safe_col is None:
            continue  # drop invalid column names

        if not isinstance(values, list):
            values = [values]

        cleaned[safe_col] = values

    return cleaned



def is_table_unknown(table_dict):
    values = []

    for _, v in table_dict.items():
        if not isinstance(v, list):
            v = [v]
        values.extend(v)

    cleaned = [str(x).strip().lower() for x in values]
    return all(x in INVALID for x in cleaned)


def create_or_update_table(table_name, column_names):
    """
    table_name format = pdf_table_1_2 (table 1 of pdf 2)
    """
    safe_table = _safe_name(f"pdf_{table_name}")

    metadata.reflect(bind=engine)

    if safe_table not in metadata.tables:
        cols = [
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("pdf_id", Integer)
        ]

        for col in column_names:
            col = _safe_name(col)
            if col != "unknown":
                cols.append(Column(col, String))

        Table(safe_table, metadata, *cols)
        metadata.create_all(engine)
        print(f"[TABLE CREATED] {safe_table}")

    else:
        tbl = metadata.tables[safe_table]
        existing = tbl.columns.keys()

        with engine.begin() as conn:
            for col in column_names:
                safe = _safe_name(col)
                if safe not in existing and safe != "unknown":
                    conn.execute(text(f'ALTER TABLE "{safe_table}" ADD COLUMN "{safe}" TEXT'))
                    print(f"[COLUMN ADDED] {safe} → {safe_table}")


def insert_table_data(pdf_id, table_name, table_dict):
    safe_table = _safe_name(f"pdf_{table_name}")
    tbl = metadata.tables[safe_table]

    cleaned = clean_table_columns(table_dict)
    columns = list(cleaned.keys())

    max_len = max(len(v) for v in cleaned.values())
    rows = []

    for i in range(max_len):
        row = {}
        for col in columns:
            values = cleaned[col]
            row[col] = values[i] if i < len(values) else None
        rows.append(row)

    with engine.begin() as conn:
        for row in rows:
            data = {"pdf_id": pdf_id}
            data.update(row)
            conn.execute(tbl.insert().values(**data))

    print(f"[INSERTED] {len(rows)} rows → {safe_table}")
