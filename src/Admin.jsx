import React, { useEffect, useMemo, useState } from "react";
import "./Admin.css";

const FOOD_KEY = "officebite_foods";
const ORDER_KEY = "officebite_orders";

const starterFoods = [
  {
    id: 1,
    name: "Veg Fried Rice",
    category: "Lunch",
    price: 100,
    image: "/fried-rice.png",
  },
  {
    id: 2,
    name: "Paneer Wrap",
    category: "Snacks",
    price: 80,
    image: "/paneer-wrap.png",
  },
  {
    id: 3,
    name: "Masala Dosa",
    category: "Breakfast",
    price: 60,
    image: "/masala-dosa.png",
  },
  {
    id: 4,
    name: "Fresh Fruit Bowl",
    category: "Healthy",
    price: 70,
    image: "/fruit-bowl.png",
  },
  {
    id: 5,
    name: "Whey Protein Shake",
    category: "Healthy",
    price: 170,
    image: "/whey-protein.png",
  },
  {
    id: 6,
    name: "Chicken Biryani",
    category: "Lunch",
    price: 120,
    image: "/biryani.png",
  },
  {
    id: 7,
    name: "Samosa",
    category: "Snacks",
    price: 30,
    image: "/samosa.png",
  },
  {
    id: 8,
    name: "Idly",
    category: "Breakfast",
    price: 45,
    image: "/idly.png",
  },
  {
    id: 9,
    name: "Poori",
    category: "Breakfast",
    price: 50,
    image: "/poori.png",
  },
  {
    id: 10,
    name: "Wada",
    category: "Breakfast",
    price: 50,
    image: "/wada.png",
  },
  {
    id: 11,
    name: "Tea",
    category: "Beverages",
    price: 25,
    image: "/tea.png",
  },
  {
    id: 12,
    name: "Coffee",
    category: "Beverages",
    price: 35,
    image: "/coffee.png",
  },
];

function readStorage(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function getOrderTotal(order) {
  return Number(
    order.total ?? order.totalAmount ?? order.amount ?? 0
  );
}

function getCustomerName(order) {
  return (
    order.customerName ||
    order.customer ||
    order.employeeName ||
    order.name ||
    "—"
  );
}

export default function Admin() {
  const [foods, setFoods] = useState(() =>
    readStorage(FOOD_KEY, starterFoods)
  );
  const [orders, setOrders] = useState(() =>
    readStorage(ORDER_KEY, [])
  );
  const [tab, setTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");

  const blankForm = {
    name: "",
    price: "",
    category: "Main Course",
    image: "",
    available: true,
  };

  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    localStorage.setItem(FOOD_KEY, JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    function syncStorage(event) {
      try {
        if (event.key === ORDER_KEY && event.newValue) {
          setOrders(JSON.parse(event.newValue));
        }

        if (event.key === FOOD_KEY && event.newValue) {
          setFoods(JSON.parse(event.newValue));
        }
      } catch {
        // Ignore invalid localStorage data.
      }
    }

    window.addEventListener("storage", syncStorage);

    return () => {
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  const paidRevenue = useMemo(() => {
    return orders
      .filter(
        (order) =>
          String(order.paymentStatus || "").toUpperCase() === "PAID"
      )
      .reduce((sum, order) => sum + getOrderTotal(order), 0);
  }, [orders]);

  const customers = [
    ...new Set(
      orders
        .map(getCustomerName)
        .filter((name) => name !== "—")
    ),
  ];

  const filteredFoods = foods.filter((food) => {
    const searchableText = `${food.name} ${food.category}`.toLowerCase();
    return searchableText.includes(search.toLowerCase());
  });

  const tabs = [
    "Overview",
    "Menu Management",
    "Orders",
    "Payments",
    "People",
  ];

  function resetForm() {
    setEditingId(null);
    setForm({ ...blankForm });
  }

  function saveFood(event) {
    event.preventDefault();

    const price = Number(form.price);

    if (
      !form.name.trim() ||
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setNotice("Enter a food name and a valid price.");
      return;
    }

    const foodDetails = {
      ...form,
      name: form.name.trim(),
      price,
      image: form.image.trim(),
    };

    if (editingId !== null) {
      setFoods((currentFoods) =>
        currentFoods.map((food) =>
          food.id === editingId
            ? { ...food, ...foodDetails }
            : food
        )
      );
      setNotice("Food item updated.");
    } else {
      setFoods((currentFoods) => [
        ...currentFoods,
        { ...foodDetails, id: Date.now() },
      ]);
      setNotice("Food item added.");
    }

    resetForm();
  }

  function editFood(food) {
    setEditingId(food.id);
    setForm({
      name: food.name || "",
      price: String(food.price ?? ""),
      category: food.category || "Main Course",
      image: food.image || "",
      available: food.available !== false,
    });
    setTab("Menu Management");
    setNotice("");
  }

  function removeFood(id) {
    const confirmed = window.confirm("Remove this food item?");

    if (!confirmed) {
      return;
    }

    setFoods((currentFoods) =>
      currentFoods.filter((food) => food.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }

    setNotice("Food item removed.");
  }

  function toggleAvailability(id) {
    setFoods((currentFoods) =>
      currentFoods.map((food) =>
        food.id === id
          ? { ...food, available: food.available === false }
          : food
      )
    );
  }

  return (
    <div className="ob-admin">
      <aside className="ob-admin-sidebar">
        <a className="ob-admin-brand" href="/">
          <img
            src="/food-logo.png"
            alt="OfficeBite logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span>
            OfficeBite
            <small>ADMIN CONSOLE</small>
          </span>
        </a>

        <div className="ob-admin-nav-label">WORKSPACE</div>

        {tabs.map((item) => {
          const icons = {
            Overview: "▦",
            "Menu Management": "☷",
            Orders: "▤",
            Payments: "₹",
            People: "♙",
          };

          return (
            <button
              key={item}
              type="button"
              className={`ob-admin-nav-item ${
                tab === item ? "active" : ""
              }`}
              onClick={() => {
                setTab(item);
                setNotice("");
              }}
            >
              <span>{icons[item]}</span>
              {item}
            </button>
          );
        })}

        <div className="ob-admin-sidebar-bottom">
          {/* <div>● Demo admin workspace</div> */}
          <a href="/">← Back to Customer</a>
          <a href="/chef">Open Chef Interface →</a>
        </div>
      </aside>

      <main className="ob-admin-main">
        <header className="ob-admin-topbar">
          <div>
            <div className="ob-admin-eyebrow">
              OFFICEBITE / ADMIN
            </div>
            <h1>{tab}</h1>
          </div>

          <div className="ob-admin-profile">
            <span className="ob-admin-avatar">A</span>
            <span>
              <b>Administrator</b>
              <small>Management access</small>
            </span>
          </div>
        </header>

        {notice && (
          <div className="ob-admin-notice" role="status">
            {notice}
          </div>
        )}

        {tab === "Overview" && (
          <>
            <section className="ob-admin-welcome">
              <div>
                <h2>Good day, Admin</h2>
                <p>
                  Monitor orders, menu availability, and payment
                  activity in one place.
                </p>
              </div>
            </section>

            <section className="ob-admin-stats">
              <Stat
                icon="▤"
                label="Total orders"
                value={orders.length}
                note="Orders stored in this browser"
              />
              <Stat
                icon="₹"
                label="Paid revenue"
                value={formatMoney(paidRevenue)}
                note="Orders marked PAID"
              />
              <Stat
                icon="☷"
                label="Menu items"
                value={foods.length}
                note={`${
                  foods.filter((food) => food.available !== false).length
                } available`}
              />
              <Stat
                icon="♙"
                label="Customers"
                value={customers.length}
                note="Names found in orders"
              />
            </section>

            <section className="ob-admin-panel">
              <PanelHead
                title="Recent orders"
                subtitle="Latest order activity"
                action="View all orders →"
                onClick={() => setTab("Orders")}
              />
              <OrderTable
                orders={orders.slice().reverse().slice(0, 5)}
              />
            </section>

            <section className="ob-admin-panel">
              <PanelHead
                title="Menu availability"
                subtitle="Quick view of active food items"
                action="Manage menu →"
                onClick={() => setTab("Menu Management")}
              />

              <div className="ob-admin-quick-foods">
                {foods.slice(0, 4).map((food) => (
                  <div
                    className="ob-admin-quick-food"
                    key={food.id}
                  >
                    <span className="ob-admin-food-dot">●</span>
                    <span>
                      {food.name}
                      <small>{food.category}</small>
                    </span>
                    <b>{formatMoney(food.price)}</b>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "Menu Management" && (
          <div className="ob-admin-content-grid">
            <section className="ob-admin-panel">
              <PanelHead
                title={
                  editingId !== null
                    ? "Edit food item"
                    : "Add a food item"
                }
                subtitle="Update your OfficeBite menu"
              />

              <form
                className="ob-admin-form"
                onSubmit={saveFood}
              >
                <label>
                  Food name
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Veg Sandwich"
                  />
                </label>

                <label>
                  Price (₹)
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                    placeholder="120"
                  />
                </label>

                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                  >
                    {[
                      "Main Course",
                      "Breakfast",
                      "Lunch",
                      "Snacks",
                      "Healthy",
                      "Beverages",
                      "Dessert",
                    ].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Image path (optional)
                  <input
                    value={form.image}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        image: event.target.value,
                      })
                    }
                    placeholder="/food-image.png"
                  />
                </label>

                <label className="ob-admin-check">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        available: event.target.checked,
                      })
                    }
                  />
                  Available to customers
                </label>

                <div className="ob-admin-form-actions">
                  <button
                    type="submit"
                    className="ob-admin-primary"
                  >
                    {editingId !== null
                      ? "Save changes"
                      : "Add food item"}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      className="ob-admin-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="ob-admin-panel">
              <PanelHead
                title="Food menu"
                subtitle={`${foods.length} items in your menu`}
              />

              <input
                className="ob-admin-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search food or category..."
                aria-label="Search food or category"
              />

              <div className="ob-admin-food-list">
                {filteredFoods.map((food) => (
                  <article
                    className="ob-admin-food-row"
                    key={food.id}
                  >
                    {food.image ? (
                      <img
                        className="ob-admin-food-image"
                        src={food.image}
                        alt={food.name}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="ob-admin-food-placeholder">
                        🍽
                      </span>
                    )}

                    <div className="ob-admin-food-info">
                      <b>{food.name}</b>
                      <small>
                        {food.category} · {formatMoney(food.price)}
                      </small>
                      <span
                        className={`ob-admin-badge ${
                          food.available === false ? "off" : "paid"
                        }`}
                      >
                        {food.available === false
                          ? "Unavailable"
                          : "Available"}
                      </span>
                    </div>

                    <div className="ob-admin-row-actions">
                      <button
                        type="button"
                        onClick={() => toggleAvailability(food.id)}
                      >
                        {food.available === false
                          ? "Enable"
                          : "Disable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => editFood(food)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => removeFood(food.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}

                {filteredFoods.length === 0 && (
                  <p className="ob-admin-empty">
                    No food items match your search.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {tab === "Orders" && (
          <section className="ob-admin-panel">
            <PanelHead
              title="All orders"
              subtitle="Order status and customer details"
            />
            <OrderTable orders={orders.slice().reverse()} />
          </section>
        )}

        {tab === "Payments" && (
          <section className="ob-admin-panel">
            <PanelHead
              title="Payment records"
              subtitle="Method and status saved with each order"
            />

            <div className="ob-admin-table-wrap">
              <table className="ob-admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Payment status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders
                    .slice()
                    .reverse()
                    .map((order, index) => (
                      <tr key={order.id ?? index}>
                        <td>#{order.id ?? "—"}</td>
                        <td>{getCustomerName(order)}</td>
                        <td>{order.paymentMethod || "—"}</td>
                        <td>{formatMoney(getOrderTotal(order))}</td>
                        <td>
                          <Badge
                            value={order.paymentStatus || "PENDING"}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <p className="ob-admin-empty">
                  No payment records yet. Place a test order first.
                </p>
              )}
            </div>
          </section>
        )}

        {tab === "People" && (
          <div className="ob-admin-content-grid">
            <section className="ob-admin-panel">
              <PanelHead
                title="Customers"
                subtitle="Names identified from order records"
              />

              {customers.map((name) => (
                <div className="ob-admin-person" key={name}>
                  <span className="ob-admin-avatar">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <b>{name}</b>
                    <small>
                      Customer ·{" "}
                      {
                        orders.filter(
                          (order) => getCustomerName(order) === name
                        ).length
                      }{" "}
                      order(s)
                    </small>
                  </div>
                </div>
              ))}

              {customers.length === 0 && (
                <p className="ob-admin-empty">
                  No customer names found in current orders.
                </p>
              )}
            </section>

            <section className="ob-admin-panel">
              <PanelHead
                title="Chef / staff information"
                subtitle="Staff directory"
              />
              <p className="ob-admin-empty">
                The current demo does not store a separate staff
                directory. Add a backend or staff list to manage chef
                names and access securely.
              </p>
              <a className="ob-admin-inline-link" href="/chef">
                Open Chef Interface →
              </a>
            </section>
          </div>
        )}

        <footer className="ob-admin-footer">
          OfficeBite Admin · Local demo data · Connect a backend for
          multi-user production use
        </footer>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, note }) {
  return (
    <article className="ob-admin-stat">
      <span className="ob-admin-stat-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function PanelHead({ title, subtitle, action, onClick }) {
  return (
    <div className="ob-admin-panel-heading">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      {action && (
        <button
          type="button"
          className="ob-admin-secondary"
          onClick={onClick}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function Badge({ value }) {
  const isPaid = String(value).toUpperCase() === "PAID";

  return (
    <span
      className={`ob-admin-badge ${
        isPaid ? "paid" : "pending"
      }`}
    >
      {value}
    </span>
  );
}

function OrderTable({ orders }) {
  if (orders.length === 0) {
    return (
      <p className="ob-admin-empty">
        No orders found. Place a test order in the customer interface
        first.
      </p>
    );
  }

  return (
    <div className="ob-admin-table-wrap">
      <table className="ob-admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Order status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => {
            const items = Array.isArray(order.items)
              ? order.items
                  .map(
                    (item) =>
                      `${item.name || item.title || "Item"} × ${
                        item.quantity || 1
                      }`
                  )
                  .join(", ")
              : order.items || order.foodItems || "—";

            return (
              <tr key={order.id ?? index}>
                <td>
                  <b>#{order.id ?? index + 1}</b>
                </td>
                <td>{getCustomerName(order)}</td>
                <td className="ob-admin-items-cell">{items}</td>
                <td>{formatMoney(getOrderTotal(order))}</td>
                <td>
                  <Badge value={order.paymentStatus || "Pending"} />
                </td>
                <td>
                  <span className="ob-admin-status">
                    {order.status || order.orderStatus || "Placed"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}