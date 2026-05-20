import { useState } from 'react';

function App() {
  const API_BASE = 'https://api-ratelimiter.onrender.com';
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/users/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setResponse({ message: 'Login successful!', data });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User', email, password, mobile: '1234567890' }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setResponse({ message: 'Registration successful!', data });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async (endpoint) => {
    if (!token) {
      setError('Please login first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const limit = res.headers.get('x-ratelimit-limit');
      const remaining = res.headers.get('x-ratelimit-remaining');
      const retryAfter = res.headers.get('retry-after');
      
      const data = await res.json().catch(() => ({}));
      
      setResponse({
        status: res.status,
        limit,
        remaining,
        retryAfter,
        data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans text-gray-800">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold tracking-wide">API Rate Limiter Test</h1>
          <p className="mt-2 text-blue-100 font-medium">Test various rate limiting algorithms</p>
        </header>

        <div className="p-8 flex flex-col gap-8">
          {!token ? (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">Authentication</h2>
              <form className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex justify-between items-center">
                <span className="text-green-800 font-medium flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                  Authenticated as {email}
                </span>
                <button
                  onClick={() => { setToken(''); setResponse(null); }}
                  className="text-sm bg-white border border-green-300 text-green-700 px-3 py-1 rounded hover:bg-green-100 transition-colors"
                >
                  Logout
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Algorithms</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'fixed', name: 'Fixed Window', color: 'from-purple-500 to-purple-600' },
                    { id: 'sliding', name: 'Sliding Window', color: 'from-pink-500 to-pink-600' },
                    { id: 'token', name: 'Token Bucket', color: 'from-orange-500 to-orange-600' },
                    { id: 'leaky', name: 'Leaky Bucket', color: 'from-teal-500 to-teal-600' },
                  ].map((algo) => (
                    <button
                      key={algo.id}
                      onClick={() => testEndpoint(algo.id)}
                      disabled={loading}
                      className={`bg-gradient-to-r ${algo.color} hover:brightness-110 text-white py-4 rounded-xl font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50`}
                    >
                      {algo.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 animate-pulse">
              <strong>Error:</strong> {error}
            </div>
          )}

          {response && (
            <div className="bg-gray-800 text-gray-100 p-6 rounded-xl shadow-inner font-mono text-sm overflow-hidden">
              <h3 className="text-gray-400 mb-3 uppercase text-xs font-bold tracking-wider">Response Details</h3>
              {response.status && (
                <div className="flex gap-4 mb-4 border-b border-gray-700 pb-4">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Status</span>
                    <span className={`text-lg font-bold ${response.status === 429 ? 'text-red-400' : 'text-green-400'}`}>
                      {response.status}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Limit</span>
                    <span className="text-lg font-bold text-blue-300">{response.limit || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Remaining</span>
                    <span className="text-lg font-bold text-yellow-300">{response.remaining || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Retry After</span>
                    <span className="text-lg font-bold text-orange-300">{response.retryAfter ? `${response.retryAfter}s` : '-'}</span>
                  </div>
                </div>
              )}
              <pre className="whitespace-pre-wrap overflow-x-auto text-blue-100">
                {JSON.stringify(response.data || response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
