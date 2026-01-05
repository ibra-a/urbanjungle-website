import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    lowStock: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Today's orders (all stores)
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today);
      
      // Pending orders (all stores)
      const { data: pending } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending');
      
      // Low stock products (Urban Jungle)
      const { data: lowStock } = await supabase
        .from('urban_products')
        .select('*')
        .lt('stock_quantity', 10)
        .gt('stock_quantity', 0);
      
      // Recent orders (all stores)
      const { data: recent } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setStats({
        todayOrders: todayOrders?.length || 0,
        todayRevenue: todayOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        pendingOrders: pending?.length || 0,
        lowStock: lowStock?.length || 0
      });
      
      setRecentOrders(recent || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const StatCard = ({ icon: Icon, label, value, color, link }) => (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:border-gray-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
          {link && (
            <Link to={link} className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
              View all →
            </Link>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to Admin Dashboard - Tommy CK & Urban Jungle</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={ShoppingBag}
          label="Today's Orders"
          value={stats.todayOrders}
          color="bg-blue-500"
          link="/admin/orders"
        />
        <StatCard 
          icon={DollarSign}
          label="Today's Revenue"
          value={`${stats.todayRevenue.toLocaleString()} DJF`}
          color="bg-green-500"
        />
        <StatCard 
          icon={Package}
          label="Pending Orders"
          value={stats.pendingOrders}
          color="bg-yellow-500"
          link="/admin/orders?filter=pending"
        />
        <StatCard 
          icon={TrendingUp}
          label="Low Stock Items"
          value={stats.lowStock}
          color="bg-red-500"
          link="/admin/products"
        />
      </div>
      
      {/* Recent Orders */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-blue-400 hover:text-blue-300">
              View all orders →
            </Link>
          </div>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-700/50">
                    <td className="py-4 px-6 text-sm font-medium text-white">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-300">
                      {order.customer_name || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-white">
                      {order.total_amount?.toLocaleString() || 0} DJF
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-900/50 text-green-300 border border-green-700' :
                        order.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                        order.status === 'processing' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                        'bg-gray-700 text-gray-300 border border-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

