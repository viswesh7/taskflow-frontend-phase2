import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import Layout from './layouts/Layout';
export default function App(){const {user}=useAuth();return <Routes><Route path="/auth" element={user?<Navigate to="/" replace/>:<AuthPage/>}/><Route element={user?<Layout/>:<Navigate to="/auth" replace/>}><Route path="/" element={<Dashboard/>}/><Route path="/categories" element={<CategoriesPage/>}/></Route><Route path="*" element={<Navigate to={user?'/':'/auth'} replace/>}/></Routes>}
