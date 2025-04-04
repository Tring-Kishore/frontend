import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../../Components/CustomSideBar/SideBar';
import TopBar from '../../Components/CustomTopBar/TopBar';
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../Auth/verifyToken';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        console.log('Decoded Token:', decoded);
        const { userId, role, name }  : any = decoded;
        console.log('User ID:', userId);
        console.log('User Type:', role);
        console.log('User Name:', name);
      } else {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);
  return (
    <div className="dashboardLayout">
      <div className="sideBarContainer">
        <SideBar />
      </div>
      <div className="mainContent">
        <div className="topBarContainer">
          <TopBar />
        </div>
        <div className="contentContainer">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;