import os
from dotenv import load_dotenv
load_dotenv()
db_uri = os.getenv("SQLALCHEMY_DATABASE_URI")

# Base directory of the project
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Folder where uploaded PDFs will be stored
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# Folder where extracted JSON files will be stored
JSON_FOLDER = os.path.join(BASE_DIR, "json_output")
SQLALCHEMY_DATABASE_URI = db_uri

