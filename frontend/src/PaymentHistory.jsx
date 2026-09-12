import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, IndianRupee, WalletCards, TrendingUp } from "lucide-react";
import api from "./api";

const money = (value) => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",minimumFractionDigits:2}).format(Number(value || 0));
const emptyFilters = {from:"",to:"",direction:"",source:"",party:"",method:""};

export default function PaymentHistory({ Modal, Stat, PaymentForm }) {
  const [filters,setFilters] = useState(emptyFilters);
  const [page,setPage] = useState(1);
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [retry,setRetry] = useState(0);
  const [selected,setSelected] = useState(null);
  const [booking,setBooking] = useState(null);
  const [bookingError,setBookingError] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("add") === "1" ? params.get("booking_id") : null;
  useEffect(()=>{
    let active = true;
    setBooking(null); setBookingError("");
    if(bookingId) api.get(`/bookings/${bookingId}`).then(({data})=>{if(active)setBooking(data);}).catch(()=>{if(active)setBookingError("The booking could not be loaded.");});
    return ()=>{active=false;};
  },[bookingId]);
  useEffect(()=>{
    let active = true;
    setLoading(true); setError("");
    api.get("/payment-history",{params:{...filters,page}}).then(({data})=>{if(active)setResult(data);}).catch(failure=>{
      if(active)setError(Object.values(failure.response?.data?.errors || {}).flat()[0] || "Payment history could not be loaded.");
    }).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[filters,page,retry]);
  const change = (key,value)=>{setFilters(current=>({...current,[key]:value}));setPage(1);};
  const sourceLink = (row)=>row.source === "Booking" ? `/bookings/${row.record_id}` : row.source === "Purchase" ? "/purchases" : "/expenses";
  const reference = (row)=>row.record_reference || `${row.source} #${row.record_id}`;
  return <>
    <div className="page-top"><div><h2>Payments</h2><p>Booking income and outgoing expense and purchase payments</p></div></div>
    <div className="stats payment-history-stats" aria-busy={loading}>
      <Stat label="Received" value={loading || error ? "—" : money(result?.totals.received)} I={IndianRupee}/>
      <Stat label="Paid out" value={loading || error ? "—" : money(result?.totals.paid)} I={WalletCards}/>
      <Stat label="Net cash flow" value={loading || error ? "—" : money(result?.totals.net)} I={TrendingUp}/>
    </div>
    <div className="card table-card">
      <div className="expense-filters payment-history-filters">
        <label>From<input type="date" value={filters.from} max={filters.to || undefined} onChange={e=>change("from",e.target.value)}/></label>
        <label>To<input type="date" value={filters.to} min={filters.from || undefined} onChange={e=>change("to",e.target.value)}/></label>
        <label>Income / Outgoing<select value={filters.direction} onChange={e=>change("direction",e.target.value)}><option value="">All payments</option><option>Income</option><option>Outgoing</option></select></label>
        <label>Source<select value={filters.source} onChange={e=>change("source",e.target.value)}><option value="">All sources</option><option>Booking</option><option>Expense</option><option>Purchase</option></select></label>
        <label>Customer / Paid to<input type="search" list="payment-parties" placeholder="Search names" value={filters.party} onChange={e=>change("party",e.target.value)}/><datalist id="payment-parties">{result?.parties.map(name=><option key={name} value={name}/>)}</datalist></label>
        <label>Payment method<select value={filters.method} onChange={e=>change("method",e.target.value)}><option value="">All methods</option>{result?.methods.filter(Boolean).map(method=><option key={method}>{method}</option>)}</select></label>
        <button className="btn btn-ghost" onClick={()=>{setFilters(emptyFilters);setPage(1);}}>Clear filters</button>
      </div>
      {loading ? <div className="empty" role="status">Loading payments...</div> : error ? <div className="error" role="alert">{error}<button className="btn btn-ghost" onClick={()=>setRetry(value=>value+1)}>Retry</button></div> : result?.payments.data.length ? <div className="payment-history-scroll"><table>
        <thead><tr>{["Payment date","Income / Outgoing","Customer / Paid to","Source / Record","Description","Method","Transaction reference","Amount","Actions"].map(label=><th key={label}>{label}</th>)}</tr></thead>
        <tbody>{result.payments.data.map(row=><tr key={row.key} onClick={()=>setSelected(row)} className="payment-history-row">
          <td>{row.payment_date}</td><td><span className={`payment-direction ${row.direction.toLowerCase()}`}>{row.direction}</span></td><td>{row.party || "—"}</td>
          <td><Link to={sourceLink(row)} onClick={e=>e.stopPropagation()}>{reference(row)}</Link><div className="muted">{row.source}</div></td>
          <td>{row.description}</td><td>{row.method || "—"}</td><td>{row.reference_number || "—"}</td><td className="money strong">{money(row.amount)}</td>
          <td><button className="btn btn-ghost" aria-label={`View ${row.direction.toLowerCase()} payment ${row.id}`} onClick={e=>{e.stopPropagation();setSelected(row);}}><Eye size={16}/> Details</button></td>
        </tr>)}</tbody>
      </table></div> : <div className="empty">No payments match these filters.</div>}
    </div>
    {!loading && !error && result && <div className="expense-pagination"><span>{result.payments.total} payments · Page {page} of {result.payments.last_page}</span><button className="btn btn-ghost" disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><button className="btn btn-ghost" disabled={page>=result.payments.last_page} onClick={()=>setPage(page+1)}>Next</button></div>}
    {selected && <Modal title="Payment details" close={()=>setSelected(null)}><div className="modal-body"><dl className="payment-detail-grid">
      {[["Payment ID",selected.key],["Payment date",selected.payment_date],["Direction",selected.direction],["Source",selected.source],["Customer / Paid to",selected.party],["Contact",selected.contact],["Payment amount",money(selected.amount)],["Payment method",selected.method],["Transaction reference",selected.reference_number],["Description / Payment type",selected.description],["Linked record",reference(selected)],["Record date",selected.record_date],[selected.source === "Booking" ? "Venue" : "Expense type",selected.location],["Record total",money(selected.record_total)],["Total paid to date",money(selected.record_paid)],["Current remaining balance",money(selected.record_balance)],["Recorded at",selected.created_at],["Payment notes",selected.notes]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>)}
      </dl></div><div className="modal-foot"><button className="btn btn-ghost" onClick={()=>setSelected(null)}>Close</button><Link className="btn btn-primary" to={sourceLink(selected)}>Open {selected.source === "Booking" ? "booking" : selected.source === "Purchase" ? "Purchases" : "Expenses"}</Link></div></Modal>}
    {bookingId && !booking && <div role="status">{bookingError || "Loading booking..."} <button className="btn btn-ghost" onClick={()=>navigate("/payments")}>Cancel</button></div>}
    {booking && <PaymentForm booking={booking} close={()=>navigate("/payments")} saved={()=>navigate(`/bookings/${booking.id}`)}/>}
  </>;
}
