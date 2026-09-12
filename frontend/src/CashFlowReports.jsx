import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Printer, IndianRupee, WalletCards, TrendingUp } from "lucide-react";
import api from "./api";

const money = value => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2}).format(Number(value || 0));

export default function CashFlowReports({Stat}) {
  const [dates,setDates] = useState({from:"",to:""});
  const [view,setView] = useState("Both");
  const [report,setReport] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [retry,setRetry] = useState(0);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError("");
    api.get("/reports/cash-flow",{params:dates}).then(({data})=>{if(active)setReport(data);}).catch(failure=>{
      if(active)setError(Object.values(failure.response?.data?.errors || {}).flat()[0] || "Reports could not be loaded.");
    }).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[dates,retry]);
  return <div className="cash-flow-report">
    <div className="page-top"><div><p className="eyebrow">Financial overview</p><h2>Income and outgoing reports</h2></div><button className="btn btn-ghost" disabled={loading || !!error || !report} onClick={()=>window.print()}><Printer size={17}/> Print report</button></div>
    <div className="report-summary-groups" aria-busy={loading}>
      {[
        {title:"Payment activity",note:"Selected payment dates",tiles:[
          ["Income received",report?.totals.received,IndianRupee],
          ["Outgoing paid",report?.totals.paid,WalletCards],
          ["Net cash flow",report?.totals.net,TrendingUp],
        ]},
        {title:"Outstanding balances",note:"Current balances across all records",tiles:[
          ["Pending receivables",report?.current.receivables,IndianRupee,"From non-cancelled bookings"],
          ["Pending payables",report?.current.payables,WalletCards,loading || error || !report ? "Expenses and purchases" : "Expenses: " + money(report.current.expense_payables) + " | Purchases: " + money(report.current.purchase_payables)],
        ]},
        {title:"Business totals",note:"All recorded bookings and bills",tiles:[
          ["Total booking value",report?.current.booking_value,IndianRupee,"Excludes cancelled bookings"],
          ["Total recorded costs",report?.current.recorded_costs,WalletCards,"Expense and purchase bills"],
        ]},
      ].map(group=><section className="report-summary-group" key={group.title}>
        <div className="report-summary-heading"><h3>{group.title}</h3><span>{group.note}</span></div>
        <div className={"stats report-summary-tiles " + (group.tiles.length === 2 ? "report-summary-pair" : "")}>
          {group.tiles.map(([label,value,Icon,note])=><div className="report-summary-tile" key={label}><Stat label={label} value={loading || error || !report ? "..." : money(value)} I={Icon}/>{note && <p>{note}</p>}</div>)}
        </div>
      </section>)}
    </div>
    <div className="card report-controls"><div className="expense-filters payment-history-filters">
      <label>From<input type="date" value={dates.from} max={dates.to || undefined} onChange={e=>setDates(current=>({...current,from:e.target.value}))}/></label>
      <label>To<input type="date" value={dates.to} min={dates.from || undefined} onChange={e=>setDates(current=>({...current,to:e.target.value}))}/></label>
      <label>Report<select value={view} onChange={e=>setView(e.target.value)}><option value="Both">Income and outgoing</option><option value="Income">Income only</option><option value="Outgoing">Outgoing only</option></select></label>
      <button className="btn btn-ghost" onClick={()=>{setDates({from:"",to:""});setView("Both");}}>Clear filters</button>
    </div></div>
    <p className="report-period">Payment dates: {dates.from || "Beginning"} to {dates.to || "Latest"}. Based on actual money received and paid out.</p>
    {loading ? <div className="empty" role="status">Loading reports...</div> : error ? <div className="error" role="alert">{error}<button className="btn btn-ghost" onClick={()=>setRetry(value=>value+1)}>Retry</button></div> : report && <>
      {view !== "Income" && <p>Expense payments: <strong>{money(report.totals.expenses)}</strong> · Purchase payments: <strong>{money(report.totals.purchases)}</strong></p>}
      {['Income','Outgoing'].filter(direction=>view === 'Both' || direction === view).map(direction=>{
        const rows=report.rows.filter(row=>row.direction === direction);
        return <section className="card table-card report-section" key={direction}>
          <div className="card-title report-section-title"><h3>{direction} report</h3><span>{rows.length} payments</span></div>
          {rows.length ? <div className="report-table-scroll"><table><thead><tr><th>Date</th><th>{direction === 'Income' ? 'Customer' : 'Paid to'}</th><th>Source / Reference</th><th>Description</th><th>Method</th><th>Transaction reference / Notes</th><th>Amount</th></tr></thead><tbody>
            {rows.map(row=><tr key={`${row.direction}-${row.id}`}><td>{row.payment_date}</td><td>{row.party || '—'}</td><td><Link to={row.source === 'Booking' ? `/bookings/${row.record_id}` : row.source === 'Purchase' ? '/purchases' : '/expenses'}>{row.record_reference || `${row.source} #${row.record_id}`}</Link><div className="muted">{row.source}</div></td><td>{row.description}</td><td>{row.method || '—'}</td><td>{row.reference_number || '—'}{row.notes && <div className="muted">{row.notes}</div>}</td><td className="money strong">{money(row.amount)}</td></tr>)}
          </tbody><tfoot><tr><th colSpan={6}>Total {direction.toLowerCase()}</th><th className="money">{money(direction === 'Income' ? report.totals.received : report.totals.paid)}</th></tr></tfoot></table></div> : <div className="empty">No {direction.toLowerCase()} payments in this period.</div>}
        </section>;
      })}
    </>}
  </div>;
}
