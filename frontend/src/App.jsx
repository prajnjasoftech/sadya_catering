import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import api from "./api";
import { endSession, recordActivity, watchSession } from "./session";
import PaymentHistory from "./PaymentHistory";
import CashFlowReports from "./CashFlowReports";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UtensilsCrossed,
  ListChecks,
  ReceiptIndianRupee,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Menu,
  Plus,
  Search,
  Pencil,
  Trash2,
  IndianRupee,
  TrendingUp,
  WalletCards,
  Clock3,
  X,
  Printer,
  LogOut,
  Leaf,
  Eye,
  ArrowLeft,
  MapPin,
  Phone,
  ShoppingCart,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
const nav = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/bookings", "Bookings", CalendarDays],
  ["/customers", "Customers", Users],
  ["/packages", "Sadya Packages", UtensilsCrossed],
  ["/menu-items", "Menu Items", ListChecks],
  ["/expenses", "Expenses", ReceiptIndianRupee],
  ["/purchases", "Purchases", ShoppingCart],
  ["/payments", "Payments", CreditCard],
  ["/reports", "Reports", BarChart3],
  ["/settings", "Settings", Settings],
];
function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@sadyacatering.test"),
    [password, setPassword] = useState("password"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      let { data } = await api.post("/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      recordActivity();
      sessionStorage.removeItem("sadya.logoutReason");
      onLogin();
    } catch {
      setError("Email or password is incorrect.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login">
      <section className="login-art">
        <div className="brand-mark">
          <Leaf />
        </div>
        <h1>Every celebration, beautifully managed.</h1>
        <p>
          From the first enquiry to the final serving, keep your Sadya bookings,
          menus, payments and expenses perfectly organised.
        </p>
      </section>
      <section className="login-panel">
        <form className="login-box" onSubmit={submit}>
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to SadyaPro</h2>
          <p className="muted">
            Use the demo admin account to explore your workspace.
          </p>
          {error && <p className="error">{error}</p>}
          {sessionStorage.getItem("sadya.logoutReason") && <p role="status" className="muted">{sessionStorage.getItem("sadya.logoutReason")}</p>}
          <div className="field">
            <label>Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
function Shell() {
  const [open, setOpen] = useState(false),
    loc = useLocation(),
    go = useNavigate();
  let title = nav.find((x) => loc.pathname.startsWith(x[0]))?.[1] || "SadyaPro";
  function logout() {
    sessionStorage.removeItem("sadya.logoutReason");
    endSession();
    go("/login", {replace: true});
  }
  return (
    <div className="app">
      <aside className={"sidebar " + (open ? "open" : "")}>
        <div className="brand">
          <div className="brand-mark">
            <Leaf size={22} />
          </div>
          <div>
            <h2>SadyaPro</h2>
            <small>Catering Suite</small>
          </div>
        </div>
        <nav className="nav">
          {nav.map(([to, label, I]) => (
            <NavLink to={to} key={to} onClick={() => setOpen(false)}>
              <I size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="usercard">
          <div className="avatar">SA</div>
          <div>
            <div className="strong">Sadya Admin</div>
            <small>Administrator</small>
          </div>
          <button
            className="icon-btn"
            onClick={logout}
            style={{ marginLeft: "auto" }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="header">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              className="icon-btn mobile-menu"
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </button>
            <h1>{title}</h1>
          </div>
          <div className="head-actions">
            <button className="icon-btn">
              <Search size={19} />
            </button>
            <button className="icon-btn">
              <Bell size={19} />
            </button>
          </div>
        </header>
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route
              path="/customers"
              element={
                <CrudPage
                  type="customers"
                  title="Customers"
                  singular="Customer"
                />
              }
            />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route
              path="/packages"
              element={
                <CrudPage
                  type="packages"
                  title="Sadya Packages"
                  singular="Package"
                />
              }
            />
            <Route
              path="/menu-items"
              element={
                <CrudPage
                  type="menu-items"
                  title="Menu Items"
                  singular="Menu item"
                />
              }
            />
            <Route
              path="/expenses"
              element={
                <CrudPage type="expenses" title="Expenses" singular="Expense" />
              }
            />
            <Route
              path="/payments"
              element={
                <PaymentHistory Modal={Modal} Stat={Stat} PaymentForm={PaymentForm} />
              }
            />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get("/dashboard").then((r) => setD(r.data));
  }, []);
  if (!d) return <div className="empty">Preparing your dashboard…</div>;
  let cards = [
    ["Today’s functions", d.stats.today, CalendarDays, "green"],
    ["Upcoming bookings", d.stats.upcoming, Clock3, "gold"],
    ["Monthly revenue", money(d.stats.revenue), IndianRupee, "blue"],
    ["Outstanding", money(d.stats.outstanding), WalletCards, "rose"],
    ["Payments received", money(d.stats.received), CreditCard, "green"],
    ["Total expenses", money(d.stats.expenses), ReceiptIndianRupee, "rose"],
    ["Estimated profit", money(d.stats.profit), TrendingUp, "green"],
    ["Bookings this month", d.stats.month_bookings, ListChecks, "gold"],
  ];
  return (
    <>
      <div className="page-top">
        <div>
          <p className="eyebrow">Friday, 14 August</p>
          <h2>Good morning, Admin</h2>
        </div>
        <NavLink className="btn btn-primary" to="/bookings">
          <Plus size={18} /> New booking
        </NavLink>
      </div>
      <div className="stats">
        {cards.map(([l, v, I, c]) => (
          <div className="stat" key={l}>
            <div className="stat-top">
              <span>{l}</span>
              <span className={"stat-icon " + c}>
                <I size={18} />
              </span>
            </div>
            <div className="stat-value money">{v}</div>
            <small>Live business overview</small>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <h3>Revenue & expenses</h3>
            <span className="muted">Last 6 months</span>
          </div>
          <div className="chart">
            <ResponsiveContainer>
              <AreaChart data={d.series}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#267244" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#267244" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eeeae1" vertical={false} />
                <XAxis dataKey="month" axisLine={false} />
                <YAxis axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={money} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#267244"
                  fill="url(#g)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#d2952d"
                  fill="none"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            <h3>Booking status</h3>
          </div>
          <div className="chart">
            <ResponsiveContainer>
              <BarChart data={d.statuses} layout="vertical">
                <CartesianGrid stroke="#eeeae1" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="status"
                  type="category"
                  width={82}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="total"
                  fill="#2d7755"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card table-card">
        <div className="card-title" style={{ padding: "20px 20px 0" }}>
          <h3>Recent bookings</h3>
          <NavLink to="/bookings" className="muted">
            View all →
          </NavLink>
        </div>
        <BookingTable rows={d.recent_bookings} />
      </div>
    </>
  );
}
function BookingTable({ rows, onDelete }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Booking</th>
          <th>Customer</th>
          <th>Function</th>
          <th>Date</th>
          <th>Guests</th>
          <th>Value</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id}>
            <td>
              <Link className="booking-link" to={`/bookings/${b.id}`}>
                {b.booking_number}
              </Link>
            </td>
            <td>{b.customer?.name}</td>
            <td>
              <span className="strong">{b.function_type}</span>
              <div className="muted">{b.venue}</div>
            </td>
            <td>
              {new Date(b.function_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </td>
            <td>{b.guest_count}</td>
            <td className="strong money">{money(b.final_amount)}</td>
            <td>
              <span className={"badge " + b.status}>{b.status}</span>
            </td>
            <td>
              <div className="actions">
                <Link
                  className="icon-btn"
                  title="View booking details"
                  to={`/bookings/${b.id}`}
                >
                  <Eye size={15} />
                </Link>
                {onDelete && (
                <button className="icon-btn" onClick={() => onDelete(b)}>
                  <Trash2 size={15} />
                </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function Bookings() {
  const [rows, setRows] = useState([]),
    [modal, setModal] = useState(false),
    [search, setSearch] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const customerId = params.get("customer_id");
  const returnToCustomer = params.get("return") === "customer";
  const load = () =>
    api
      .get("/bookings", { params: { search } })
      .then((r) => setRows(r.data.data));
  useEffect(() => {
    load();
  }, [search]);
  useEffect(() => {
    if (params.get("add") === "1") setModal(true);
  }, [params]);
  async function del(b) {
    if (confirm(`Delete booking ${b.booking_number}?`)) {
      await api.delete("/bookings/" + b.id);
      load();
    }
  }
  return (
    <>
      <PageTop
        title="Bookings"
        sub="Plan and manage every function from one place"
        action={() => setModal(true)}
      />
      <div className="card table-card">
        <Toolbar search={search} setSearch={setSearch} />
        {rows.length ? <BookingTable rows={rows} onDelete={del} /> : <Empty />}
      </div>
      {modal && (
        <BookingForm
          defaultCustomerId={customerId}
          close={() => setModal(false)}
          saved={(booking) => {
            setModal(false);
            if (returnToCustomer && customerId) navigate(`/customers/${customerId}`);
            else navigate(`/bookings/${booking.id}`);
          }}
        />
      )}
    </>
  );
}

function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then((response) => setBooking(response.data))
      .catch(() => setError("This booking could not be found."));
  }, [id]);

  if (error)
    return (
      <div className="card empty">
        <p>{error}</p>
        <Link className="btn btn-primary" to="/bookings">
          Back to bookings
        </Link>
      </div>
    );
  if (!booking) return <div className="empty">Loading booking details…</div>;

  const expenseTotal = booking.expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );
  const date = new Date(`${booking.function_date}T00:00:00`).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "long", year: "numeric" },
  );

  return (
    <>
      <div className="detail-head">
        <div>
          <Link className="back-link" to="/bookings">
            <ArrowLeft size={16} /> Back to bookings
          </Link>
          <div className="detail-title">
            <h2>{booking.booking_number}</h2>
            <span className={`badge ${booking.status}`}>{booking.status}</span>
          </div>
          <p className="eyebrow">
            Created {new Date(booking.created_at).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <Printer size={17} /> Print booking
          </button>
          {Number(booking.balance_amount) > 0 && (
            <Link className="btn btn-primary" to={`/payments?add=1&booking_id=${booking.id}`}>
              <CreditCard size={17} /> Pay now
            </Link>
          )}
        </div>
      </div>

      <div className="stats detail-stats">
        <Stat label="Booking value" value={money(booking.final_amount)} I={IndianRupee} />
        <Stat label="Amount received" value={money(booking.paid_amount)} I={CreditCard} />
        <Stat label="Balance receivable" value={money(booking.balance_amount)} I={WalletCards} />
        <Stat label="Estimated profit" value={money(booking.estimated_profit)} I={TrendingUp} />
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="card">
            <div className="card-title"><h3>Function details</h3></div>
            <div className="info-grid">
              <Info label="Function" value={booking.function_type} />
              <Info label="Date & serving time" value={`${date} · ${booking.serving_time?.slice(0, 5) || "Not set"}`} />
              <Info label="Venue" value={booking.venue} wide />
              <Info label="Number of leaves" value={booking.guest_count.toLocaleString("en-IN")} />
              <Info label="Sadya package" value={booking.package?.name || "Custom package"} />
            </div>
          </section>

          <section className="card">
            <div className="card-title">
              <h3>Customised menu</h3>
              <span className="muted">{booking.menu_items.filter((item) => item.included).length} dishes</span>
            </div>
            <div className="dish-list">
              {booking.menu_items.map((item) => (
                <div className={`dish ${item.included ? "" : "removed"}`} key={item.id}>
                  <span className="dish-check">{item.included ? "✓" : "−"}</span>
                  <div><span className="strong">{item.dish_name}</span>{item.instructions && <div className="muted">{item.instructions}</div>}</div>
                  {Number(item.extra_price) > 0 && <span className="money">+{money(item.extra_price)}</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="card table-card detail-table">
            <div className="card-title detail-card-title"><h3>Payment history</h3></div>
            {booking.payments.length ? (
              <table><thead><tr><th>Date</th><th>Type</th><th>Mode</th><th>Reference</th><th>Amount</th></tr></thead><tbody>
                {booking.payments.map((payment) => <tr key={payment.id}><td>{payment.payment_date}</td><td>{payment.payment_type}</td><td>{payment.payment_mode}</td><td>{payment.reference_number || "—"}</td><td className="strong money">{money(payment.amount)}</td></tr>)}
              </tbody></table>
            ) : <div className="empty compact">No payments recorded.</div>}
          </section>

          <section className="card table-card detail-table">
            <div className="card-title detail-card-title"><h3>Booking expenses</h3><b>{money(expenseTotal)}</b></div>
            {booking.expenses.length ? (
              <table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Paid to</th><th>Amount</th></tr></thead><tbody>
                {booking.expenses.map((expense) => <tr key={expense.id}><td>{expense.date}</td><td>{expense.expense_type}</td><td>{expense.description}</td><td>{expense.paid_to || "—"}</td><td className="strong money">{money(expense.amount)}</td></tr>)}
              </tbody></table>
            ) : <div className="empty compact">No expenses linked to this booking.</div>}
          </section>
        </div>

        <aside className="detail-side">
          <section className="card customer-card">
            <div className="card-title"><h3>Customer</h3></div>
            <div className="avatar large">{booking.customer.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
            <h3>{booking.customer.name}</h3>
            <p><Phone size={15} /> {booking.customer.mobile}</p>
            <p><MapPin size={15} /> {booking.customer.place || booking.customer.address || "Address not added"}</p>
          </section>
          <section className="card price-card">
            <div className="card-title"><h3>Price summary</h3></div>
            <PriceRow label={`${booking.guest_count} leaves × ${money(booking.price_per_leaf)}`} value={booking.base_amount} />
            <PriceRow label="Additional charges" value={booking.additional_charges} />
            <PriceRow label="Discount" value={-Number(booking.discount)} />
            <div className="price-total"><span>Booking total</span><b>{money(booking.final_amount)}</b></div>
            <PriceRow label="Payments received" value={-Number(booking.paid_amount)} />
            <div className="price-balance"><span>Balance due</span><b>{money(booking.balance_amount)}</b></div>
          </section>
          {booking.notes && <section className="card"><div className="card-title"><h3>Additional information</h3></div><p className="muted" style={{whiteSpace: "pre-wrap", overflowWrap: "anywhere"}}>{booking.notes}</p></section>}
        </aside>
      </div>
    </>
  );
}

function Info({ label, value, wide }) {
  return <div className={`info-item ${wide ? "wide" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

function PriceRow({ label, value }) {
  return <div className="price-row"><span>{label}</span><span className="money">{money(value)}</span></div>;
}

function BookingForm({ close, saved, defaultCustomerId = null }) {
  const [customers, setCustomers] = useState([]),
    [packages, setPackages] = useState([]),
    [f, setF] = useState({
      function_type: "Wedding",
      function_date: new Date().toISOString().slice(0, 10),
      serving_time: "12:30",
      guest_count: 100,
      price_per_leaf: 150,
      additional_charges: 0,
      discount: 0,
      status: "Confirmed",
      venue: "",
      notes: "",
    });
  useEffect(() => {
    Promise.all([api.get("/customers"), api.get("/packages")]).then(
      ([a, b]) => {
        setCustomers(a.data.data);
        setPackages(b.data.data);
        setF((x) => ({
          ...x,
          customer_id: defaultCustomerId || a.data.data[0]?.id,
          sadya_package_id: b.data.data[0]?.id,
          price_per_leaf: b.data.data[0]?.price_per_leaf || 150,
        }));
      },
    );
  }, [defaultCustomerId]);
  let base = f.guest_count * f.price_per_leaf,
    final = base + Number(f.additional_charges) - Number(f.discount);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  async function submit(e) {
    e.preventDefault();
    const response = await api.post("/bookings", f);
    saved(response.data);
  }
  return (
    <Modal title="Create a new booking" close={close}>
      <form onSubmit={submit}>
        <div className="modal-body form-grid">
          <Field label="Customer">
            <select
              value={f.customer_id || ""}
              onChange={(e) => set("customer_id", e.target.value)}
            >
              {customers.map((x) => (
                <option value={x.id}>
                  {x.name} · {x.mobile}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Function type">
            <select
              value={f.function_type}
              onChange={(e) => set("function_type", e.target.value)}
            >
              {[
                "Wedding",
                "Reception",
                "Housewarming",
                "Birthday",
                "Temple Function",
                "Corporate Function",
                "Family Function",
                "Other",
              ].map((x) => (
                <option>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Function date">
            <input
              type="date"
              value={f.function_date}
              onChange={(e) => set("function_date", e.target.value)}
            />
          </Field>
          <Field label="Serving time">
            <input
              type="time"
              value={f.serving_time}
              onChange={(e) => set("serving_time", e.target.value)}
            />
          </Field>
          <Field label="Venue" full>
            <input
              required
              value={f.venue}
              onChange={(e) => set("venue", e.target.value)}
              placeholder="Function venue and place"
            />
          </Field>
          <Field label="Additional information" full>
            <textarea
              rows={3}
              value={f.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional special requests, serving instructions, or other details"
            />
          </Field>
          <Field label="Number of leaves">
            <input
              type="number"
              min="1"
              value={f.guest_count}
              onChange={(e) => set("guest_count", e.target.value)}
            />
          </Field>
          <Field label="Sadya package">
            <select
              value={f.sadya_package_id || ""}
              onChange={(e) => {
                let p = packages.find((x) => x.id == e.target.value);
                setF((x) => ({
                  ...x,
                  sadya_package_id: p.id,
                  price_per_leaf: p.price_per_leaf,
                }));
              }}
            >
              {packages.map((x) => (
                <option value={x.id}>
                  {x.name} · {money(x.price_per_leaf)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price per leaf">
            <input
              type="number"
              value={f.price_per_leaf}
              onChange={(e) => set("price_per_leaf", e.target.value)}
            />
          </Field>
          <Field label="Advance payment">
            <input
              type="number"
              value={f.advance_amount || ""}
              onChange={(e) => set("advance_amount", e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Additional charges">
            <input
              type="number"
              value={f.additional_charges}
              onChange={(e) => set("additional_charges", e.target.value)}
            />
          </Field>
          <Field label="Discount">
            <input
              type="number"
              value={f.discount}
              onChange={(e) => set("discount", e.target.value)}
            />
          </Field>
          <div className="field full card" style={{ background: "#f6f8f4" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Base amount</span>
              <b>{money(base)}</b>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 18,
                marginTop: 8,
              }}
            >
              <span>Final booking amount</span>
              <b style={{ color: "#166534" }}>{money(final)}</b>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close}>
            Cancel
          </button>
          <button className="btn btn-primary">Save booking</button>
        </div>
      </form>
    </Modal>
  );
}
const defs = {
  customers: {
    fields: [
      ["name", "Customer name"],
      ["mobile", "Mobile number"],
      ["alternate_mobile", "Alternate mobile"],
      ["email", "Email"],
      ["place", "Place"],
      ["address", "Address"],
    ],
    cols: [
      ["name", "Customer"],
      ["mobile", "Mobile"],
      ["place", "Place"],
      ["email", "Email"],
    ],
  },
  "menu-items": {
    fields: [
      ["name", "Dish name"],
      ["category", "Category"],
      ["description", "Description"],
    ],
    cols: [
      ["name", "Dish"],
      ["category", "Category"],
      ["description", "Description"],
    ],
  },
  packages: {
    fields: [
      ["name", "Package name"],
      ["price_per_leaf", "Price per leaf", "number"],
      ["description", "Description"],
    ],
    cols: [
      ["name", "Package"],
      ["price_per_leaf", "Price / leaf", "money"],
      ["description", "Description"],
    ],
  },
  expenses: {
    fields: [
      ["date", "Date", "date"],
      ["expense_type", "Expense type"],
      ["description", "Description"],
      ["amount", "Amount", "number"],
      ["initial_payment", "Pay now (optional)", "number"],
      ["paid_to", "Paid to"],
      ["payment_method", "Payment method"],
    ],
    cols: [
      ["date", "Date"],
      ["expense_type", "Type"],
      ["description", "Description"],
      ["paid_to", "Paid to"],
      ["amount", "Amount", "money"],
      ["paid_amount", "Paid", "money"],
      ["balance_amount", "Pending", "money"],
    ],
  },
  payments: {
    fields: [
      ["booking_id", "Booking ID", "number"],
      ["payment_date", "Payment date", "date"],
      ["amount", "Amount", "number"],
      ["payment_mode", "Payment mode"],
      ["payment_type", "Payment type"],
      ["reference_number", "Reference"],
    ],
    cols: [
      ["booking_id", "Booking"],
      ["payment_date", "Date"],
      ["amount", "Amount", "money"],
      ["payment_mode", "Mode"],
      ["payment_type", "Type"],
    ],
  },
};
function Purchases() {
  const [rows, setRows] = useState([]), [suppliers, setSuppliers] = useState([]), [purchaseTypes, setPurchaseTypes] = useState([]), [search, setSearch] = useState(""), [editing, setEditing] = useState(null), [open, setOpen] = useState(false), [paying, setPaying] = useState(null);
  const load = () => api.get("/expenses", {params:{expense_type:"Purchase", search}}).then((r)=>setRows(r.data.data));
  const loadMasters = () => Promise.all([api.get("/suppliers",{params:{per_page:100}}),api.get("/purchase-types",{params:{per_page:100}})]).then(([s,t])=>{setSuppliers(s.data.data);setPurchaseTypes(t.data.data);});
  useEffect(()=>{ load(); }, [search]);
  useEffect(()=>{ loadMasters(); },[]);
  async function remove(row){if(confirm("Delete this purchase record?")){await api.delete(`/expenses/${row.id}`);load();}}
  const total=rows.reduce((sum,row)=>sum+Number(row.amount),0);
  return <><PageTop title="Purchase payments" sub="Record supplier purchases and outgoing payments" action={()=>{setEditing(null);setOpen(true);}}/>
    <div className="stats purchase-stats"><Stat label="Visible purchases" value={rows.length} I={ShoppingCart}/><Stat label="Total paid" value={money(total)} I={WalletCards}/></div>
    <div className="card table-card"><Toolbar search={search} setSearch={setSearch}/>{rows.length?<table><thead><tr><th>Date</th><th>Purchase / supplier</th><th>Bill no.</th><th>Total</th><th>Paid</th><th>Balance</th><th/></tr></thead><tbody>{rows.map((row)=><tr key={row.id}><td>{row.date}</td><td><strong>{row.description}</strong><div className="muted">{row.supplier?.name||row.paid_to||"—"}</div></td><td>{row.invoice_number||"—"}</td><td className="money">{money(row.amount)}</td><td className="money">{money(row.paid_amount)}</td><td className="strong money">{money(row.balance_amount)}</td><td><div className="actions">{row.balance_amount>0&&<button title="Record payment" onClick={()=>setPaying(row)}><CreditCard size={15}/></button>}<button onClick={()=>{setEditing(row);setOpen(true);}}><Pencil size={15}/></button><button onClick={()=>remove(row)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>:<Empty/>}</div>
    {open&&<PurchaseForm item={editing} suppliers={suppliers} purchaseTypes={purchaseTypes} close={()=>setOpen(false)} saved={()=>{setOpen(false);load();loadMasters();}}/>}
    {paying&&<ExpensePaymentForm expense={paying} close={()=>setPaying(null)} saved={()=>{setPaying(null);load();}}/>}
  </>;
}
function PurchaseForm({item,suppliers,purchaseTypes,close,saved}) {
  const knownType=purchaseTypes.some((type)=>type.name===item?.description)?item?.description:"";
  const [form,setForm]=useState(item?{...item,purchase_type:knownType||"__new",new_purchase_type:knownType?"":item.description,new_supplier_name:"",new_supplier_mobile:"",new_supplier_address:""}:{date:new Date().toLocaleDateString("en-CA"),expense_type:"Purchase",supplier_id:"",purchase_type:"",new_purchase_type:"",new_supplier_name:"",new_supplier_mobile:"",new_supplier_address:"",amount:"",initial_payment:"",invoice_number:"",payment_method:"",notes:""});
  const [error,setError]=useState("");
  const set=(key,value)=>setForm((old)=>({...old,[key]:value}));
  const amount=Number(form.amount||0);
  const paidAmount=item?Number(item.paid_amount||0):Math.min(amount,Number(form.initial_payment||0));
  const balanceAmount=Math.max(0,amount-paidAmount);
  async function submit(e){e.preventDefault();setError("");try{let supplier=suppliers.find((x)=>String(x.id)===String(form.supplier_id));if(form.supplier_id==="__new"){const response=await api.post("/suppliers",{name:form.new_supplier_name,mobile:form.new_supplier_mobile||null,address:form.new_supplier_address||null});supplier=response.data;}let purchaseName=form.purchase_type;if(form.purchase_type==="__new"){const response=await api.post("/purchase-types",{name:form.new_purchase_type});purchaseName=response.data.name;}const payload={...form,expense_type:"Purchase",description:purchaseName,amount,paid_to:supplier?.name||form.paid_to,booking_id:null,supplier_id:supplier?.id||null};["items","purchase_type","new_purchase_type","new_supplier_name","new_supplier_mobile","new_supplier_address"].forEach((key)=>delete payload[key]);item?await api.put(`/purchases/${item.id}`,payload):await api.post("/purchases",payload);saved();}catch(failure){setError(Object.values(failure.response?.data?.errors||{}).flat()[0]||"Purchase could not be saved.");}}
  return <Modal title={item?"Edit purchase":"Record purchase"} close={close}><form onSubmit={submit}><div className="modal-body form-grid">
    {error&&<div className="error field full">{error}</div>}
    <Field label="Purchase date"><input required type="date" value={form.date} onChange={(e)=>set("date",e.target.value)}/></Field><Field label="Purchase item"><select required value={form.purchase_type} onChange={(e)=>set("purchase_type",e.target.value)}><option value="">Select purchase item</option>{purchaseTypes.map((type)=><option value={type.name} key={type.id}>{type.name}</option>)}<option value="__new">+ Add new purchase item</option></select></Field>
    {form.purchase_type==="__new"&&<Field label="New purchase item" full><input required value={form.new_purchase_type} onChange={(e)=>set("new_purchase_type",e.target.value)} placeholder="e.g. Banana Leaves"/></Field>}
    <Field label="Supplier"><select required value={form.supplier_id||""} onChange={(e)=>set("supplier_id",e.target.value)}><option value="">Select supplier</option>{suppliers.map((s)=><option value={s.id} key={s.id}>{s.name}</option>)}<option value="__new">+ Add new supplier</option></select></Field><Field label="Invoice / bill number"><input value={form.invoice_number||""} onChange={(e)=>set("invoice_number",e.target.value)} placeholder="Supplier bill number"/></Field>
    {form.supplier_id==="__new"&&<><Field label="New supplier name"><input required autoFocus value={form.new_supplier_name} onChange={(e)=>set("new_supplier_name",e.target.value)} placeholder="Supplier name"/></Field><Field label="Mobile"><input value={form.new_supplier_mobile} onChange={(e)=>set("new_supplier_mobile",e.target.value)} placeholder="Optional mobile"/></Field><Field label="Address" full><input value={form.new_supplier_address} onChange={(e)=>set("new_supplier_address",e.target.value)} placeholder="Optional address"/></Field></>}
    <Field label="Purchase amount" full><input required type="number" min="0.01" step="0.01" value={form.amount||""} onChange={(e)=>set("amount",e.target.value)} placeholder="Total purchase amount"/></Field>
    <Field label="Notes" full><input value={form.notes||""} onChange={(e)=>set("notes",e.target.value)} placeholder="Optional purchase notes"/></Field>
    {!item&&<Field label="Pay now (optional)"><input type="number" min="0" max={amount} step="0.01" value={form.initial_payment} onChange={(e)=>set("initial_payment",e.target.value)} placeholder="Leave blank to pay later"/></Field>}
    {!item&&Number(form.initial_payment)>0&&<Field label="Payment method"><select required value={form.payment_method} onChange={(e)=>set("payment_method",e.target.value)}><option value="">Select method</option>{["Cash","UPI","Bank Transfer","Card","Other"].map((m)=><option key={m}>{m}</option>)}</select></Field>}
    <div className="field full card" style={{background:"#f6f8f4"}}><div style={{display:"flex",justifyContent:"space-between"}}><span>Total amount</span><b>{money(amount)}</b></div><div style={{display:"flex",justifyContent:"space-between",marginTop:8}}><span>Paid amount</span><b>{money(paidAmount)}</b></div><div style={{display:"flex",justifyContent:"space-between",fontSize:18,marginTop:8}}><span>Balance amount</span><b style={{color:balanceAmount>0?"#a85b19":"#166534"}}>{money(balanceAmount)}</b></div></div>
  </div><div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-primary" disabled={!amount}><ShoppingCart size={17}/> Save purchase</button></div></form></Modal>;
}
function ExpensePaymentForm({expense,close,saved}) {
  const [form,setForm]=useState({payment_date:new Date().toLocaleDateString("en-CA"),amount:"",payment_method:"UPI",reference_number:"",notes:""}),[error,setError]=useState("");
  const set=(key,value)=>setForm((old)=>({...old,[key]:value}));
  async function submit(e){e.preventDefault();setError("");try{await api.post(`/expenses/${expense.id}/payments`,form);saved();}catch(failure){setError(failure.response?.data?.errors?.amount?.[0]||"Payment could not be recorded.");}}
  return <Modal title="Record expense payment" close={close}><form onSubmit={submit}><div className="modal-body form-grid"><Field label="Expense"><input readOnly value={expense.item_name||expense.description}/></Field><Field label="Supplier"><input readOnly value={expense.supplier?.name||expense.paid_to||"—"}/></Field><div className="field full payment-balance"><span>Outstanding balance</span><strong>{money(expense.balance_amount)}</strong></div>{error&&<div className="error field full">{error}</div>}<Field label="Payment date"><input required type="date" value={form.payment_date} onChange={(e)=>set("payment_date",e.target.value)}/></Field><Field label="Amount"><input autoFocus required type="text" inputMode="decimal" pattern="[0-9]+([.][0-9]{1,2})?" title="Enter an amount with up to two decimal places" value={form.amount} onChange={(e)=>set("amount",e.target.value)}/></Field><Field label="Payment method"><select value={form.payment_method} onChange={(e)=>set("payment_method",e.target.value)}>{["Cash","UPI","Bank Transfer","Card","Other"].map((m)=><option key={m}>{m}</option>)}</select></Field><Field label="Reference number"><input value={form.reference_number} onChange={(e)=>set("reference_number",e.target.value)}/></Field><Field label="Notes" full><input value={form.notes} onChange={(e)=>set("notes",e.target.value)}/></Field></div><div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-primary"><CreditCard size={17}/> Record payment</button></div></form></Modal>;
}
function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get(`/customers/${id}`).then((response) => setCustomer(response.data)).catch(() => setError("This customer could not be found.")); }, [id]);
  if (error) return <div className="card empty"><p>{error}</p><Link className="btn btn-primary" to="/customers">Back to customers</Link></div>;
  if (!customer) return <div className="empty">Loading customer details…</div>;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = customer.bookings.filter((booking) => booking.function_date >= today && !["Completed", "Cancelled"].includes(booking.status));
  const previous = customer.bookings.filter((booking) => !upcoming.includes(booking));
  return <>
    <div className="detail-head"><div><Link className="back-link" to="/customers"><ArrowLeft size={16}/> Back to customers</Link><div className="detail-title"><h2>{customer.name}</h2></div><p className="eyebrow">Customer since {new Date(customer.created_at).toLocaleDateString("en-IN", {month:"long", year:"numeric"})}</p></div><Link className="btn btn-primary" to={`/bookings?add=1&customer_id=${customer.id}&return=customer`}><Plus size={17}/> New booking</Link></div>
    <div className="stats detail-stats"><Stat label="Total bookings" value={customer.bookings.length} I={CalendarDays}/><Stat label="Upcoming functions" value={upcoming.length} I={Clock3}/><Stat label="Total business value" value={money(customer.total_business_value)} I={IndianRupee}/><Stat label="Pending payments" value={money(customer.pending_payments)} I={WalletCards}/></div>
    <div className="detail-grid"><div className="detail-main"><section className="card table-card detail-table"><div className="card-title detail-card-title"><h3>Upcoming bookings</h3><span className="muted">{upcoming.length} scheduled</span></div>{upcoming.length?<BookingTable rows={upcoming}/>:<div className="empty compact">No upcoming bookings.</div>}</section><section className="card table-card detail-table"><div className="card-title detail-card-title"><h3>Previous bookings</h3><span className="muted">Complete history</span></div>{previous.length?<BookingTable rows={previous}/>:<div className="empty compact">No previous bookings.</div>}</section></div><aside className="detail-side"><section className="card customer-card"><div className="avatar large">{customer.name.split(" ").map((part)=>part[0]).slice(0,2).join("")}</div><h3>{customer.name}</h3><p><Phone size={15}/>{customer.mobile}</p>{customer.alternate_mobile&&<p><Phone size={15}/>{customer.alternate_mobile}</p>}<p><MapPin size={15}/>{customer.place||"Place not added"}</p>{customer.email&&<p>{customer.email}</p>}{customer.address&&<p>{customer.address}</p>}</section>{customer.notes&&<section className="card"><div className="card-title"><h3>Notes</h3></div><p className="muted">{customer.notes}</p></section>}</aside></div>
  </>;
}

function CrudPage({ type, title, singular }) {
  const [rows, setRows] = useState([]),
    [modal, setModal] = useState(false),
    [edit, setEdit] = useState(null),
    [search, setSearch] = useState(""),
    [paymentBooking, setPaymentBooking] = useState(null),
    [paymentExpense, setPaymentExpense] = useState(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("booking_id");
  const [filters, setFilters] = useState({expense_type:"", paid_to:"", payment_status:""});
  const [sort, setSort] = useState({sort:"date", direction:"desc"});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterPayees, setFilterPayees] = useState([]);
  const [payeesLoading, setPayeesLoading] = useState(false);
  const [payeesError, setPayeesError] = useState("");
  const [payeesRetry, setPayeesRetry] = useState(0);
  const [listingError, setListingError] = useState("");
  const requestId = useRef(0);
  const changeFilter = (key, value) => { setFilters(current => ({...current, [key]:value})); setPage(1); };
  const changeSort = (key) => { setSort(current => ({sort:key, direction:current.sort === key && current.direction === "asc" ? "desc" : "asc"})); setPage(1); };
  const load = async () => {
    const currentRequest = ++requestId.current;
    setListingError("");
    try {
      const {data} = await api.get("/" + type, {params:{search, ...(type === "expenses" ? {...filters, ...sort, page, exclude_purchases:true} : {})}});
      if(currentRequest !== requestId.current) return;
      if(type === "expenses" && page > data.last_page) { setPage(data.last_page); return; }
      setRows(data.data); setLastPage(data.last_page);
    } catch { if(currentRequest === requestId.current) setListingError("Records could not be loaded. Please try again."); }
  };
  useEffect(() => { load(); return () => { requestId.current++; }; }, [type, search, filters, sort, page]);
  useEffect(() => {
    if(type !== "expenses") return;
    let active = true;
    setFilterPayees([]);
    setPayeesLoading(true);
    setPayeesError("");
    api.get("/expenses/payees", {params:{expense_type:filters.expense_type}}).then(({data})=>{
      if(!active) return;
      setFilterPayees(data);
      setFilters(current => {
        const name = current.paid_to.trim().replace(/\s+/g, " ").toLowerCase();
        if(!name || data.some(payee => payee.toLowerCase() === name)) return current;
        setPage(1);
        return {...current, paid_to:""};
      });
    }).catch(()=>{if(active) setPayeesError("Payee options could not be loaded.");})
      .finally(()=>{if(active) setPayeesLoading(false);});
    return () => { active = false; };
  }, [type, filters.expense_type, payeesRetry]);
  useEffect(() => {
    if (type === "payments" && params.get("add") === "1" && bookingId) {
      setEdit(null);
      api.get(`/bookings/${bookingId}`).then((response) => {
        setPaymentBooking(response.data);
        setModal(true);
      });
    }
  }, [params, type, bookingId]);
  async function del(x) {
    if (confirm(`Delete this ${singular.toLowerCase()}?`)) {
      await api.delete(`/${type}/${x.id}`);
      load();
    }
  }
  return (
    <>
      <PageTop
        title={title}
        sub={`Manage your ${title.toLowerCase()} and records`}
        action={type === "payments" ? undefined : () => {
          setEdit(null);
          setModal(true);
        }}
      />
      <div className="card table-card">
        <Toolbar search={search} setSearch={(value)=>{setSearch(value);setPage(1);}} />
        {type === "expenses" && <div className="expense-filters">
          <label>Type<select value={filters.expense_type} onChange={(e)=>changeFilter("expense_type",e.target.value)}><option value="">All types</option>{["Labour","Transport","Fuel","Rental","Gas","Miscellaneous","Other"].map(name=><option key={name}>{name}</option>)}</select></label>
          <label>Paid to<input type="search" list="expense-filter-payees" disabled={payeesLoading} placeholder={payeesLoading ? "Loading payees..." : "All payees - search names"} value={filters.paid_to} onChange={(e)=>changeFilter("paid_to",e.target.value)}/><datalist id="expense-filter-payees">{filterPayees.map(name=><option key={name} value={name}/>)}</datalist>{payeesError && <span role="alert">{payeesError} <button type="button" onClick={()=>setPayeesRetry(value=>value+1)}>Retry</button></span>}</label>
          <label>Payment status<select value={filters.payment_status} onChange={(e)=>changeFilter("payment_status",e.target.value)}><option value="">All</option><option value="pending">Pending</option><option value="paid">Fully paid</option></select></label>
          <button className="btn btn-ghost" onClick={()=>{setFilters({expense_type:"",paid_to:"",payment_status:""});setSearch("");setPage(1);}}>Clear filters</button>
        </div>}
        {listingError && <div role="alert" className="error">{listingError}<button className="btn btn-ghost" onClick={load}>Retry</button></div>}
        {rows.length ? (
          <table>
            <thead>
              <tr>
                {defs[type].cols.map((c) => (
                  <th key={c[0]} aria-sort={type === "expenses" && sort.sort === c[0] ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}>{type === "expenses" && ["date","expense_type","paid_to"].includes(c[0]) ? <button className="sort-heading" onClick={()=>changeSort(c[0])}>{c[1]} {sort.sort === c[0] ? (sort.direction === "asc" ? "?" : "?") : "?"}</button> : c[1]}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id}>
                  {defs[type].cols.map(([k, , fmt]) => (
                    <td key={k} className={k === "name" ? "strong" : ""}>
                      {type === "customers" && k === "name" ? <Link className="booking-link" to={`/customers/${x.id}`}>{x[k]}</Link> : type === "payments" && k === "booking_id" ? <Link className="booking-link" to={`/bookings/${x.booking_id}`}>{x.booking?.booking_number}</Link> : fmt === "money" ? money(x[k]) : String(x[k] ?? "—")}
                    </td>
                  ))}
                  <td>
                    <div className="actions">
                      {type === "customers" && <Link className="icon-btn" title="View customer details" to={`/customers/${x.id}`}><Eye size={15}/></Link>}
                      {type === "expenses" && x.balance_amount > 0 && <button title="Record partial payment" onClick={()=>setPaymentExpense(x)}><CreditCard size={15}/></button>}
                      <button
                        onClick={() => {
                          if (type === "expenses" && x.expense_type === "Purchase") { navigate("/purchases"); return; }
                          setEdit(x);
                          setModal(true);
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => del(x)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty />
        )}
      </div>
      {type === "expenses" && lastPage > 1 && <div className="expense-pagination"><button className="btn btn-ghost" disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {lastPage}</span><button className="btn btn-ghost" disabled={page>=lastPage} onClick={()=>setPage(page+1)}>Next</button></div>}
      {modal && (type === "payments" && paymentBooking ? (
        <PaymentForm
          booking={paymentBooking}
          close={() => { setModal(false); navigate("/payments"); }}
          saved={() => navigate(`/bookings/${bookingId}`)}
        />
      ) : (
        <CrudForm
          type={type}
          item={edit}
          defaults={type === "payments" && bookingId ? {booking_id: bookingId, payment_date: new Date().toISOString().slice(0,10), payment_mode:"UPI", payment_type:"Part Payment"} : type === "expenses" ? {date:new Date().toLocaleDateString("en-CA"),expense_type:"Labour",payment_method:""} : {}}
          close={() => setModal(false)}
          saved={() => {
            setModal(false);
            load();
            if (type === "payments" && bookingId) navigate(`/bookings/${bookingId}`);
          }}
          title={singular}
        />
      ))}
      {paymentExpense&&<ExpensePaymentForm expense={paymentExpense} close={()=>setPaymentExpense(null)} saved={()=>{setPaymentExpense(null);load();}}/>}
    </>
  );
}
function PaymentForm({ booking, close, saved }) {
  const [form, setForm] = useState({booking_id:booking.id,payment_date:new Date().toISOString().slice(0,10),amount:"",payment_mode:"UPI",payment_type:"Part Payment",reference_number:"",notes:""});
  const [error, setError] = useState("");
  const set = (key, value) => setForm((current) => ({...current, [key]:value}));
  async function submit(event) { event.preventDefault(); setError(""); try { await api.post("/payments", form); saved(); } catch (failure) { setError(failure.response?.data?.errors?.amount?.[0] || "Payment could not be recorded."); } }
  return <Modal title="Record booking payment" close={close}><form onSubmit={submit}><div className="modal-body form-grid">
    <Field label="Booking number"><input value={booking.booking_number} readOnly /></Field><Field label="Customer"><input value={booking.customer.name} readOnly /></Field>
    <div className="field full payment-balance"><span>Outstanding balance</span><strong>{money(booking.balance_amount)}</strong></div>{error&&<div className="error field full">{error}</div>}
    <Field label="Payment date"><input required type="date" value={form.payment_date} onChange={(e)=>set("payment_date",e.target.value)}/></Field><Field label="Amount"><input required autoFocus type="number" min="0.01" max={booking.balance_amount} step="0.01" value={form.amount} onChange={(e)=>set("amount",e.target.value)} placeholder={`Up to ${money(booking.balance_amount)}`}/></Field>
    <Field label="Payment type"><select value={form.payment_type} onChange={(e)=>set("payment_type",e.target.value)}><option>Part Payment</option><option>Final Payment</option><option>Advance</option></select></Field><Field label="Payment mode"><select value={form.payment_mode} onChange={(e)=>set("payment_mode",e.target.value)}>{["Cash","UPI","Bank Transfer","Card","Other"].map((mode)=><option key={mode}>{mode}</option>)}</select></Field>
    <Field label="Reference number"><input value={form.reference_number} onChange={(e)=>set("reference_number",e.target.value)} placeholder="Optional transaction reference"/></Field><Field label="Notes"><input value={form.notes} onChange={(e)=>set("notes",e.target.value)} placeholder="Optional notes"/></Field>
  </div><div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-primary"><CreditCard size={17}/> Record payment</button></div></form></Modal>;
}
function CrudForm({ type, item, defaults = {}, close, saved, title }) {
  const [f, setF] = useState(() => type === "packages" ? {...(item || defaults), item_ids: item?.items?.map((dish) => dish.id) || []} : item || defaults);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(type === "packages");
  const [menuError, setMenuError] = useState("");
  useEffect(() => {
    if (type !== "packages") return;
    let active = true;
    async function loadMenu() {
      try {
        const dishes = [];
        let page = 1, lastPage = 1;
        do {
          const {data} = await api.get("/menu-items", {params: {page, per_page: 100}});
          dishes.push(...data.data);
          lastPage = data.last_page;
          page++;
        } while (page <= lastPage);
        if (active) setMenuItems(dishes);
      } catch {
        if (active) setMenuError("Menu items could not be loaded. Close and reopen this form to retry.");
      } finally {
        if (active) setMenuLoading(false);
      }
    }
    loadMenu();
    return () => { active = false; };
  }, [type]);
  const [payees, setPayees] = useState([]);
  useEffect(() => {
    if (type !== "expenses") return;
    let active = true;
    api.get("/expenses/payees").then(({data}) => { if (active) setPayees(data); }).catch(() => { if (active) setPayees([]); });
    return () => { active = false; };
  }, [type]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const payload = {...f};
    if (type === "packages") delete payload.items;
    if (type === "expenses" && (payload.initial_payment === "" || payload.initial_payment == null)) delete payload.initial_payment;
    try {
      item
        ? await api.put(`/${type}/${item.id}`, payload)
        : await api.post("/" + type, payload);
      saved();
    } catch (failure) {
      const errors = failure.response?.data?.errors;
      setError(errors ? Object.values(errors).flat()[0] : failure.response?.data?.message || `The ${title.toLowerCase()} could not be saved.`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={(item ? "Edit " : "Add ") + title} close={close}>
      <form onSubmit={submit}>
        <div className="modal-body form-grid">
          {error && <div className="error field full">{error}</div>}
          {type === "expenses" && <datalist id="expense-payees">{payees.map((name) => <option key={name} value={name}/>)}</datalist>}
          {defs[type].fields.map(([k, l, t]) => (
            <Field key={k} label={l} full={k === "description" || k === "address"}>
              {type === "expenses" && k === "expense_type" ? <select required value={f[k] ?? "Labour"} onChange={(e) => setF({ ...f, [k]: e.target.value })}>{["Labour","Transport","Fuel","Rental","Gas","Miscellaneous","Other"].map((option)=><option key={option}>{option}</option>)}</select> : type === "expenses" && k === "payment_method" ? <select required={Number(f.initial_payment)>0} value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })}><option value="">Choose when paying now</option>{["Cash","UPI","Bank Transfer","Card","Other"].map((option)=><option key={option}>{option}</option>)}</select> : <input
                required={(type === "expenses" && k === "paid_to") || [
                  "name",
                  "mobile",
                  "date",
                  "expense_type",
                  "amount",
                  "payment_method",
                ].includes(k)}
                list={type === "expenses" && k === "paid_to" ? "expense-payees" : undefined}
                autoComplete={type === "expenses" && k === "paid_to" ? "off" : undefined}
                type={t || "text"}
                value={f[k] ?? ""}
                onChange={(e) => setF({ ...f, [k]: e.target.value })}
              />}
            </Field>
          ))}
        </div>
        {type === "packages" && <div className="modal-body">
          <fieldset style={{border: "1px solid #dce3dc", borderRadius: 8, padding: 16}}>
            <legend>Menu items ({f.item_ids.length} selected)</legend>
            {menuLoading ? <p>Loading menu items...</p> : menuError ? <p className="error">{menuError}</p> : menuItems.length ?
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, maxHeight: 280, overflowY: "auto"}}>
                {menuItems.map((dish) => <label key={dish.id} style={{display: "flex", alignItems: "center", gap: 8}}>
                  <input type="checkbox" style={{width: "auto"}} checked={f.item_ids.includes(dish.id)} onChange={(e) => setF((old) => ({...old, item_ids: e.target.checked ? [...old.item_ids, dish.id] : old.item_ids.filter((id) => id !== dish.id)}))}/>
                  <span>{dish.name} <small className="muted">{dish.category}</small></span>
                </label>)}
              </div> : <p>Add dishes on the <Link to="/menu-items">Menu Items page</Link>, then select them here.</p>}
          </fieldset>
        </div>}
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={close}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy || (type === "packages" && (menuLoading || !!menuError))}>
            {busy ? "Saving…" : `Save ${title.toLowerCase()}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Reports() { return <CashFlowReports Stat={Stat}/>; }
function SettingsPage() {
  return (
    <>
      <PageTop
        title="Settings"
        sub="Business profile and account preferences"
      />
      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-title">
          <h3>Business profile</h3>
        </div>
        <div className="form-grid">
          <Field label="Business name">
            <input defaultValue="SadyaPro Catering" />
          </Field>
          <Field label="Phone">
            <input defaultValue="+91 98470 00000" />
          </Field>
          <Field label="Email">
            <input defaultValue="hello@sadyapro.in" />
          </Field>
          <Field label="Currency">
            <input defaultValue="Indian Rupee (₹)" disabled />
          </Field>
          <Field label="Address" full>
            <textarea defaultValue="Thrissur, Kerala" />
          </Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 20 }}>
          Save settings
        </button>
      </div>
    </>
  );
}
function Stat({ label, value, I }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon green">
          <I size={18} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
function PageTop({ title, sub, action }) {
  return (
    <div className="page-top">
      <div>
        <p className="eyebrow">{sub}</p>
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="btn btn-primary" onClick={action}>
          <Plus size={18} /> Add new
        </button>
      )}
    </div>
  );
}
function Toolbar({ search, setSearch }) {
  return (
    <div className="toolbar">
      <div className="search">
        <Search size={17} />
        <input
          placeholder="Search records…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <select className="filter">
        <option>All records</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
    </div>
  );
}
function Field({ label, children, full }) {
  return (
    <div className={"field " + (full ? "full" : "")}>
      <label>{label}</label>
      {children}
    </div>
  );
}
function Modal({ title, close, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={close}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty() {
  return (
    <div className="empty">
      <ListChecks size={36} />
      <p>No records found. Add the first one to get started.</p>
    </div>
  );
}
export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  useEffect(() => {
    if (auth) return watchSession(() => setAuth(false));
  }, [auth]);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            auth ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={() => setAuth(true)} />
            )
          }
        />
        <Route
          path="/*"
          element={auth ? <Shell /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
