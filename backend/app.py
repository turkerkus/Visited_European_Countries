from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/eu_db")
client = MongoClient(mongo_uri)
db = client.eu_db

@app.route('/backend/addCountry', methods=['POST'])
def add_country():
    data = request.get_json()
    country_name = data.get('country')
    if country_name:
        db.countries.insert_one({'name': country_name})
        return jsonify({"message": f"Added {country_name}"}), 201
    return jsonify({"error": "Country name not provided"}), 400

@app.route('/backend/removeCountry', methods=['POST'])
def remove_country():
    data = request.get_json()
    country_name = data.get('country')
    if country_name:
        result = db.countries.delete_one({'name': country_name})
        if result.deleted_count:
            return jsonify({"message": f"Removed {country_name}"}), 200
        else:
            return jsonify({"error": "Country not found"}), 404
    return jsonify({"error": "Country name not provided"}), 400

@app.route('/backend/getCountries', methods=['GET'])
def get_countries():
    countries = list(db.countries.find({}, {'_id': 0, 'name': 1}))  # Exclude _id field
    return jsonify({"countries": countries})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
