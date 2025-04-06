import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import './SideBar.scss';
import logo from '../../asserts/images/cropped-purple-logo.png';
import { jwtDecode } from 'jwt-decode';
import GridViewIcon from '@mui/icons-material/GridView';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
type UserRole = 'admin' | 'user' | 'organization';
type SideBarOption = {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const SideBarOptions: SideBarOption[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: GridViewIcon,
    roles: ['organization', 'user', 'admin'],
  },
  {
    id: 'postJob',
    label: 'Jobs',
    icon: WorkOutlineIcon,
    roles: ['organization', 'user','admin'],
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: ApartmentIcon,
    roles: ['admin'],
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: FolderOpenIcon,
    roles: ['organization', 'user'],
  },
  {
    id: 'users',
    label: 'Users',
    icon: PersonOutlineIcon,
    roles: ['admin'],
  },
];

const SideBar = () => {
  const token: any = localStorage.getItem('token');
  const decoded: any = jwtDecode(token);
  const userRole: UserRole = decoded.role;
  const navigate = useNavigate();
  const filterOptions = SideBarOptions.filter((option) => option.roles.includes(userRole));

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    handleNavigation(filterOptions[newValue].id);
  };

  const handleNavigation = (id: string) => {
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
      default:
        navigate('/dashboard');
    }
  };

  const tabStyle = {
    textTransform:'none',
    '&::first-letter':{
      textTransform:'uppercase'
    }
  }

  return (
    <div className="fullPage">
      <div className="sideBar">
        <div className="logoContainer">
          <img src={logo} alt="logo" width="170px" height="110px" />
        </div>
        <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
          <Tabs
            orientation="vertical"
            value={value}
            onChange={handleChange}
            aria-label="side bar"
          >
            {filterOptions.map((option, index) => (
              <Tab
                icon={<option.icon/>}
                iconPosition="start"
                key={option.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'left',
                  textAlign: 'left',
                  width: '100%',
                  paddingLeft: '75px',
                  textTransform:'none',
                  '&::first-letter':{
                    textTransform:'uppercase'
                  },
                  letterSpacing:'1px'
                }}
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: '8px' }}>{option.label}</span>
                  </div>
                }
              />
            ))}
          </Tabs>
        </Box>
      </div>
    </div>
  );
};

export default SideBar;