import os

# Base directory of the project
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Folder where uploaded PDFs will be stored
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# Folder where extracted JSON files will be stored
JSON_FOLDER = os.path.join(BASE_DIR, "json_output")

# ⚠️ SQLite DB PATH no longer needed
# DB_PATH = os.path.join(BASE_DIR, "data.db")

# -----------------------------------------------
# ✅ PostgreSQL Configuration
# -----------------------------------------------

POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "2004"          # your chosen password
POSTGRES_HOST = "localhost"
POSTGRES_PORT = "5432"
POSTGRES_DB = "pdf_system"          # name for your new DB

SQLALCHEMY_DATABASE_URI = (
    f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)
