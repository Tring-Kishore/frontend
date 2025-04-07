import React, { useState, useEffect } from 'react';
import './TopBar.scss';
import profilePic from '../../asserts/images/profile-pic.png';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const TopBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserType(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
        
        localStorage.removeItem('token');
        navigate('/signin');
      }
    } else {
     
      navigate('/signin');
    }
  }, [navigate]);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <div className="topBar">
      <div className="heading">
        <h3>Dashboard</h3>
      </div>
      <div className="searchBar">
        <div className="searchBox">
          <div className="searchicon">
            {/* <img src={searchIcon} alt="" /> */}
          </div>
          {/* <input type="text" placeholder="Search for the Job" /> */}
        </div>
        {/* <div className="notification">
          <IconButton>
            <NotificationsNoneIcon fontSize="medium" />
            <CartBadge badgeContent={5} color="primary" overlap="circular" />
          </IconButton>
        </div> */}
        <div className="profile" onClick={handleProfileClick}>
          <img src={profilePic} alt="profile" />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {userType === 'user' ? (
                <>
                  <button className="dropdown-item" onClick={() => navigate('/editprofile')}>
                    Edit Profile
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
