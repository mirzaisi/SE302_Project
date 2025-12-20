import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@renderer/components/layout/Layout'
import { Dashboard } from '@renderer/pages/Dashboard'
import { DataManagement } from '@renderer/pages/DataManagement'
import { Configuration } from '@renderer/pages/Configuration'
import { ScheduleGeneration } from '@renderer/pages/ScheduleGeneration'
import { ScheduleView } from '@renderer/pages/ScheduleView'
import { Help } from '@renderer/pages/Help'

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/config" element={<Configuration />} />
          <Route path="/generate" element={<ScheduleGeneration />} />
          <Route path="/view" element={<ScheduleView />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
