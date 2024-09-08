from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/eu_db")  # Use env variable or default MongoDB URI
client = MongoClient(mongo_uri)
db = client.eu_db  # Access the 'eu_db' database

# Adds a clicked country to the database
@app.route('/backend/addCountry', methods=['POST'])
def add_country():
    """
    Endpoint to add a country to the database.
    Expects a JSON payload with a 'country' field containing the country name.
    Example payload: { "country": "France" }
    Returns:
      - A success message with the country name if added successfully.
      - An error message if the 'country' field is not provided.
    """
    data = request.get_json()
    country_name = data.get('country')
    if country_name:
        db.countries.insert_one({'name': country_name})  # Insert country name into 'countries' collection
        return jsonify({"message": f"Added {country_name}"}), 201
    return jsonify({"error": "Country name not provided"}), 400

# Removes a clicked country from the database
@app.route('/backend/removeCountry', methods=['POST'])
def remove_country():
    """
    Endpoint to remove a country from the database.
    Expects a JSON payload with a 'country' field containing the country name.
    Example payload: { "country": "Germany" }
    Returns:
      - A success message if the country was removed.
      - An error message if the country was not found or if the 'country' field is missing.
    """
    data = request.get_json()
    country_name = data.get('country')
    if country_name:
        result = db.countries.delete_one({'name': country_name})  # Delete the country from the 'countries' collection
        if result.deleted_count:
            return jsonify({"message": f"Removed {country_name}"}), 200
        else:
            return jsonify({"error": "Country not found"}), 404
    return jsonify({"error": "Country name not provided"}), 400

# Resets the entire collection
@app.route('/backend/clearList', methods=['POST'])
def clear_collection():
    """
    Endpoint to clear the countries collection in the database.
    Returns:
      - A success message after clearing the collection.
    """
    db.countries.delete_many({})  # Clear all documents in the 'countries' collection
    return jsonify({"message": "All countries removed"}), 200


# Retrieves the list of countries from the database
@app.route('/backend/getCountries', methods=['GET'])
def get_countries():
    """
    Endpoint to retrieve all countries from the database.
    Returns a JSON object containing a list of country names.
    Example response:
    {
      "countries": [
        { "name": "France" },
        { "name": "Germany" }
      ]
    }
    """
    countries = list(db.countries.find({}, {'_id': 0, 'name': 1}))  # Retrieve all country names, exclude '_id' field
    return jsonify({"countries": countries})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Start the Flask app on port 5000
