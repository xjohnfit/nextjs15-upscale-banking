import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { transactionCategoryStyles } from "@/constants"
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils"

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const {
    borderColor,
    backgroundColor,
    textColor,
    chipBackgroundColor,
   } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default
   
  return (
    <div className={cn('category-badge', borderColor, chipBackgroundColor)}>
      <div className={cn('size-2 rounded-full', backgroundColor)} />
      <p className={cn('text-[12px] font-medium', textColor)}>{category.primary}</p>
    </div>
  )
} 

const TransactionsTable = ({ transactions }: TransactionTableProps) => {

  

  return (
    <Table className="!border-DEFAULT !border-b-0 w-full">
      <TableHeader className="bg-[#f9fafb]">
        <TableRow>
          <TableHead className="px-1 py-2 whitespace-nowrap">Transaction</TableHead>
          <TableHead className="px-1 py-2 whitespace-nowrap">Amount</TableHead>
          <TableHead className="px-1 py-2 whitespace-nowrap">Status</TableHead>
          <TableHead className="px-1 py-2 whitespace-nowrap">Date</TableHead>
          <TableHead className="px-1 py-2 max-md:hidden whitespace-nowrap">Channel</TableHead>
          <TableHead className="px-1 py-2 max-md:hidden whitespace-nowrap">Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t: Transaction) => {
          const status = getTransactionStatus(new Date(t.date))
          const amount = formatAmount(t.amount)

          const isDebit = t.type === 'debit';
          const isCredit = t.type === 'credit';

          return (
            <TableRow key={t.id} className={`${isDebit || amount[0] === '-' ? 'bg-[#FFFBFA]' : 'bg-[#F6FEF9]'} !over:bg-none !border-b-DEFAULT`}>
              <TableCell className="max-w-[180px] pl-1 pr-2 py-2 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <h1 className="text-14 truncate font-semibold text-[#344054]">
                    {removeSpecialCharacters(t.name)}
                  </h1>
                </div>
              </TableCell>

              <TableCell className={`pl-1 pr-2 py-2 font-semibold whitespace-nowrap ${
                isDebit || amount[0] === '-' ?
                  'text-[#f04438]'
                  : 'text-[#039855]'
              }`}>
                {isDebit ? `-${amount}` : isCredit ? amount : amount}
              </TableCell>

              <TableCell className="pl-1 pr-2 py-2 whitespace-nowrap">
                <p
                  className={cn(
                    "rounded px-2 py-1",
                    status === "Success"
                      ? "bg-green-50 text-green-700"
                      : status === "Processing"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {status}
                </p>
              </TableCell>

              <TableCell className="min-w-24 pl-1 pr-2 py-2 text-sm text-gray-500 whitespace-nowrap">
                {formatDateTime(new Date(t.date)).dateTime}
              </TableCell>

              <TableCell className="pl-1 pr-2 py-2 min-w-20 whitespace-nowrap">
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                    t.paymentChannel === "online"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {t.paymentChannel === "online" ? "Online" : "In Store"}
                </span>
              </TableCell>

              <TableCell className="pl-1 pr-2 py-2 max-md:hidden whitespace-nowrap">
                <CategoryBadge category={t.category} /> 
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default TransactionsTable