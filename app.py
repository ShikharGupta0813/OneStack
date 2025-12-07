from flask import Flask, jsonify
from flask_cors import CORS

from routes.upload_route import upload_bp
from routes.data_route import data_bp
from database.db import init_db


def create_app():
    app = Flask(__name__)

    # Enable CORS for frontend (React)
    # CORS(app, resources={r"/*": {"origins": "*"}})
    
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Register blueprints with URL prefixes
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(data_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return jsonify({"message": "InsightDocs PDF Extraction API Running"})

    # Initialize database
    init_db()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
