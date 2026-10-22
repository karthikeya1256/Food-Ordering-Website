\# OfficeBite — Food Ordering \& Kitchen Management System



OfficeBite is a prototype food ordering and kitchen management web application. It allows customers to browse available food items, place orders, complete simulated payments, and lets kitchen staff view orders and update their preparation status.



\## Features



\### Customer

\- Browse available food items loaded from PostgreSQL.

\- Add items to the cart and manage quantities.

\- Place food orders.

\- Complete a simulated payment.

\- View order status through the application.



\### Chef

\- Access a separate Chef Dashboard.

\- View customer orders.

\- Update order preparation status.

\- Track orders through the kitchen workflow.



\### Application

\- Separate Customer and Chef pages.

\- React frontend connected to a Flask REST API.

\- PostgreSQL database for menu and order data.

\- Responsive food ordering interface with a hero background image.



\## Technology Stack



| Component | Technology |

|---|---|

| Frontend | React, Vite, JavaScript, CSS |

| Backend | Python, Flask |

| Database | PostgreSQL |

| API communication | HTTP / JSON |

| Payment | Simulated demo payment |



\## Project Structure



```text

OfficeBite-Git/

├── public/

│   └── hero-food.jpg

├── src/

│   ├── App.jsx

│   └── index.css

├── backend/

│   ├── app.py

│   ├── db.py

│   ├── requirements.txt

│   └── routes/

│       ├── menu\_routes.py

│       ├── order\_routes.py

│       ├── payment\_routes.py

│       └── user\_routes.py

├── package.json

├── package-lock.json

└── README.md

```



\## Prerequisites



Install the following before running the project:



\- Node.js and npm

\- Python 3

\- PostgreSQL

\- Git



\## Setup Instructions



\### 1. Clone the repository



```bash

git clone -b officebite-integration https://github.com/karthikeya1256/Food-Ordering-Website.git OfficeBite-Git

cd OfficeBite-Git

```



\### 2. Configure PostgreSQL



Start PostgreSQL and make sure the `food\_ordering` database exists.



The database must have the tables and schema expected by the backend. The database itself is not included in this repository.



\### 3. Set up the backend



Open a terminal in the project root and run:



```powershell

cd backend

python -m venv venv

```



Install the Python dependencies without needing to activate the virtual environment in PowerShell:



```powershell

.\\venv\\Scripts\\python.exe -m pip install -r requirements.txt

```



Configure the database connection in the same PowerShell terminal:



```powershell

$env:DATABASE\_URL = "postgresql://postgres:YOUR\_PASSWORD@localhost:5432/food\_ordering"

```



Replace `YOUR\_PASSWORD` with your local PostgreSQL password. Keep credentials private and never commit them to GitHub.



Start the Flask backend:



```powershell

.\\venv\\Scripts\\python.exe app.py

```



The backend is expected to run at:



`http://127.0.0.1:5000`



Keep this terminal open.



\### 4. Set up the frontend



Open a second terminal in the project root:



```powershell

cd C:\\Users\\balar\\Desktop\\OfficeBite-Git

```



Install the frontend dependencies:



```powershell

\& "C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node\_modules\\npm\\bin\\npm-cli.js" install

```



Start the Vite development server:



```powershell

\& "C:\\Program Files\\nodejs\\node.exe" ".\\node\_modules\\vite\\bin\\vite.js"

```



Open the local URL shown in the terminal, normally:



`http://localhost:5173`



\## Access the Pages



| Page | URL |

|---|---|

| Customer | http://localhost:5173/customer |

| Chef Dashboard | http://localhost:5173/chef |

| Flask API root | http://127.0.0.1:5000 |



Both the frontend and backend must be running for database-backed features to work.



\## Order Workflow



1\. The customer browses the available menu.

2\. Food items are added to the cart.

3\. The customer places an order.

4\. The application processes a simulated payment.

5\. The chef views the order and updates its status.

6\. The order progresses through the kitchen workflow.



\## Important Notes



\- Payments are simulated for demonstration purposes. No real money is transferred.

\- PostgreSQL must be installed and configured locally.

\- The database schema and required tables must exist before placing orders.

\- Database credentials should be configured locally and must not be committed.

\- This project is a prototype intended for demonstration and further development.



\## Current Development Branch



`officebite-integration`



\## Future Improvements



\- Authentication and role-based access control.

\- Improved order history and real-time status updates.

\- Deployment of the frontend and backend.

\- Automated backend and frontend tests.

\- Production-ready payment integration.



