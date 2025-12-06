# routes/data_route.py

from flask import Blueprint, jsonify
from database.db import engine, metadata, reflect_table
from sqlalchemy import Table, select, inspect, text
from database.pdf_text_table import pdf_full_text


data_bp = Blueprint("data", __name__)
text_bp = Blueprint("text", __name__)


# -----------------------------------------------------
# 1️⃣ RAW JSON DATA (kept for debugging)
# -----------------------------------------------------

@data_bp.route("/raw/data", methods=["GET"])
def get_all_raw():
    table = reflect_table("pdf_data")
    if not table:
        return jsonify({"error": "pdf_data table not found"}), 404

    with engine.connect() as conn:
        rows = conn.execute(table.select()).mappings().all()

    return jsonify([dict(r) for r in rows])


@data_bp.route("/raw/row/<int:row_id>", methods=["GET"])
def get_raw_row(row_id):
    table = reflect_table("pdf_data")
    if not table:
        return jsonify({"error": "pdf_data table not found"}), 404

    stmt = select(table).where(table.c.id == row_id)

    with engine.connect() as conn:
        row = conn.execute(stmt).mappings().first()

    if not row:
        return jsonify({"error": "Row not found"}), 404

    return jsonify(dict(row))


# -----------------------------------------------------
# 2️⃣ LIST ALL DYNAMIC TABLES
# -----------------------------------------------------

@data_bp.route("/tables", methods=["GET"])
def list_dynamic_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # Only return tables created from PDF extraction
    pdf_tables = [t for t in tables if t.startswith("pdf_")]

    return jsonify({"tables": pdf_tables})


# -----------------------------------------------------
# 3️⃣ FETCH DATA FROM A SPECIFIC TABLE
# -----------------------------------------------------

@data_bp.route("/table/<table_name>", methods=["GET"])
def get_table_data(table_name):
    metadata.reflect(bind=engine)

    if table_name not in metadata.tables:
        return jsonify({"error": "Table does not exist"}), 404

    tbl = metadata.tables[table_name]

    with engine.connect() as conn:
        rows = conn.execute(tbl.select()).mappings().all()

    return jsonify([dict(r) for r in rows])


# -----------------------------------------------------
# 4️⃣ ANALYTICS FOR A TABLE
# -----------------------------------------------------

@data_bp.route("/analytics/<table_name>", methods=["GET"])
def get_table_analytics(table_name):
    metadata.reflect(bind=engine)

    if table_name not in metadata.tables:
        return jsonify({"error": "Table does not exist"}), 404

    tbl = metadata.tables[table_name]

    stats = {}
    numeric_cols = []

    # detect numeric columns
    for col in tbl.columns:
        if col.name in ("id", "pdf_id"):
            continue
        numeric_cols.append(col.name)

    with engine.connect() as conn:
        for col in numeric_cols:
            q_minmax = text(f"""
                SELECT MIN(CAST("{col}" AS FLOAT)) AS min_val,
                       MAX(CAST("{col}" AS FLOAT)) AS max_val
                FROM "{table_name}";
            """)
            minmax = conn.execute(q_minmax).mappings().first()

            q_avg = text(f"""
                SELECT AVG(CAST("{col}" AS FLOAT)) AS avg_val
                FROM "{table_name}";
            """)
            avg = conn.execute(q_avg).mappings().first()

            stats[col] = {
                "min": minmax["min_val"],
                "max": minmax["max_val"],
                "avg": avg["avg_val"]
            }

    return jsonify({
        "table": table_name,
        "analytics": stats
    })
# Get text + KV fields for a PDF
@data_bp.route("/text/<int:pdf_id>", methods=["GET"])
def get_full_text(pdf_id):
    stmt = select(pdf_full_text).where(pdf_full_text.c.pdf_id == pdf_id)

    with engine.connect() as conn:
        row = conn.execute(stmt).mappings().first()

    if not row:
        return jsonify({"error": "No full text stored for this PDF"}), 404

    return jsonify({
        "pdf_id": pdf_id,
        "text": {
            "full_text": row["full_text"]
        }
    })


# Search text in all PDFs
@text_bp.route("/text/search/<keyword>", methods=["GET"])
def search_text(keyword):
    stmt = select(pdf_text)

    with engine.connect() as conn:
        rows = conn.execute(stmt).mappings().all()

    result = []
    keyword = keyword.lower()

    for r in rows:
        if keyword in (r["full_text"] or "").lower():
            result.append({"pdf_id": r["pdf_id"], "match": True})

    return jsonify(result)