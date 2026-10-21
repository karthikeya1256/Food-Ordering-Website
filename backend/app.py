
from flask import Flask, jsonify
from flask_cors import CORS

from routes.menu_routes import menu_bp
from routes.user_routes import user_bp
from routes.order_routes import order_bp
from routes.payment_routes import payment_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(menu_bp)
app.register_blueprint(user_bp)
app.register_blueprint(order_bp)
app.register_blueprint(payment_bp)


@app.route("/")
def home():
    return jsonify({
        "message": "Food Ordering Backend is running!"
    })


if __name__ == "__main__":
    app.run(debug=True)
