from flask import Flask, jsonify
from flask_cors import CORS   # <-- ADD THIS
from routes.upload_route import upload_bp
from routes.data_route import data_bp
from database.db import init_db

def create_app():
    app = Flask(__name__)

    # ENABLE CORS FOR REACT FRONTEND
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(upload_bp)
    app.register_blueprint(data_bp)

    @app.route("/")
    def home():
        return jsonify({"message": "InsightDocs PDF Extraction API Running"})

    init_db()
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
