import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setMessage(error.message)
      else setMessage('Logged in successfully!')
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#12151e] p-8 rounded-2xl shadow-2xl border border-slate-800 text-white w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>

      {message && (
        <div className="mb-4 p-3 bg-indigo-600/30 border border-indigo-500 rounded-lg text-sm text-center text-indigo-200">
          {message}
        </div>
      )}

      <form onSubmit={handleAuth} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#1e2330] border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#1e2330] border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setMessage('')
          }}
          className="text-gray-400 hover:text-indigo-400 text-sm font-medium transition-colors cursor-pointer"
        >
          {isSignUp ? (
            <span>Already have an account? <strong className="text-indigo-400 underline ml-1">Sign In</strong></span>
          ) : (
            <span>Don't have an account? <strong className="text-indigo-400 underline ml-1">Sign Up</strong></span>
          )}
        </button>
      </div>
    </div>
  )
}