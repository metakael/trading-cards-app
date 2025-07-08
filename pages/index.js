// Event Companion App - User-Facing
// File: /pages/index.js (Login Page)
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '../lib/firebase'; // Ensure you have this file

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Check for quest redirect
      const { redirect_url } = router.query;
      if (redirect_url) {
        router.push(decodeURIComponent(redirect_url));
      } else {
        router.push('/profile');
      }
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-purple-400 mb-6">Event Companion</h1>
        <p className="text-center text-gray-400 mb-8">Login to start your adventure!</p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}