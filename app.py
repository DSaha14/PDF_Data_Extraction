import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import pdfplumber
import re

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Upload folder for temporary PDF storage
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Hugging Face NER pipeline
ner_pipeline = pipeline("ner", grouped_entities=True, model="dbmdz/bert-large-cased-finetuned-conll03-english")

# Function to extract phone numbers using regex
def extract_phone(text):
    phone_pattern = re.compile(r"\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}")
    matches = phone_pattern.findall(text)
    return matches[0] if matches else "N/A"

# Function to extract entities from text
def extract_entities(text):
    ner_results = ner_pipeline(text)
    extracted_data = {"name": "N/A", "phone": "N/A", "address": "N/A"}

    address_parts = []
    for entity in ner_results:
        if entity["entity_group"] == "PER":  # Person's Name
            extracted_data["name"] = entity["word"]
        elif entity["entity_group"] == "LOC":  # Address/Location
            address_parts.append(entity["word"])
    
    # Combine address parts into a single string
    if address_parts:
        extracted_data["address"] = " ".join(address_parts)

    # Use regex to extract phone number
    extracted_data["phone"] = extract_phone(text)

    return extracted_data

# Endpoint for uploading and processing PDF
@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "pdf" not in request.files:
        return jsonify({"error": "No PDF uploaded"}), 400

    file = request.files["pdf"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    try:
        # Save PDF
        file.save(file_path)

        # Extract text from the PDF
        with pdfplumber.open(file_path) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        # Log the raw text for debugging
        print(f"Extracted Text:\n{text}")

        # Extract entities
        extracted_data = extract_entities(text)

        # Clean up
        os.remove(file_path)

        return jsonify(extracted_data)

    except Exception as e:
        print(f"Error processing PDF: {e}")
        return jsonify({"error": "Failed to process PDF"}), 500

# Start Flask server
if __name__ == "__main__":
    app.run(port=5000, debug=True)
