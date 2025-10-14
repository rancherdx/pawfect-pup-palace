import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function FinancialOverview() {
  const stats = [
    { label: "Total Revenue", value: "$45,230", icon: DollarSign },
    { label: "Outstanding", value: "$3,450", icon: AlertCircle },
    { label: "This Month", value: "$12,450", icon: TrendingUp },
    { label: "Payment Methods", value: "3", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Management</h2>
        <p className="text-muted-foreground">Track transactions and manage payment methods</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/admin/financial/transactions">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View all financial transactions and payment history</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/financial/payment-methods">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure Square, Stripe, and other payment processors</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
