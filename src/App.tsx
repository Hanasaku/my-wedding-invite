import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Access from '@/pages/Access'
import GuestHasher from '@/pages/GuestHasher'

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Access />} />
                    <Route path="/hasher" element={<GuestHasher />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
