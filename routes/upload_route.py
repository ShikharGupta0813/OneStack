# routes/upload_route.py
from flask import Blueprint, request, jsonify
import os, time
from werkzeug.utils import secure_filename

from config import UPLOAD_FOLDER
from services.pdf_extractor import extract_pdf_to_json
from database.db import engine, reflect_table, init_db
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
    return filename.lower().endswith(".pdf")


@upload_bp.route("/upload", methods=["POST"])
def upload_pdf():
    # ------------------- VALIDATE FILE --------------------
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files allowed"}), 400

    # ------------------- SAVE FILE ------------------------
    filename = f"{int(time.time())}_{secure_filename(file.filename)}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(filepath)

    # ------------------- EXTRACT PDF -----------------------
    extracted = extract_pdf_to_json(filepath)
    tables_json = extracted["tables"]
    text_fields_json = extracted["text_fields"]
    full_text = extracted["full_text"]

    # ------------------- INSERT INTO pdf_data --------------
    pdf_data = reflect_table("pdf_data")

    with engine.begin() as conn:
        res = conn.execute(
            pdf_data.insert().values(
                tables=tables_json,
                text_fields=text_fields_json
            )
        )
        pdf_id = res.inserted_primary_key[0]

    # ------------------- INSERT INTO pdf_full_text ----------
    with engine.begin() as conn:
        conn.execute(
            pdf_full_text.insert().values(
                pdf_id=pdf_id,
                full_text=full_text,
                text_fields=text_fields_json
            )
        )

    # ------------------- CREATE DYNAMIC TABLES --------------
    created_tables = []

    for table_key, table_dict in tables_json.items():

        cleaned = clean_table_columns(table_dict)
        if not cleaned or is_table_unknown(cleaned):
            continue

        # Extract number from "table_3" → 3
        table_num = table_key.split("_")[1]

        sql_table_name = f"table_{table_num}_{pdf_id}"  # STAYS consistent

        create_or_update_table(sql_table_name, cleaned.keys())
        insert_table_data(pdf_id, sql_table_name, cleaned)

        created_tables.append(f"pdf_{sql_table_name}")

    # ------------------- FINAL RESPONSE ---------------------
    return jsonify({
        "message": "PDF processed successfully",
        "pdf_id": pdf_id,
        "created_tables": created_tables
    })
