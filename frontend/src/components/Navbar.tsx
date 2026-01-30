import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="border-b bg-card px-8 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
        <BookOpen /> GreatReading
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/library">Library</Link>
        <Link to="/dictionary">Dictionary</Link>
        <Link to="/stats"><BarChart2 size={18} /></Link>
        <button onClick={logout} className="text-destructive"><LogOut size={18}/></button>
      </div>
    </nav>
  );
};
export default Navbar;