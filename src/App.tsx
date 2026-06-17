import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Inventory from '@/pages/Inventory'
import Warehousing from '@/pages/Warehousing'
import Storage from '@/pages/Storage'
import Outbound from '@/pages/Outbound'
import Safety from '@/pages/Safety'
import Emergency from '@/pages/Emergency'
import Supervision from '@/pages/Supervision'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/inventory" replace />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="warehousing" element={<Warehousing />} />
        <Route path="storage" element={<Storage />} />
        <Route path="outbound" element={<Outbound />} />
        <Route path="safety" element={<Safety />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="supervision" element={<Supervision />} />
      </Route>
    </Routes>
  )
}

export default App
