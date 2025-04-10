import React, { useState, useEffect } from 'react';
import './TopBar.scss';
import profilePic from '../../asserts/images/profile-pic.png';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { SideBarOptions } from '../CustomSideBar/SideBar';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import logo from '../../asserts/images/cropped-purple-logo.png';

type UserRole = 'admin' | 'user' | 'organization';

const TopBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userType, setUserType] = useState<UserRole>('user');
  const navigate = useNavigate();
  const [showOverley, setShowOverley] = useState(false);
  
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

  const handleNavigation = (id: string) => {
    setShowOverley(false);
    switch (id) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'postJob':
        navigate('/dashboard/job-posts');
        break;
      case 'companies':
        navigate('/dashboard/companies');
        break;
      case 'applications':
        navigate('/dashboard/applications');
        break;
      case 'users':
        navigate('/dashboard/users');
        break;
      case 'edit-profile':
        navigate('/editprofile');
        break;
      case 'logout':
        localStorage.removeItem('token');
        navigate('/signin');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const filterOptions = SideBarOptions.filter((option) => option.roles.includes(userType));

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOverley = () => {
    setShowOverley(!showOverley); 
  };

  return (
    <>
      {showOverley && (
    <div className='overlay'>
      <div className="closeIcon" onClick={handleOverley}>
        <CloseIcon style={{ fontSize: '2rem', color: 'white' }} />
      </div>
      <div className="optionNames" onClick={(e) => e.stopPropagation()}>
        {filterOptions.map((option) => (
          <div 
            key={option.id} 
            className='options'
            onClick={() => handleNavigation(option.id)}
          >
            {option.label}
          </div>
        ))}
        {userType === 'user' && (
          <div 
            className='options'
            onClick={() => handleNavigation('edit-profile')}
          >
            Edit Profile
          </div>
        )}
        <div 
          className='options'
          onClick={() => handleNavigation('logout')}
        >
          Logout
        </div>
      </div>
    </div> 
  )}
      
      <div className="topBar">
        <div className="heading">
          <h3 className='headingh3'>Dashboard</h3>
        </div>
        <div className="logoContainer">
          <img src={logo} alt="logo" width="170px" height="110px" />
        </div>
        <div className="searchBar">
          <div className="profile" onClick={handleProfileClick}>
            <img src={profilePic} alt="profile" />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {userType === 'user' ? (
                  <>
                    <button className="dropdown-item" onClick={() => navigate('/editprofile')}>
                      Edit Profile
                    </button>
                    <button className="dropdown-item" onClick={() => handleNavigation('logout')}>
                      Logout
                    </button>
                  </>
                ) : (
                  <button className="dropdown-item" onClick={() => handleNavigation('logout')}>
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
          <div onClick={handleOverley} style={{cursor: 'pointer'}} className='hamburger'><MenuIcon/></div>
        </div>
      </div>
    </>
  );
};

export default TopBar;