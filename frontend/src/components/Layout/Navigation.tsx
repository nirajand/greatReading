import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, BarChart3, Library, LogOut, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import GlassCard from '../GlassCard'

export default function Navigation() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/dashboard', icon: BookOpen, label: 'Dashboard' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <GlassCard className="mx-4 mt-4 rounded-2xl" blur="strong">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Obsidian Glass
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User & Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search library..."
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-medium">{user?.username}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </nav>
  )
}