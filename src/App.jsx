import { useEffect, useState } from "react"; 

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
  const [foods, setFoods] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);

  const [view, setView] = useState(
    window.location.pathname === "/chef" ? "chef" : "customer"
  );
  useEffect(() => {
  async function loadMenu() {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/menu"
      );

      if (!response.ok) {
        throw new Error("Failed to load menu");
      }

      const data = await response.json();

      const imageByName = {
        "Veg Fried Rice": "/fried-rice.png",
        "Paneer Wrap": "/paneer-wrap.png",
        "Masala Dosa": "/masala-dosa.png",
        "Fresh Fruit Bowl": "/fruit-bowl.png",
        "whey protein shake": "/whey-protein.png",
        "Chicken Biryani": "/biryani.png",
        "Samosa": "/samosa.png",
        "Idly": "/idly.png",
        "Poori": "/poori.png",
        "Wada": "/wada.png",
        "Tea": "/tea.png",
        "Coffee": "/coffee.png",
      };

      setFoods(
        data
          .filter((item) => item.is_available)
          .map((item) => ({
            ...item,
            image: imageByName[item.name] || "",
          }))
      );
    } catch (error) {
      console.error("Menu loading failed:", error);
      setMenuError("Could not load menu. Check the backend.");
    } finally {
      setLoadingMenu(false);
    }
  }

  loadMenu();
  loadOrders();
}, []);
  useEffect(() => {
  function handlePopState() {
    setView(
      window.location.pathname === "/chef" ? "chef" : "customer"
    );
  }

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

function navigateToPage(page) {
  const path = page === "chef" ? "/chef" : "/customer";

  window.history.pushState({}, "", path);
  setView(page);
}

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

async function loadOrders() {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/orders");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load orders");
    }

    const formattedOrders = data.map((order) => ({
      id: order.order_id,
      employee: order.customer_name,
      items: order.items.map(
        (item) => `${item.name} × ${item.quantity}`
      ),
      total: Number(order.total_amount),
      status: {
        pending: "PLACED",
        confirmed: "ACCEPTED",
        preparing: "PREPARING",
        ready: "READY",
        completed: "COMPLETED",
      }[order.status] || order.status.toUpperCase(),
    }));

    setOrders(formattedOrders);
  } catch (error) {
    console.error("Loading orders failed:", error);
    setMessage("Could not load orders from the server.");
  }
}


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

  

async function placeOrder() {
  if (cart.length === 0) {
    setMessage("Please add food to your cart first.");
    setShowPaymentPage(false);
    return;
  }

  try {
    setMessage("Placing your order...");

    const response = await fetch("http://127.0.0.1:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Could not place order");
    }

    const newOrder = {
      id: data.order_id,
      employee: "Demo Employee",
      items: cart.map(
        (item) => `${item.name} × ${item.quantity}`
      ),
      total: Number(data.total_amount),
      status: "PLACED",
      paymentMethod,
      paymentStatus: "PENDING",
    };

    setOrders((current) => [newOrder, ...current]);
    setPendingOrder(newOrder);
    setShowPaymentPage(true);
    setMessage(`Order #${newOrder.id} created. Complete the demo payment next.`);
  } catch (error) {
    console.error("Order creation failed:", error);
    setMessage(error.message || "Could not place order. Please try again.");
  }
}


async function processPayment() {
  
  console.log("Pending order:", pendingOrder);
  console.log("Cart:", cart);

  if (!pendingOrder) {
    setMessage("No pending order found. Please place your order again.");
    alert("No pending order found!");
    return;
  }

  try {
    setMessage("Processing demo payment...");

    const response = await fetch(
      `http://127.0.0.1:5000/api/orders/${pendingOrder.id}/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outcome: "success" }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment failed");
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === pendingOrder.id
          ? {
              ...order,
              status: "ACCEPTED",
              paymentMethod,
              paymentStatus: "PAID",
            }
          : order
      )
    );

    setCart([]);
    setPendingOrder(null);
    setShowPaymentPage(false);
    setMessage(`Demo payment successful! Order #${data.order_id} confirmed.`);
  } catch (error) {
    console.error("Payment failed:", error);
    setMessage(error.message || "Payment failed. Please try again.");
  }
}


  
async function updateStatus(id, status) {
  const backendStatus = {
    PREPARING: "preparing",
    READY: "ready",
    COMPLETED: "completed",
  }[status];

  if (!backendStatus) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/orders/${id}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Could not update order status");
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );

    setMessage(`Order #${id} updated to ${status}`);
  } catch (error) {
    console.error("Status update failed:", error);
    setMessage(error.message || "Could not update order status");
  }
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
            onClick={async () => {
  await loadOrders();
  navigateToPage("customer");
}}
          >
            Customer
          </button>
          <button
            className={`btn ${view === "chef" ? "btn-success" : "btn-outline-success"}`}
            onClick={async () => {
  await loadOrders();
  navigateToPage("chef");
}}
          >
            Chef
          </button>
        </div>
      </header>

      <main className="container py-4 py-md-5">
      {view === "customer" ? (
  showPaymentPage ? (
    <section className="payment-page">
      <button
        type="button"
        className="btn btn-outline-success mb-4"
        onClick={() => setShowPaymentPage(false)}
      >
        ← Back to Menu
      </button>

      <div className="payment-card">
        <h1>OfficeBite Payment</h1>
        <p className="text-secondary">
          Review your order and select a demo payment method.
        </p>

        <div className="payment-total">
          <span>Total amount</span>
          <h2>₹{total}</h2>
        </div>

        <h3 className="h5 mt-4">Choose payment method</h3>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="UPI"
            checked={paymentMethod === "UPI"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>UPI </span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="Card"
            checked={paymentMethod === "Card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>Credit / Debit Card </span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="Cash"
            checked={paymentMethod === "Cash"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>Cash at Cafeteria </span>
        </label>

        <button
          type="button"
          className="btn btn-success w-100 mt-4"
          onClick={processPayment}
          disabled={cart.length === 0}
        >
          Confirm Payment — ₹{total}
        </button>

        <p className="small text-secondary text-center mt-3 mb-0">
          Demo only. No real money will be charged.
        </p>
      </div>
    </section>
  ) : (
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
              {foods.map((food) => {
                const cartItem = cart.find((item) => item.id === food.id);
                return(

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

                      <div className="mt-auto d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <strong>₹{food.price}</strong>

                      {cartItem ? (
                        <div className="quantity-control">
                          <button
                            type="button"
                            className="btn btn-outline-success quantity-btn"
                            onClick={() => changeQuantity(food.id, -1)}
                            aria-label={`Decrease ${food.name} quantity`}
                          >
                            −
                          </button>

                          <span className="quantity-number">
                            {cartItem.quantity}
                          </span>

                          <button
                            type="button"
                            className="btn btn-success quantity-btn"
                            onClick={() => changeQuantity(food.id, 1)}
                            aria-label={`Increase ${food.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => addToCart(food)}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
  type="button"
  className="btn btn-success w-100 mt-3"
  onClick={placeOrder}
  disabled={cart.length === 0}
>
  Proceed to Payment — ₹{total}
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
        )
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
{order.paymentStatus && (
  <div className="small mb-2">
    <span className="payment-status">
      PAYMENT {order.paymentStatus}
    </span>

    <div className="text-secondary mt-2">
      Method: {order.paymentMethod}
    </div>
  </div>
)}

                      
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

