import React, { useState } from 'react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './InputField.scss';
type InputFieldProps = {
  name: string;
  id: string;
  label?: string;
  placeholder: string;
  className: string;
  type: string;
  errors: any;
  [key: string]: any;
};

const InputField: React.FC<InputFieldProps> = ({
  name,
  id,
  label,
  placeholder,
  className,
  type,
  errors,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='inputField'>
      
      <input
        id={id}
        className={className}
        type={type === 'password' && showPassword ? 'text' : type}
        name={name}
        placeholder={placeholder}
        {...props}
      />

      
      {type === 'password' && (
        <span className='eyeIcon'
          
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
        </span>
      )}

      
      {errors && errors[name] && (
        <p className="error-message">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export default InputField;
