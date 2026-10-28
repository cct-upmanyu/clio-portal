import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Home from './pages/Home.jsx'
import Messages from './pages/Messages.jsx'
import Tasks from './pages/Tasks.jsx'
import Documents from './pages/Documents.jsx'
import Events from './pages/Events.jsx'
import Bills from './pages/Bills.jsx'
import ApiTest from './pages/ApiTest.jsx'
import Login from './pages/auth/Login.jsx'
import OtpRequest from './pages/auth/OtpRequest.jsx'
import OtpVerify from './pages/auth/OtpVerify.jsx'
import Invite from './pages/auth/Invite.jsx'
import SetPassword from './pages/auth/SetPassword.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Signed-in pages share the sidebar + top bar. TODO: redirect to /login when not authenticated */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/events" element={<Events />} />
          <Route path="/bills" element={<Bills />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/login/code" element={<OtpRequest />} />
        <Route path="/login/code/verify" element={<OtpVerify />} />
        <Route path="/invite/:token" element={<Invite />} />
        <Route path="/invite/:token/set-password" element={<SetPassword />} />

        <Route path="/api-test" element={<ApiTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
