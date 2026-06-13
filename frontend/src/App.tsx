 import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Home from './pages/Home';
import Result from './pages/Result';
import View from './pages/View';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/result/:shortCode" element={<Result />} />
              <Route path="/view/:shortCode" element={<View />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;