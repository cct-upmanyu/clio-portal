import { useState } from 'react'
import { useGetMeQuery, useLoginMutation } from '../redux/api/authApi'

function Home() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const meQuery = useGetMeQuery()
  const [login, loginResult] = useLoginMutation()

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ name, password })
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600">Clio Manage Law Firm</h1>

      <h2>GET /auth/me</h2>
      <button onClick={() => meQuery.refetch()}>Refetch</button>
      <pre>{JSON.stringify(meQuery.data ?? meQuery.error ?? 'Loading...', null, 2)}</pre>

      <h2>POST /auth/login</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loginResult.isLoading}>Login</button>
      </form>
      <pre>{JSON.stringify(loginResult.data ?? loginResult.error ?? 'Not sent', null, 2)}</pre>
    </div>
  )
}

export default Home
