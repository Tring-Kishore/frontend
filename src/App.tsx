import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './Pages/Routes/PublicRoute';
import ProtectedRoute from './Pages/Routes/ProtectedRoute';
import SignIn from './Pages/Auth/SignIn/SignIn';
import SignUp from './Pages/Auth/SignUp/SignUp';
import Dashboard from './Pages/Dashboard/Dashboard';
import JobPostPage from './Components/JobPostPage/JobPostPage';
import CompanyPage from './Components/CompanyPage/CompanyPage';
import ApplicationsPage from './Components/ApplicationsPage/ApllicationsPage';
import UserPage from './Components/UserPage/UserPage';
import Content from './Components/CustomContent/Content';
import UpdatePassword from './Components/UpdatePassword/UpdatePassword';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import UserDetails from './Components/UserDetails/UserDetails';
import Loader from './Components/Loader/Loader';

const App = () => {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  const publicRoutes = [
    { path: "/signin", element: <SignIn/> },
    { path: "/signup", element: <SignUp /> },
  ];

  const privateRoutes = [
    {
      path: "/dashboard",
      element: <Dashboard />,
      children: [
        { path: "", element: <Content /> },
        { path: "job-posts", element: <JobPostPage /> },
        { path: "companies", element: <CompanyPage /> },
        { path: "applications", element: <ApplicationsPage /> },
        { path: "users", element: <UserPage /> },
      ],
    },
    { path: "/update-password", element: <UpdatePassword /> },
    {path:"/editprofile",element: <UserDetails/>},
  ];

  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/signin" />} />

        
        <Route element={<PublicRoute/>}>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        
        <Route element={<ProtectedRoute/>}>
          {privateRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element}>
              {route.children && route.children.map((child) => (
                <Route key={child.path} path={child.path} element={child.element} />
              ))}
            </Route>
          ))}
        </Route>
        <Route path="*" element={<Navigate to={localStorage.getItem('token') ? '/dashboard' : '/signin'} />} />
      </Routes>
      <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    }}
    />
      
    </Router>
  );
};

export default App;
