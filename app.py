from flask import Flask, jsonify
from flask_cors import CORS

from routes.upload_route import upload_bp
from routes.data_route import data_bp
from database.db import init_db

def create_app():
    app = Flask(__name__)

    CORS(app,
     resources={r"/api/*": {"origins": [
         "http://localhost:5173",
         "http://127.0.0.1:5173",
         "https://onestack-vtnx.onrender.com"
     ]}},
     supports_credentials=True)


    # Blueprints
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(data_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return jsonify({"message": "InsightDocs PDF Extraction API Running"})

    # Initialize DB
    init_db()

    return app

app = create_app()
