import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../../Pages/Auth/SignUp/SignUp.scss';
import logo from '../../asserts/images/cropped-purple-logo.png';
import { UPDATE_ORGANIZATION_PASSWORD } from './UpdatePasswordAPI/UpdatePasswordAPI';
import { useMutation } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const [updateOrganizationPassword, { loading }] = useMutation(UPDATE_ORGANIZATION_PASSWORD);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: FormData) => {
    console.log('Updating password:', data);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token found. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const organizationId = decoded.userId;

      await updateOrganizationPassword({
        variables: { 
          input: { 
            id: organizationId, 
            oldPassword: data.oldPassword,
            newPassword: data.newPassword
          } 
        },
      });

      toast.success('Password updated successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (loading) return <Loader />;

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="borderSignup">
          <div className="logoContainer">
            <img src={logo} alt="logo" width="205px" height="110px" />
          </div>
          <h2 className="signUpHeading">Update Password</h2>

          
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="old-password">Current Password</InputLabel>
            <OutlinedInput
              id="old-password"
              type={showPasswords.oldPassword ? 'text' : 'password'}
              {...register('oldPassword', {
                required: 'Current password is required'
              })}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => toggleShowPassword('oldPassword')}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPasswords.oldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Current Password"
            />
            {errors.oldPassword && (
              <Typography color="error" variant="body2">
                {errors.oldPassword.message}
              </Typography>
            )}
          </FormControl>

          
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="new-password">New Password</InputLabel>
            <OutlinedInput
              id="new-password"
              type={showPasswords.newPassword ? 'text' : 'password'}
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                  message:
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                },
              })}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => toggleShowPassword('newPassword')}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPasswords.newPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="New Password"
            />
            {errors.newPassword && (
              <Typography color="error" variant="body2">
                {errors.newPassword.message}
              </Typography>
            )}
          </FormControl>

          

          <div className="buttons-container" style={{ display: 'flex', gap: '10px' }}>
            <Button type="submit" variant="contained">
              Update Password
            </Button>
            <Button type="button" variant="outlined" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;