import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../Components/CustomInputField/InputField';
import '../SignUp/SignUp.scss';
import logo from '../../../asserts/images/cropped-purple-logo.png';
import { LOGIN_MUTATION } from './SignInAPI/SignInAPI';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Loader from '../../../Components/Loader/Loader';
import LoginLoader from '../../../Components/Loader/LoginLoader';

type UserType = 'user' | 'organization' | 'admin';

type FormFields = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  validation: {
    required: string;
    minLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
  };
  role: UserType[];
};

const Fields: FormFields[] = [
  {
    id: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Enter your email',
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email format (e.g., example@domain.com)',
      },
    },
    role: ['user', 'organization', 'admin'],
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    validation: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters',
      },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^)(#])[A-Za-z\d@$!%*?&^)(#]{6,}$/,
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      },
    },
    role: ['user', 'organization', 'admin'],
  },
];

type FormData = {
  email: string;
  password: string;
};

const SignIn = () => {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);
  const gotoDashboard = () => {
    navigate('/dashboard');
  }
  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      console.log('the token in frontend',data);
      
      const token = data.login.token;
      localStorage.setItem('token', token);
  
      const decoded: any = jwtDecode(token);
      console.log('Decoded Token:', decoded); 
  
      const { userId, name, role, update_password_state } = decoded;
  
      setShowLoader(true);
      setTimeout(() => {
        setShowLoader(false);
        toast.success('Login successful');
        if (role === 'organization') {
          if (update_password_state === false) {
            console.log('Navigating to /update-password');
            navigate('/update-password');
          } else {
            console.log('Navigating to /dashboard');
            gotoDashboard();
          }
        } else if (role === 'user') {
          gotoDashboard();
        } else if (role === 'admin') {
          gotoDashboard();
        }
      }, 4000);
    },
    onError: (err) => {
      console.log('the error in frontend',err);
      
      setShowLoader(false);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message;
      toast.error(`Login failed: ${errorMessage}`);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log('the data in frontend',data);
    
    setShowLoader(true);
    login({ 
      variables: { 
        input: {  
          email: data.email, 
          password: data.password 
        }
      } 
    }).catch((err) => {
      setShowLoader(false);
      console.error('Login failed:', err);
    });
  };

  const fields = Fields.filter((field) => field.role);
  if (loading) return <Loader/>;
  return (
    <>
      {showLoader && <LoginLoader />}
      <div className="form-container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="borderSignup">
            <div className="logoContainer">
              <img src={logo} alt="logo" width="205px" height="110px" />
            </div>
            <h2 className="signUpHeading">Sign In</h2>

            {fields.map((field) => (
              <div key={field.id} className="form-group">
                <div className="SignUplabels">
                  <label htmlFor={field.id}>{field.label} {field.validation.required && <span style={{ color: 'red' }}>*</span>}</label>
                </div>

                <InputField
                  type={field.type}
                  id={field.id}
                  className="SignUpinputs"
                  placeholder={field.placeholder}
                  errors={errors}
                  {...register(field.id as keyof FormData, field.validation)}
                />
              </div>
            ))}

            <div className="submit-btn-div">
              <button type="submit" className="btnSignUp">
                Submit
              </button>
            </div>

            <div>
              <p className="SignUpPara">
                Don't you have an Account?{' '}
                <a href="" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignIn;
