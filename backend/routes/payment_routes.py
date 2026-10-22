
from flask import Blueprint, jsonify, request, current_app
from db import get_connection

payment_bp = Blueprint("payments", __name__)


@payment_bp.route(
    "/api/orders/<int:order_id>/payment",
    methods=["POST"]
)
def simulate_payment(order_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "JSON object required"}), 400

    outcome = data.get("outcome")

    if outcome not in ["success", "failed"]:
        return jsonify({
            "error": "Outcome must be success or failed"
        }), 400

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT total_amount, status
                FROM orders
                WHERE id = %s
                FOR UPDATE;
            """, (order_id,))

            order = cursor.fetchone()

            if order is None:
                return jsonify({"error": "Order not found"}), 404

            total_amount, order_status = order

            if order_status != "pending":
                return jsonify({
                    "error": "Payment is allowed only for pending orders"
                }), 400

            cursor.execute("""
                SELECT id, status
                FROM payments
                WHERE order_id = %s
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE;
            """, (order_id,))

            existing_payment = cursor.fetchone()

            if existing_payment and existing_payment[1] == "success":
                return jsonify({
                    "error": "Order has already been paid"
                }), 400

            if existing_payment:
                cursor.execute("""
                    UPDATE payments
                    SET status = %s
                    WHERE id = %s
                    RETURNING id;
                """, (outcome, existing_payment[0]))
                payment_id = cursor.fetchone()[0]
            else:
                cursor.execute("""
                    INSERT INTO payments
                        (order_id, amount, status, payment_method)
                    VALUES (%s, %s, %s, 'simulated')
                    RETURNING id;
                """, (order_id, total_amount, outcome))
                payment_id = cursor.fetchone()[0]

            if outcome == "success":
                cursor.execute("""
                    UPDATE orders
                    SET status = 'confirmed'
                    WHERE id = %s;
                """, (order_id,))

                cursor.execute("""
                    INSERT INTO order_status_history (order_id, status)
                    VALUES (%s, 'confirmed');
                """, (order_id,))

        connection.commit()

        return jsonify({
            "payment_id": payment_id,
            "order_id": order_id,
            "amount": float(total_amount),
            "payment_status": outcome,
            "order_status": (
                "confirmed" if outcome == "success" else "pending"
            ),
            "message": "Simulated payment processed"
        }), 200

    except Exception:
        connection.rollback()
        current_app.logger.exception("Failed to process payment")
        return jsonify({
            "error": "Could not process simulated payment"
        }), 500

    finally:
        connection.close()
