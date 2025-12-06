# database/db.py
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, DateTime, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
import datetime
from config import SQLALCHEMY_DATABASE_URI

engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
metadata = MetaData()

def init_db():
    """
    Create base tables if not exists:
      - pdf_data : stores raw JSON (tables + text_fields)
      - pdf_flat : dynamic table where JSON keys become columns
    """
    metadata.reflect(bind=engine)

    if "pdf_data" not in metadata.tables:
        Table(
            "pdf_data",
            metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("uploaded_at", DateTime, default=datetime.datetime.utcnow),
            Column("tables", JSONB),
            Column("text_fields", JSONB),
        )

    # pdf_flat will be created as a flexible normalized table.
    # start with an id and reference to pdf_data
    if "pdf_flat" not in metadata.tables:
        Table(
            "pdf_flat",
            metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("pdf_id", Integer),  # references pdf_data(id) optionally
        )

    metadata.create_all(engine)
    # reflect again to refresh metadata cache
    metadata.reflect(bind=engine)

def reflect_table(name):
    metadata.reflect(bind=engine)
    return metadata.tables.get(name)

def execute_raw(sql, params=None):
    with engine.begin() as conn:
        if params:
            conn.execute(text(sql), params)
        else:
            conn.execute(text(sql))
