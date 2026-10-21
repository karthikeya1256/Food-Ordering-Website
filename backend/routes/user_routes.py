
from flask import Blueprint, jsonify
from db import get_connection

user_bp = Blueprint("users", __name__)


@user_bp.route("/api/users", methods=["GET"])
def get_users():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, name, email, role
                FROM users
                ORDER BY id;
            """)
            rows = cursor.fetchall()

        users = [
            {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "role": row[3]
            }
            for row in rows
        ]

        return jsonify(users), 200

    finally:
        connection.close()


@user_bp.route("/api/role/<role>", methods=["GET"])
def select_role(role):
    if role not in ["customer", "admin", "chef"]:
        return jsonify({"error": "Invalid role"}), 400

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, name, role
                FROM users
                WHERE role = %s
                LIMIT 1;
            """, (role,))
            row = cursor.fetchone()

        if row is None:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": row[0],
            "name": row[1],
            "role": row[2]
        }), 200

    finally:
        connection.close()
