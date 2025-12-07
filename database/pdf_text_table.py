# database/pdf_text_table.py
from sqlalchemy import Table, Column, Integer, Text, JSON, MetaData
from database.db import engine, metadata

pdf_full_text = Table(
    "pdf_full_text",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("pdf_id", Integer, nullable=False),
    Column("full_text", Text),
    Column("text_fields", JSON),
)

metadata.create_all(engine)
