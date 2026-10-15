
import { useState } from "react";

const initialFoods = [
  { 
    id: 1, 
    name: "Veg Fried Rice", 
    category: "Lunch", 
    price: 100, 
    image:"/fried-rice.png",
  },
  { 
    id: 2, 
    name: "Paneer Wrap", 
    category: "Snacks", 
    price: 80, 
    image:"/paneer-wrap.png", 
  },
  { 
    id: 3,
    name: "Masala Dosa",
    category: "Breakfast",
    price: 60, image:"/masala-dosa.png",
  },
  { 
    id: 4, 
    name: "Fresh Fruit Bowl",
    category: "Healthy", 
    price: 70,
    image:"/fruit-bowl.png", 
  },
  {id: 5, 
    name: "whey protein shake",
    category: "Healthy", 
    price: 170,
    image:"/whey-protein.png", 
  },
  {id: 6, 
    name: "Chicken Biryani",
    category: "Lunch", 
    price: 120,
    image:"/biryani.png", 
  },
  {id: 7, 
    name: "Samosa",
    category: "Snacks", 
    price: 30,
    image:"/samosa.png", 
  },
  {id: 8, 
    name: "Idly",
    category: "Breakfast", 
    price: 45,
    image:"/idly.png", 
  },
  {id: 9, 
    name: "Poori",
    category: "Breakfast", 
    price: 50,
    image:"/poori.png", 
  },
  {id: 10, 
    name: "Wada",
    category: "Breakfast", 
    price: 50,
    image:"/wada.png", 
  },
  {id: 11, 
    name: "Tea",
    category: "", 
    price: 25,
    image:"/tea.png", 
  },
  {id: 12, 
    name: "Coffee",
    category: "", 
    price: 35,
    image:"/coffee.png", 
  },
];

const initialOrders = [
  {
    id: 1001,
    employee: "Rahul",
    items: ["Veg Fried Rice × 1", "Fresh Fruit Bowl × 1"],
    total: 170,
    status: "PLACED",
  },
  {
    id: 1002,
    employee: "Priya",
    items: ["Paneer Wrap × 2"],
    total: 160,
    status: "PREPARING",
  },
];

function App() {
  const [view, setView] = useState("customer");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function addToCart(food) {
    setCart((current) => {
      const existing = current.find((item) => item.id === food.id);

      if (existing) {
        return current.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...food, quantity: 1 }];
    });

    setMessage(`${food.name} added to cart`);
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function placeOrder() {
    if (cart.length === 0) {
      setMessage("Please add food to your cart first.");
      return;
    }

    const newOrder = {
      id: Date.now(),
      employee: "Demo Employee",
      items: cart.map(
        (item) => `${item.name} × ${item.quantity}`
      ),
      total,
      status: "PLACED",
    };

    setOrders((current) => [newOrder, ...current]);
    setCart([]);
    setMessage(`Demo order #${newOrder.id} placed successfully!`);
  }

  function updateStatus(id, status) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  }

  return (
    <div className="app-shell">
      <header className="navbar navbar-expand bg-white border-bottom px-3 px-md-5">
        <a className="navbar-brand fw-bold text-success" href="#home">
          <img
            src="/food-logo.png"
            alt="OfficeBite Logo"
            className="brand-logo"
            />
          OfficeBite..
        </a>

        <div className="ms-auto d-flex gap-2">
          <button
            className={`btn ${view === "customer" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setView("customer")}
          >
            Customer
          </button>
          <button
            className={`btn ${view === "chef" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setView("chef")}
          >
            Chef
          </button>
        </div>
      </header>

      <main className="container py-4 py-md-5">
        {view === "customer" ? (
          <>
            <section className="hero p-4 p-md-5 rounded-4 mb-4">
              <span className="badge text-bg-light mb-3">
                YOUR OFFICE CAFETERIA
              </span>
              <h1 className="display-5 fw-bold">
                Good food. Less waiting.
              </h1>
              <p className="mb-0">
                Order your favourite meal and track it from the kitchen.
              </p>
            </section>

            {message && (
              <div className="alert alert-success" role="status">
                {message}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h3 mb-1">Today's menu</h2>
                <p className="text-secondary mb-0">
                  Fresh meals for your workday
                </p>
              </div>
              <span className="badge text-bg-success fs-6">
                Cart: {cartCount}
              </span>
            </div>

            <div className="row g-3">
              {initialFoods.map((food) => (
                <div className="col-12 col-sm-6 col-lg-3" key={food.id}>
                  <div className="card food-card h-100 border-0 shadow-sm">
                    
                    <img 
                    src={food.image}
                    alt={food.name}
                    className="food-image"
                    />

                    <div className="card-body d-flex flex-column">
                      <span className="small text-success fw-semibold">
                        {food.category}
                      </span>
                      <h3 className="h5 mt-1">{food.name}</h3>
                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <strong>₹{food.price}</strong>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => addToCart(food)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="bg-white border rounded-4 p-3 p-md-4 mt-4">
              <h2 className="h4">Your cart</h2>

              {cart.length === 0 ? (
                <p className="text-secondary mb-0">
                  Your cart is empty. Add something delicious!
                </p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <div className="small text-secondary">
                          ₹{item.price} each
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label={`Remove one ${item.name}`}
                        >
                          −
                        </button>
                        {item.quantity}
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label={`Add one ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <strong>Total</strong>
                    <strong>₹{total}</strong>
                  </div>

                  <button
                    className="btn btn-success mt-3"
                    onClick={placeOrder}
                  >
                    Place demo order
                  </button>
                </>
              )}
            </section>

            <section className="mt-4">
              <h2 className="h4">Your orders</h2>
              {orders
                .filter((order) => order.employee === "Demo Employee")
                .map((order) => (
                  <div className="card border-0 shadow-sm mb-2" key={order.id}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between gap-2">
                        <strong>Order #{order.id}</strong>
                        <span className="badge text-bg-success">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-secondary my-2">
                        {order.items.join(", ")}
                      </p>
                      <strong>Total: ₹{order.total}</strong>
                    </div>
                  </div>
                ))}
            </section>
          </>
        ) : (
          <>
            <div className="mb-4">
              <span className="badge text-bg-success mb-2">
                KITCHEN MANAGEMENT
              </span>
              <h1 className="h2 fw-bold">Chef dashboard</h1>
              <p className="text-secondary">
                Manage incoming orders and update preparation status.
              </p>
            </div>

            <div className="row g-3 mb-4">
              {[
                ["Incoming", orders.filter((o) => o.status === "PLACED").length],
                ["Preparing", orders.filter((o) => o.status === "PREPARING").length],
                ["Ready", orders.filter((o) => o.status === "READY").length],
              ].map(([label, count]) => (
                <div className="col-4" key={label}>
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="text-secondary small">{label}</div>
                      <div className="display-6 fw-bold">{count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="h4 mb-3">Kitchen orders</h2>

            {orders.length === 0 && (
              <p className="text-secondary">No orders yet.</p>
            )}

            {orders.map((order) => (
              <div className="card border-0 shadow-sm mb-3" key={order.id}>
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <div>
                      <h3 className="h5">Order #{order.id}</h3>
                      <p className="text-secondary mb-2">
                        Employee: {order.employee}
                      </p>
                    </div>
                    <span className="badge text-bg-success align-self-start">
                      {order.status}
                    </span>
                  </div>

                  <ul className="mb-3">
                    {order.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <strong>₹{order.total}</strong>

                    <div className="d-flex gap-2 flex-wrap">
                      {order.status === "PLACED" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(order.id, "ACCEPTED")}
                        >
                          Accept
                        </button>
                      )}

                      {order.status === "ACCEPTED" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(order.id, "PREPARING")}
                        >
                          Start preparing
                        </button>
                      )}

                      {order.status === "PREPARING" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(order.id, "READY")}
                        >
                          Mark ready
                        </button>
                      )}

                      {order.status === "READY" && (
                        <button
                          className="btn btn-dark btn-sm"
                          onClick={() => updateStatus(order.id, "COMPLETED")}
                        >
                          Complete order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      <footer className="text-center text-secondary py-4">
        OfficeBite..
      </footer>
    </div>
  );
}

export default App;






