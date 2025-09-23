import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';

/**
 * @component SalesDashboard
 * @description A dashboard component that provides detailed sales analytics, including key metrics,
 * performance by breed, monthly trends, and recent transactions.
 * @returns {React.ReactElement} The rendered sales analytics dashboard.
 */
const SalesDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-analytics', timeRange],
    queryFn: () => adminApi.getSalesAnalytics(timeRange)
  });

  const { data: transactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => adminApi.getTransactions({ limit: 5 })
  });

  /**
   * Formats a numeric amount into a USD currency string.
   * Assumes the amount is provided in cents.
   * @param {number} amount - The amount in cents.
   * @returns {string} The formatted currency string (e.g., "$456.78").
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Assuming amounts are in cents
  };

  const salesMetrics = {
    totalRevenue: 45678,
    monthlyGrowth: 12.5,
    totalSales: 47,
    salesGrowth: 8.2,
    avgOrderValue: 971,
    avgGrowth: 5.1,
    conversionRate: 3.2,
    conversionGrowth: -0.3
  };

  const breedSales = [
    { breed: 'Golden Retriever', sales: 15, revenue: 18750, growth: 15.2 },
    { breed: 'Labrador', sales: 12, revenue: 14400, growth: 8.7 },
    { breed: 'French Bulldog', sales: 8, revenue: 12800, growth: -2.1 },
    { breed: 'German Shepherd', sales: 7, revenue: 10150, growth: 22.3 },
    { breed: 'Poodle', sales: 5, revenue: 7500, growth: 11.1 }
  ];

  const monthlySales = [
    { month: 'Jan', sales: 12, revenue: 14400 },
    { month: 'Feb', sales: 15, revenue: 18000 },
    { month: 'Mar', sales: 18, revenue: 21600 },
    { month: 'Apr', sales: 22, revenue: 26400 },
    { month: 'May', sales: 25, revenue: 30000 },
    { month: 'Jun', sales: 28, revenue: 33600 }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">Track revenue, sales performance, and trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.totalRevenue * 100)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +{salesMetrics.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.totalSales}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +{salesMetrics.salesGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.avgOrderValue * 100)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +{salesMetrics.avgGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
              {Math.abs(salesMetrics.conversionGrowth)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales by Breed */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Breed</CardTitle>
            <CardDescription>Performance breakdown by dog breed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {breedSales.map((item, index) => (
                <div key={item.breed} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.breed}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.sales} sold</Badge>
                        <span className={`text-sm flex items-center ${item.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          {Math.abs(item.growth)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Revenue: {formatCurrency(item.revenue * 100)}</span>
                      <span>Avg: {formatCurrency((item.revenue / item.sales) * 100)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
            <CardDescription>Sales and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlySales.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium w-10">{month.month}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Sales: {month.sales}</span>
                        <span className="text-sm font-medium">{formatCurrency(month.revenue * 100)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(month.sales / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest sales and payments</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions?.data?.slice(0, 5).map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.customer_name || 'Guest Customer'}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.puppy_name || 'Puppy Purchase'} • #{transaction.id.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                  <Badge className={
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            )) || [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboard;