import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';
import './SignUp.scss';
import logo from '../../../asserts/images/cropped-purple-logo.png';
import InputField from '../../../Components/CustomInputField/InputField';
import { SIGNUP_MUTATION, SIGNUP_ORGANIZATION_MUTATION } from './SignUpAPI/SignUpAPI';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../../Components/Loader/Loader';
import toast, { Toaster } from 'react-hot-toast';

type UserType = 'user' | 'organization';

type FormField = {
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

const Fields: FormField[] = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter your name',
    validation: {
      required: 'Name is required',
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: 'Name should not contain numbers',
      },
    },
    role: ['user', 'organization']
  },
  {
    id: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Enter your email',
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[^@]+@[^@]+\.[^@]+$/,
        message: 'Email should contain only one @',
      },
    },
    role: ['user', 'organization']
  },
  {
    id: 'phone',
    label: 'Phone number',
    type: 'text',
    placeholder: 'Enter your phone number',
    validation: {
      required: 'Phone number is required',
      pattern: {
        value: /^[0-9]{10}$/,
        message: 'Invalid phone number (10 digits required)',
      },
    },
    role: ['user', 'organization'],
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
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{6,}$/,
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, &, (, or ))',
      },      
    },
    role: ['user']
  },
  {
    id: 'website',
    label: 'Website',
    type: 'text',
    placeholder: 'Enter your website',
    validation: {
      required: 'Website is required',
    },
    role: ['organization']
  },
];

type FormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  website?: string;
  role: String;
};

const SignUp: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [userType, setUserType] = useState<UserType>('user');

  const navigate = useNavigate();

  const [signUpUser, { loading: userLoading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      console.log('User signup successful!', data);
      toast.success('User signup successful!');
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    },
    onError: (err) => {
      console.error('User signup failed:', err);
    },
  });

  const [signUpOrganization, { loading: orgLoading }] = useMutation(SIGNUP_ORGANIZATION_MUTATION, {
    onCompleted: (data) => {
      console.log('Organization signup successful!', data);
      toast.success('Organization Signup successfully!');
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    },
    onError: (err) => {
      console.error('Organization signup failed:', err);
      toast.error('Oganization signup Failed');
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log('Form Data:', data);
  
    if (userType === 'user') {
      signUpUser({ 
        variables: { 
          input: {
            ...data,
            role: 'user'
          } 
        } 
      }).catch((err) => {
        console.error('User signup failed:', err);
      });
    } else if (userType === 'organization') {
      const { name, email, phone, website, password } = data;
      const organizationInput = {
        website,
        description: '',
        status: 'pending',
        location: '',
      };
      const userInput = {
        name,
        email,
        phone,
        password,
        role: 'organization', 
      };
      signUpOrganization({
        variables: {
          input: organizationInput,
          signUpUserInput2: userInput,
        },
      }).catch((err) => {
        console.error('Organization signup failed:', err);
      });
    }
  };

  const fields = Fields.filter((field) => field.role.includes(userType));
  if(userLoading || orgLoading) return <Loader/>;
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="borderSignup">
          <div className="logoContainer">
            <img src={logo} alt="logo" width="205px" height="110px" />
          </div>
          <h2 className="signUpHeading">Sign Up</h2>

          <div className="groupBtns">
            <button
              type="button"
              className={`toggleBtns ${userType === 'user' ? 'active' : ''}`}
              onClick={() => setUserType('user')}
            >
              User
            </button>
            <button
              type="button"
              className={`toggleBtns ${userType === 'organization' ? 'active' : ''}`}
              onClick={() => setUserType('organization')}
            >
              Organization
            </button>
          </div>

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

          {/* {error && <p className="error-message">{error}</p>} */}
          {/* {success && toast.success('Sign up Successful')} */}

          <div className="submit-btn-div">
            <button type="submit" className="btnSignUp">
              Sign Up
            </button>
          </div>

          <div>
            <p className="SignUpPara">
              Already have an account?{' '}
              <a href="" onClick={(e) => { e.preventDefault(); navigate('/signin'); }}>
                Sign In
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
