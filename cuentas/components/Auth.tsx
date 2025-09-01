import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  AuthError
} from 'firebase/auth';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-400">Cuentas</h1>
            <p className="mt-2 text-gray-400">
              {isLogin ? '¡Bienvenido de nuevo! Inicia sesión.' : 'Crea una cuenta para empezar.'}
            </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Dirección de Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-300">Contraseña</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>
        <div className="text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-cyan-400 hover:text-cyan-300">
            {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;