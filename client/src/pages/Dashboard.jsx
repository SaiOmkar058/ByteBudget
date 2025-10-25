import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="flex justify-between items-center" style={{marginBottom: '2rem'}}>
        <h1>Dashboard</h1>
        <button onClick={logout} className="btn btn-outline">
          Logout
        </button>
      </div>
      
      <div className="card">
        <h2>Welcome, {user?.name}! 👋</h2>
        <p style={{marginTop: '1rem', color: 'var(--text-secondary)'}}>
          Your ByteBudget dashboard is coming soon...
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
