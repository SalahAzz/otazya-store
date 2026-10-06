import re
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from config import Config
from database import get_db, init_db

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, static_folder=None)
app.config.from_object(Config)

# Initialize database schema
init_db()

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/<path:filename>")
def static_files(filename):
    target = BASE_DIR / filename
    if target.is_file():
        return send_from_directory(BASE_DIR, filename)
    return jsonify({"error": "File not found"}), 404

@app.route("/api/reviews", methods=["GET", "POST"])
def handle_reviews():
    if request.method == "GET":
        with get_db() as conn:
            rows = conn.execute(
                "SELECT id, name, email, review, rating, created_at FROM reviews ORDER BY id DESC LIMIT 100"
            ).fetchall()
            reviews = [dict(row) for row in rows]
        return jsonify({"reviews": reviews}), 200

    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    review_text = str(data.get("text", "")).strip()
    rating = data.get("rating")

    try:
        rating = int(rating)
    except (TypeError, ValueError):
        rating = 0

    if len(name) < 2 or len(name) > 80:
        return jsonify({"error": "الاسم مطلوب ويجب أن يكون بين حرفين و80 حرفًا."}), 422
    if len(email) > 254 or not EMAIL_REGEX.match(email):
        return jsonify({"error": "يرجى إدخال بريد إلكتروني صحيح."}), 422
    if len(review_text) < 3 or len(review_text) > 2000:
        return jsonify({"error": "التقييم مطلوب ويجب أن يكون بين 3 و2000 حرف."}), 422
    if rating < 1 or rating > 5:
        return jsonify({"error": "اختاري تقييمًا من نجمة إلى خمس نجوم."}), 422

    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO reviews (name, email, review, rating) VALUES (?, ?, ?, ?)",
            (name, email, review_text, rating),
        )
        conn.commit()
        review_id = cursor.lastrowid

    return jsonify({
        "review": {
            "id": review_id,
            "name": name,
            "email": email,
            "review": review_text,
            "rating": rating
        }
    }), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=app.config["DEBUG"])
