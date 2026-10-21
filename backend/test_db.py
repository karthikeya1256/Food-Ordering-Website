
from db import get_connection

try:
    connection = get_connection()
    print("PostgreSQL connection successful!")

    cursor = connection.cursor()
    cursor.execute("SELECT current_database(), version()")

    result = cursor.fetchone()
    print("Database:", result[0])
    print("Server:", result[1])

    cursor.close()
    connection.close()

except Exception as error:
    print("Connection failed:", error)
