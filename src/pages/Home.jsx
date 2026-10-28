import { useState } from 'react'
import {
  useGetMeQuery,
  useLoginMutation,
  useUpdateMeMutation,
  useDeleteMeMutation,
} from '../redux/api/authApi'

const show = (result, fallback) => JSON.stringify(result.data ?? result.error ?? fallback, null, 2)

function Home() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const meQuery = useGetMeQuery()
  const [login, loginResult] = useLoginMutation()
  const [updateMe, updateResult] = useUpdateMeMutation()
  const [deleteMe, deleteResult] = useDeleteMeMutation()

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ name, password })
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600">Clio Manage Law Firm</h1>

      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <h2>GET /auth/me</h2>
      <button onClick={() => meQuery.refetch()}>Refetch</button>
      <pre>{show(meQuery, 'Loading...')}</pre>

      <h2>POST /auth/login</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loginResult.isLoading}>Login</button>
      </form>
      <pre>{show(loginResult, 'Not sent')}</pre>

      <h2>PUT /auth/me</h2>
      <button onClick={() => updateMe({ name, password })} disabled={updateResult.isLoading}>Update</button>
      <pre>{show(updateResult, 'Not sent')}</pre>

      <h2>DELETE /auth/me</h2>
      <button onClick={() => deleteMe({ name })} disabled={deleteResult.isLoading}>Delete</button>
      <pre>{show(deleteResult, 'Not sent')}</pre>
    </div>
  )
}

export default Home
