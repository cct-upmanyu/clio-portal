import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GuestOnly from './components/auth/GuestOnly.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import Home from './pages/Home.jsx'
import Messages from './pages/Messages.jsx'
import Tasks from './pages/Tasks.jsx'
import Documents from './pages/Documents.jsx'
import Events from './pages/Events.jsx'
import Bills from './pages/Bills.jsx'
import Login from './pages/auth/Login.jsx'
import MfaSetup from './pages/auth/MfaSetup.jsx'
import MfaVerify from './pages/auth/MfaVerify.jsx'
import OtpRequest from './pages/auth/OtpRequest.jsx'
import OtpVerify from './pages/auth/OtpVerify.jsx'
import Invite from './pages/auth/Invite.jsx'
import SetPassword from './pages/auth/SetPassword.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/" element={<Home />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/events" element={<Events />} />
          <Route path="/bills" element={<Bills />} />
        </Route>

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/login/mfa" element={<MfaVerify />} />
          <Route path="/login/mfa/setup" element={<MfaSetup />} />
          <Route path="/login/code" element={<OtpRequest />} />
          <Route path="/login/code/verify" element={<OtpVerify />} />
          <Route path="/invite/:token" element={<Invite />} />
          <Route path="/invite/:token/set-password" element={<SetPassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
