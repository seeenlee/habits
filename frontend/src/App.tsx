import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HabitsList from './pages/HabitsList';
import HabitDetail from './pages/HabitDetail';
import StatsPage from './pages/Stats';
import Charts from './pages/Charts';
import HabitForm from './components/HabitForm';
import HabitEditForm from './components/HabitEditForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<HabitsList />} />
            <Route path="/habits/new" element={<HabitForm />} />
            <Route path="/habits/:id" element={<HabitDetail />} />
            <Route path="/habits/:id/edit" element={<HabitEditForm />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/charts" element={<Charts />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
