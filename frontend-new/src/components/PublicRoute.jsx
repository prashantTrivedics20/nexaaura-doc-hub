import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)'
      }}>
        <div style={{ color: '#8B5CF6', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;