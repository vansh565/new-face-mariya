from flask import Flask, request, jsonify
import cv2
import google.generativeai as genai
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from flask_cors import CORS

from datetime import datetime

app = Flask(__name__)
CORS(app)#cross origin resourse sharing    .....Enable CORS to allow requests from frontend
genai.configure(api_key="AIzaSyD2eKhcIIS33G7uuvjA3VkI93bun_aELvQ")
@app.route('/gemini', methods=['POST'])
def generate_response():
    try:
        # Get JSON data from request body
        data = request.get_json()
        prompt = data.get("prompt", "")
        print (prompt)

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # Generate AI response using Gemini API
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("answer in 2 lines."+prompt)
        print (response)

        # Extract response text
        ai_response = response.text if response.text else "No response generated."

        return jsonify({"text": ai_response})

    except Exception as e:
        return jsonify({"error":str(e)}), 500




# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read('trainer/trainer.yml')
faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

names = {1: "Vansh", 2: "Alice", 3: "Bob"}

@app.route("/recognize", methods=["POST"])
def recognize():
    try:
        # Get image from request
        data = request.json["image"]
        image_data = base64.b64decode(data.split(",")[1])  # Remove Base64 prefix
        image = Image.open(BytesIO(image_data))

        # Convert to OpenCV format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        # Detect faces
        faces = faceCascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=7, minSize=(30,30))

        faces = faceCascade.detectMultiScale(gray, 1.2, 5)
        for (x, y, w, h) in faces:
            id, confidence = recognizer.predict(gray[y:y+h, x:x+w])
            confidence_text = round(100 - confidence)
            name = names.get(id, "Unknown")

         
        
            return jsonify({"id": id, "name": name, "confidence": confidence_text})

        return jsonify({"name": "No face detected"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug=True)