<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentHistoryController extends Controller
{
    public function __invoke(Request $request)
    {
        $filters = $request->validate([
            'from'=>'nullable|date', 'to'=>'nullable|date|after_or_equal:from',
            'direction'=>'nullable|in:Income,Outgoing', 'source'=>'nullable|in:Booking,Expense,Purchase',
            'party'=>'nullable|string|max:255', 'method'=>'nullable|string|max:255',
            'page'=>'nullable|integer|min:1',
        ]);
        $income = DB::table('payments as p')->join('bookings as b','b.id','=','p.booking_id')->join('customers as c','c.id','=','b.customer_id')
            ->selectRaw("p.id, 'Income' as direction, 'Booking' as source, p.payment_date, p.amount, c.name as party, p.payment_mode as method, p.reference_number, p.notes, p.payment_type as description, b.id as record_id, b.booking_number as record_reference, b.final_amount as record_total, (select coalesce(sum(amount),0) from payments where booking_id=b.id) as record_paid, c.mobile as contact, b.venue as location, b.function_date as record_date, p.created_at");
        $outgoing = DB::table('expense_payments as p')->join('expenses as e','e.id','=','p.expense_id')->leftJoin('suppliers as s','s.id','=','e.supplier_id')
            ->selectRaw("p.id, 'Outgoing' as direction, case when lower(trim(e.expense_type))='purchase' then 'Purchase' else 'Expense' end as source, p.payment_date, p.amount, coalesce(nullif(e.paid_to,''),s.name) as party, p.payment_method as method, p.reference_number, p.notes, e.description, e.id as record_id, e.invoice_number as record_reference, e.amount as record_total, (select coalesce(sum(amount),0) from expense_payments where expense_id=e.id) as record_paid, s.mobile as contact, e.expense_type as location, e.date as record_date, p.created_at");
        $all = DB::query()->fromSub($income->unionAll($outgoing),'history');
        $parties = (clone $all)->whereNotNull('party')->distinct()->orderBy('party')->pluck('party');
        $methods = (clone $all)->whereNotNull('method')->distinct()->orderBy('method')->pluck('method');
        foreach (['direction','source'] as $key) if (!empty($filters[$key])) $all->where($key,$filters[$key]);
        if (!empty($filters['party'])) $all->where('party','like','%'.$filters['party'].'%');
        if (!empty($filters['method'])) $all->where('method',$filters['method']);
        if (!empty($filters['from'])) $all->where('payment_date','>=',$filters['from']);
        if (!empty($filters['to'])) $all->where('payment_date','<=',$filters['to']);
        $received = (float)(clone $all)->where('direction','Income')->sum('amount');
        $paid = (float)(clone $all)->where('direction','Outgoing')->sum('amount');
        if ($request->routeIs('reports.cash-flow')) {
            $expenses = (float)(clone $all)->where('source','Expense')->sum('amount');
            $purchases = (float)(clone $all)->where('source','Purchase')->sum('amount');
            return response()->json([
                'rows'=>$all->orderBy('payment_date')->orderBy('direction')->orderBy('id')->get(),
                'totals'=>['received'=>$received,'paid'=>$paid,'net'=>round($received-$paid,2),'expenses'=>$expenses,'purchases'=>$purchases],
                'current'=>$this->currentBalances(),
            ]);
        }
        $page = $all->orderByDesc('payment_date')->orderByDesc('created_at')->orderBy('direction')->orderByDesc('id')->paginate(25);
        $page->getCollection()->transform(function ($row) {
            $row->key = $row->direction.'-'.$row->id;
            $row->record_balance = max(0,round($row->record_total-$row->record_paid,2));
            return $row;
        });
        return response()->json(['payments'=>$page,'totals'=>['received'=>$received,'paid'=>$paid,'net'=>round($received-$paid,2)],'parties'=>$parties,'methods'=>$methods]);
    }

    private function currentBalances(): array
    {
        $bookings = DB::table('bookings as b')->where('status','!=','Cancelled')
            ->selectRaw('final_amount as total, final_amount - (select coalesce(sum(amount),0) from payments where booking_id=b.id) as balance');
        $receivables = DB::query()->fromSub($bookings,'balances')
            ->selectRaw('coalesce(sum(total),0) as total, coalesce(sum(case when balance > 0 then balance else 0 end),0) as pending')->first();
        $bills = DB::table('expenses as e')->selectRaw("amount as total, lower(trim(expense_type)) as type, amount - (select coalesce(sum(amount),0) from expense_payments where expense_id=e.id) as balance");
        $payables = DB::query()->fromSub($bills,'balances')
            ->selectRaw("coalesce(sum(total),0) as total, coalesce(sum(case when balance > 0 then balance else 0 end),0) as pending, coalesce(sum(case when balance > 0 and type = 'purchase' then balance else 0 end),0) as purchases, coalesce(sum(case when balance > 0 and type != 'purchase' then balance else 0 end),0) as expenses")->first();
        return [
            'booking_value'=>round((float)$receivables->total,2),
            'receivables'=>round((float)$receivables->pending,2),
            'recorded_costs'=>round((float)$payables->total,2),
            'payables'=>round((float)$payables->pending,2),
            'expense_payables'=>round((float)$payables->expenses,2),
            'purchase_payables'=>round((float)$payables->purchases,2),
        ];
    }
}
