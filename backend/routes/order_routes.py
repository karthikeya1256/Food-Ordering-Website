
from flask import Blueprint, jsonify, request, current_app
from db import get_connection

order_bp = Blueprint("orders", __name__)


# Create an order
@order_bp.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object required"}), 400

    user_id = data.get("user_id")
    items = data.get("items")

    if (
        not isinstance(user_id, int)
        or isinstance(user_id, bool)
    ):
        return jsonify({"error": "Valid user_id is required"}), 400

    if not isinstance(items, list) or not items:
        return jsonify({"error": "At least one item is required"}), 400

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id FROM users
                WHERE id = %s AND role = 'customer';
            """, (user_id,))

            if cursor.fetchone() is None:
                return jsonify({"error": "Customer not found"}), 404

            total = 0
            order_items = []

            for item in items:
                if not isinstance(item, dict):
                    return jsonify({
                        "error": "Each item must be an object"
                    }), 400

                item_id = item.get("menu_item_id")
                quantity = item.get("quantity")

                if (
                    not isinstance(item_id, int)
                    or isinstance(item_id, bool)
                    or not isinstance(quantity, int)
                    or isinstance(quantity, bool)
                    or quantity <= 0
                ):
                    return jsonify({
                        "error": (
                            "Each item needs a valid menu_item_id "
                            "and positive integer quantity"
                        )
                    }), 400

                cursor.execute("""
                    SELECT id, price
                    FROM menu_items
                    WHERE id = %s AND is_available = TRUE;
                """, (item_id,))

                menu_item = cursor.fetchone()

                if menu_item is None:
                    return jsonify({
                        "error": (
                            f"Menu item {item_id} not found or unavailable"
                        )
                    }), 400

                price = menu_item[1]
                total += price * quantity
                order_items.append((menu_item[0], quantity, price))

            cursor.execute("""
                INSERT INTO orders (user_id, total_amount, status)
                VALUES (%s, %s, 'pending')
                RETURNING id, total_amount, status;
            """, (user_id, total))

            order = cursor.fetchone()
            order_id = order[0]

            for menu_item_id, quantity, price in order_items:
                cursor.execute("""
                    INSERT INTO order_items
                        (order_id, menu_item_id, quantity, price)
                    VALUES (%s, %s, %s, %s);
                """, (order_id, menu_item_id, quantity, price))

            cursor.execute("""
                INSERT INTO order_status_history (order_id, status)
                VALUES (%s, 'pending');
            """, (order_id,))

        connection.commit()

        return jsonify({
            "order_id": order_id,
            "user_id": user_id,
            "total_amount": float(order[1]),
            "status": order[2],
            "message": "Order created successfully"
        }), 201

    except Exception:
        connection.rollback()
        current_app.logger.exception("Failed to create order")
        return jsonify({"error": "Could not create order"}), 500

    finally:
        connection.close()


# Get all orders with their items
@order_bp.route("/api/orders", methods=["GET"])
def get_orders():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT o.id, u.name, o.total_amount, o.status,
                       o.created_at, oi.menu_item_id, m.name,
                       oi.quantity, oi.price
                FROM orders o
                JOIN users u ON u.id = o.user_id
                JOIN order_items oi ON oi.order_id = o.id
                JOIN menu_items m ON m.id = oi.menu_item_id
                ORDER BY o.created_at DESC, o.id;
            """)
            rows = cursor.fetchall()

        orders = {}

        for row in rows:
            order_id = row[0]

            if order_id not in orders:
                orders[order_id] = {
                    "order_id": order_id,
                    "customer_name": row[1],
                    "total_amount": float(row[2]),
                    "status": row[3],
                    "created_at": row[4].isoformat(),
                    "items": []
                }

            orders[order_id]["items"].append({
                "menu_item_id": row[5],
                "name": row[6],
                "quantity": row[7],
                "price": float(row[8])
            })

        return jsonify(list(orders.values())), 200

    finally:
        connection.close()


# Get orders for one customer
@order_bp.route("/api/customers/<int:user_id>/orders", methods=["GET"])
def get_customer_orders(user_id):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, total_amount, status, created_at
                FROM orders
                WHERE user_id = %s
                ORDER BY created_at DESC, id DESC;
            """, (user_id,))
            rows = cursor.fetchall()

        return jsonify([
            {
                "order_id": row[0],
                "total_amount": float(row[1]),
                "status": row[2],
                "created_at": row[3].isoformat()
            }
            for row in rows
        ]), 200

    finally:
        connection.close()


# Get orders requiring kitchen attention
@order_bp.route("/api/chef/orders", methods=["GET"])
def get_chef_orders():
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT o.id, u.name, o.total_amount, o.status,
                       o.created_at, m.name, oi.quantity
                FROM orders o
                JOIN users u ON u.id = o.user_id
                JOIN order_items oi ON oi.order_id = o.id
                JOIN menu_items m ON m.id = oi.menu_item_id
                WHERE o.status IN ('confirmed', 'preparing', 'ready')
                ORDER BY o.created_at ASC, o.id ASC;
            """)
            rows = cursor.fetchall()

        orders = {}

        for row in rows:
            order_id = row[0]

            if order_id not in orders:
                orders[order_id] = {
                    "order_id": order_id,
                    "customer_name": row[1],
                    "total_amount": float(row[2]),
                    "status": row[3],
                    "created_at": row[4].isoformat(),
                    "items": []
                }

            orders[order_id]["items"].append({
                "name": row[5],
                "quantity": row[6]
            })

        return jsonify(list(orders.values())), 200

    finally:
        connection.close()


# Update the kitchen order status
@order_bp.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object required"}), 400

    new_status = data.get("status")

    if new_status not in ["preparing", "ready", "completed"]:
        return jsonify({
            "error": "Status must be preparing, ready, or completed"
        }), 400

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT status FROM orders
                WHERE id = %s
                FOR UPDATE;
            """, (order_id,))

            order = cursor.fetchone()

            if order is None:
                return jsonify({"error": "Order not found"}), 404

            current_status = order[0]

            transitions = {
                "pending": ["preparing"],
                "confirmed": ["preparing"],
                "preparing": ["ready"],
                "ready": ["completed"]
            }

            if new_status not in transitions.get(current_status, []):
                return jsonify({
                    "error": (
                        f"Cannot change status from "
                        f"{current_status} to {new_status}"
                    )
                }), 400

            cursor.execute("""
                UPDATE orders SET status = %s
                WHERE id = %s;
            """, (new_status, order_id))

            cursor.execute("""
                INSERT INTO order_status_history (order_id, status)
                VALUES (%s, %s);
            """, (order_id, new_status))

        connection.commit()

        return jsonify({
            "order_id": order_id,
            "previous_status": current_status,
            "status": new_status,
            "message": "Order status updated successfully"
        }), 200

    except Exception:
        connection.rollback()
        current_app.logger.exception("Failed to update order status")
        return jsonify({"error": "Could not update order status"}), 500

    finally:
        connection.close()

