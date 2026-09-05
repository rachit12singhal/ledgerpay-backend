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
import Admin from './pages/Admin';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import './App.css';

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
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* My Account */}

                    <Route
                        path="/my-account"
                        element={
                            <ProtectedRoute>
                                <MyAccount />
                            </ProtectedRoute>
                        }
                    />

                    {/* Money Transfer */}

                    <Route
                        path="/transfer"
                        element={
                            <ProtectedRoute>
                                <Transfer />
                            </ProtectedRoute>
                        }
                    />

                    {/* Transactions */}

                    <Route
                        path="/transactions"
                        element={
                            <ProtectedRoute>
                                <Transactions />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Dashboard */}

                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
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