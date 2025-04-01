from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI
from flask_cors import CORS
import os
import traceback
from dotenv import load_dotenv

# Load your environment variables (including OPENAI_API_KEY)
load_dotenv()

# Initialize OpenAI client (v1.x SDK style)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set up Flask app and enable CORS
app = Flask(__name__, static_folder='static')
CORS(app)

# Serve index.html from the static folder
@app.route("/")
def index():
    return send_from_directory('static', 'index.html')

# API route to handle quiz result
@app.route("/genre", methods=["POST"])
def get_art_genre():
    data = request.get_json()
    user_input = data.get("prompt", "")

    prompt = f"Based on this personality description, what genre of art would this person be best at and why?\n\n\"{user_input}\""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You're an art genre advisor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )
        genre = response.choices[0].message.content.strip()
        return jsonify({"genre": genre})
    except Exception as e:
        print("🔥 ERROR:", e)
        traceback.print_exc()  # Print full error in Render logs
        return jsonify({"error": str(e)}), 500

# Run the app on Render-compatible host/port
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
