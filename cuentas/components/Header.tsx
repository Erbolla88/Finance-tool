import React from 'react';
import { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Icon } from './common/Icon';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Icon name="logo" className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold text-white">Cuentas</span>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
             <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
             >
                <Icon name="logout" className="h-5 w-5" />
                <span>Salir</span>
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;