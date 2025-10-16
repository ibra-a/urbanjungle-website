import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const AdminRoute = ({ children }) => {
  const { state } = useApp();
  const { user } = state;
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setIsAdmin(data?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/account" replace />;
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Home
          </a>
        </div>
      </div>
    );
  }
  
  return children;
};

export default AdminRoute;

