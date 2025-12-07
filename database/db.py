# database/db.py

from sqlalchemy import (
    create_engine, MetaData, Table, Column,
    Integer, DateTime, Text
)
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import text
import datetime
from config import SQLALCHEMY_DATABASE_URI

# ----------------------------------
# DATABASE ENGINE + METADATA
# ----------------------------------
engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
metadata = MetaData()


# ----------------------------------
# INITIALIZE DATABASE TABLES
# ----------------------------------
def init_db():
    """
    Creates all required base tables:
      - pdf_data       : stores raw extracted JSON
      - pdf_flat       : base dynamic table for future schemas
      - pdf_full_text  : full text + text fields for each PDF
    """
    metadata.reflect(bind=engine)

    # ------------------------------
    # 1. RAW JSON STORAGE TABLE
    # ------------------------------
    if "pdf_data" not in metadata.tables:
        Table(
            "pdf_data",
            metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("uploaded_at", DateTime, default=datetime.datetime.utcnow),
            Column("tables", JSONB),       # Stores extracted tables JSON
            Column("text_fields", JSONB),
            Column("filename", Text)  # Stores extracted text fields JSON
        )

    # ------------------------------
    # 2. BASE DYNAMIC TABLE (optional)
    #    This is used by old dynamic schema logic.
    # ------------------------------
    if "pdf_flat" not in metadata.tables:
        Table(
            "pdf_flat",
            metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("pdf_id", Integer),
        )

    # ------------------------------
    # 3. PDF FULL TEXT TABLE
    # ------------------------------
    if "pdf_full_text" not in metadata.tables:
        Table(
            "pdf_full_text",
            metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("pdf_id", Integer, nullable=False),
            Column("full_text", Text),
            Column("text_fields", JSONB),
        )

    # Create all missing tables
    metadata.create_all(engine)
    metadata.reflect(bind=engine)


# ----------------------------------
# UTILITY HELPERS
# ----------------------------------
def reflect_table(name: str):
    """Return SQLAlchemy Table object if exists."""
    metadata.reflect(bind=engine)
    return metadata.tables.get(name)


def execute_raw(sql, params=None):
    """Execute raw SQL safely."""
    with engine.begin() as conn:
        if params:
            conn.execute(text(sql), params)
        else:
            conn.execute(text(sql))
