from flask import Blueprint, request, jsonify
import os
import time
from werkzeug.utils import secure_filename
from sqlalchemy import text

from config import UPLOAD_FOLDER
from services.pdf_extractor import extract_pdf_to_json

from database.db import engine, metadata, reflect_table, init_db
from database.pdf_text_table import pdf_full_text

from dynamic_tables import (
    is_table_unknown,
    clean_table_columns,
    create_or_update_table,
    insert_table_data
)

upload_bp = Blueprint("upload", __name__)
ALLOWED_EXTENSIONS = {"pdf"}

init_db()


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route("/upload", methods=["POST"])
def upload_pdf():

    # ------------------------------
    # 1. Validate file
    # ------------------------------
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF allowed"}), 400

    # ------------------------------
    # 2. Save file
    # ------------------------------
    filename = f"{int(time.time())}_{secure_filename(file.filename)}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(filepath)

    # ------------------------------
    # 3. Extract PDF → JSON
    # ------------------------------
    extracted = extract_pdf_to_json(filepath)

    tables_json = extracted.get("tables", {})
    text_fields_json = extracted.get("text_fields", {})
    full_text = extracted.get("full_text", "")

    # ------------------------------
    # 4. Insert raw JSON into pdf_data
    # ------------------------------
    metadata.reflect(bind=engine)
    pdf_table = reflect_table("pdf_data")

    with engine.begin() as conn:
        res = conn.execute(
            pdf_table.insert().values(
                tables=tables_json,
                text_fields=text_fields_json
            )
        )
        pdf_id = res.inserted_primary_key[0]

    # ------------------------------
    # 5. Insert FULL TEXT (one-time only)
    # ------------------------------
    with engine.begin() as conn:
        conn.execute(
            pdf_full_text.insert().values(
                pdf_id=pdf_id,
                full_text=full_text,
                text_fields=text_fields_json
            )
        )

    # ------------------------------
    # 6. Create dynamic tables & insert rows
    # ------------------------------
    tables_created = []

    for table_name, table_dict in tables_json.items():

        if not isinstance(table_dict, dict):
            continue

        cleaned = clean_table_columns(table_dict)
        if not cleaned:
            continue

        if is_table_unknown(cleaned):
            continue

        dynamic_table_name = f"{table_name}_{pdf_id}"
        create_or_update_table(dynamic_table_name, cleaned.keys())
        insert_table_data(pdf_id, dynamic_table_name, cleaned)
        tables_created.append(dynamic_table_name)

    # Process text_fields as table
    if isinstance(text_fields_json, dict) and text_fields_json:
        tf_cols = {k: [v] for k, v in text_fields_json.items()}
        cleaned_tf = clean_table_columns(tf_cols)

        if cleaned_tf and not is_table_unknown(cleaned_tf):
            create_or_update_table("text_fields", cleaned_tf.keys())
            insert_table_data(pdf_id, "text_fields", cleaned_tf)
            tables_created.append("text_fields")

    # ------------------------------
    # 7. Fetch ALL tables (row-wise) for frontend
    # ------------------------------
    all_tables_json = {}

    with engine.connect() as conn:
        for tname in tables_created:
            dbname = f"pdf_{tname}"
            query = text(f"SELECT * FROM {dbname} WHERE pdf_id = :pid")
            rows = conn.execute(query, {"pid": pdf_id}).fetchall()

            # Convert each row into dict (remove id, pdf_id)
            cleaned_rows = []
            for r in rows:
                row_dict = dict(r._mapping)
                row_dict.pop("id", None)
                row_dict.pop("pdf_id", None)
                cleaned_rows.append(row_dict)

            all_tables_json[tname] = cleaned_rows

    # ------------------------------
    # 8. Return final frontend-ready JSON
    # ------------------------------
    return jsonify({
        "message": "PDF processed successfully",
        "pdf_id": pdf_id,
        "tables": all_tables_json,
        "text_fields": text_fields_json,
        "full_text": full_text
    })
