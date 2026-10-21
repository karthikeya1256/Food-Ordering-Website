
from flask import Blueprint, jsonify, request
from db import get_connection

menu_bp = Blueprint("menu", __name__)


@menu_bp.route("/api/menu", methods=["GET"])
def get_menu():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, name, description, price,
                       category, image_url, is_available
                FROM menu_items
                ORDER BY id;
            """)

            rows = cursor.fetchall()

        menu = []

        for row in rows:
            menu.append({
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "price": float(row[3]),
                "category": row[4],
                "image_url": row[5],
                "is_available": row[6]
            })

        return jsonify(menu), 200

    finally:
        connection.close()

@menu_bp.route("/api/menu", methods=["POST"])
def add_menu_item():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    price = data.get("price")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Valid name required"}), 400
    if isinstance(price, bool) or not isinstance(price, (int, float)) or price < 0:
        return jsonify({"error": "Valid non-negative price required"}), 400

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO menu_items
                    (name, description, price, category, image_url, is_available)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, name, price;
            """, (
                name.strip(), data.get("description"), price,
                data.get("category"), data.get("image_url"),
                data.get("is_available", True)
            ))
            row = cursor.fetchone()
        connection.commit()
        return jsonify({
            "id": row[0], "name": row[1], "price": float(row[2])
        }), 201
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@menu_bp.route("/api/menu/<int:item_id>", methods=["PUT"])
def update_menu_item(item_id):
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    price = data.get("price")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Valid name required"}), 400
    if isinstance(price, bool) or not isinstance(price, (int, float)) or price < 0:
        return jsonify({"error": "Valid non-negative price required"}), 400

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE menu_items SET name = %s, price = %s
                WHERE id = %s RETURNING id, name, price;
            """, (name.strip(), price, item_id))
            row = cursor.fetchone()

        if row is None:
            connection.rollback()
            return jsonify({"error": "Menu item not found"}), 404

        connection.commit()
        return jsonify({
            "id": row[0], "name": row[1], "price": float(row[2])
        }), 200
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@menu_bp.route("/api/menu/<int:item_id>", methods=["DELETE"])
def delete_menu_item(item_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM menu_items WHERE id = %s RETURNING id;",
                (item_id,)
            )
            row = cursor.fetchone()

        if row is None:
            connection.rollback()
            return jsonify({"error": "Menu item not found"}), 404

        connection.commit()
        return jsonify({
            "message": "Menu item deleted successfully", "id": row[0]
        }), 200
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
