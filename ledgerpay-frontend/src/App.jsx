import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import MyAccount from './pages/MyAccount';
import Transactions from './pages/Transactions';

import './App.css';

function Placeholder({ title }) {
    return (
        <div style={{ padding: '2rem' }}>
            <h2>{title}</h2>
            <p>
                This page will be implemented in a later step.
            </p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>

            <div className="app">

                <Routes>

                    {/* Authentication */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    {/* Customer Dashboard */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* My Account */}

                    <Route
                        path="/my-account"
                        element={<MyAccount />}
                    />

                    {/* Money Transfer */}

                    <Route
                        path="/transfer"
                        element={<Transfer />}
                    />

                    {/* Transactions */}

                    <Route
                        path="/transactions"
                        element={<Transactions />}
                    />

                    {/* Admin */}

                    <Route
                        path="/admin"
                        element={
                            <Placeholder title="Admin" />
                        }
                    />

                    {/* Fallback */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                </Routes>

            </div>

        </BrowserRouter>
    );
}

export default App;