# routes/data_route.py
from flask import Blueprint, jsonify
from sqlalchemy import text
from database.db import engine, reflect_table
from database.pdf_text_table import pdf_full_text

data_bp = Blueprint("data", __name__)


@data_bp.route("/pdf_ids", methods=["GET"])
def list_pdf_ids():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, filename FROM pdf_data ORDER BY id")
        ).mappings().all()   # <-- IMPORTANT

    return jsonify([
        {"pdf_id": r["id"], "filename": r["filename"]}
        for r in rows
    ])


@data_bp.route("/pdf/<int:pdf_id>/tables", methods=["GET"])
def list_tables_for_pdf(pdf_id):
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT table_name FROM information_schema.tables")
        ).fetchall()

    pdf_tables = [
        r[0] for r in rows
        if r[0].startswith("pdf_table_") and r[0].endswith(f"_{pdf_id}")
    ]

    return jsonify({"pdf_id": pdf_id, "tables": pdf_tables})

@data_bp.route("/table/<table_name>", methods=["GET"])
def get_table_data(table_name):
    with engine.connect() as conn:
        query = text(f'SELECT * FROM "{table_name}" ORDER BY id')
        rows = conn.execute(query).mappings().all()

    return jsonify([dict(r) for r in rows])

@data_bp.route("/text/<int:pdf_id>", methods=["GET"])
def get_pdf_text(pdf_id):
    with engine.connect() as conn:
        row = conn.execute(
            pdf_full_text.select().where(pdf_full_text.c.pdf_id == pdf_id)
        ).mappings().first()

    if not row:
        return jsonify({"error": "No text found"}), 404

    return jsonify({"pdf_id": pdf_id, "full_text": row["full_text"]})
