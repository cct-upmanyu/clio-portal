import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GuestOnly from './components/auth/GuestOnly.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import PortalLayout, { ByPortal, PortalOnly } from './components/layout/PortalLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminMatters from './pages/admin/Matters.jsx'
import AdminMatterDetail from './pages/admin/MatterDetail.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import Home from './pages/Home.jsx'
import Messages from './pages/Messages.jsx'
import Tasks from './pages/Tasks.jsx'
import Documents from './pages/Documents.jsx'
import Events from './pages/Events.jsx'
import Bills from './pages/Bills.jsx'
import Settings from './pages/settings/Settings.jsx'
import SecuritySettings from './pages/settings/SecuritySettings.jsx'
import Login from './pages/auth/Login.jsx'
import MfaSetup from './pages/auth/MfaSetup.jsx'
import MfaVerify from './pages/auth/MfaVerify.jsx'
import OtpRequest from './pages/auth/OtpRequest.jsx'
import OtpVerify from './pages/auth/OtpVerify.jsx'
import Invite from './pages/auth/Invite.jsx'
import SetPassword from './pages/auth/SetPassword.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import MatterInvite from './pages/auth/MatterInvite.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Clients get the client portal, firm staff the admin console (ADMIN_LAYOUT_ROLE_IDS on the backend) */}
        <Route element={<RequireAuth><PortalLayout /></RequireAuth>}>
          <Route path="/" element={<ByPortal client={<Home />} admin={<AdminDashboard />} />} />
          <Route element={<PortalOnly portal="client" />}>
            <Route path="/messages" element={<Messages />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/events" element={<Events />} />
            <Route path="/bills" element={<Bills />} />
          </Route>
          <Route element={<PortalOnly portal="admin" />}>
            <Route path="/matters" element={<AdminMatters />} />
            <Route path="/matters/:matterId" element={<AdminMatterDetail />} />
            <Route path="/users" element={<AdminUsers />} />
          </Route>
          <Route path="/settings" element={<Settings />}>
            <Route index element={<Navigate to="security" replace />} />
            <Route path="security" element={<SecuritySettings />} />
          </Route>
        </Route>

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/login/mfa" element={<MfaVerify />} />
          <Route path="/login/mfa/setup" element={<MfaSetup />} />
          <Route path="/login/code" element={<OtpRequest />} />
          <Route path="/login/code/verify" element={<OtpVerify />} />
          <Route path="/invite/:token" element={<Invite />} />
          <Route path="/invite/:token/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Signed in, but before the matter check: it may be how they get their first matter */}
        <Route path="/matter-invite/:token" element={<RequireAuth><MatterInvite /></RequireAuth>} />

        {/* Works signed in or out: the emailed link is the proof */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
