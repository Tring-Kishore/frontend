import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import './DetailsPage.scss';
import logo from '../../asserts/images/cropped-purple-logo.png';
import InputField from '../../Components/CustomInputField/InputField';

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
};

const Fields: FormField[] = [
  {
    id: 'skills',
    label: 'Skills',
    type: 'text',
    placeholder: 'Enter your skills (e.g., React, Node.js)',
    validation: { required: 'Skills are required' },
  },
  {
    id: 'experience',
    label: 'Experience',
    type: 'text',
    placeholder: 'Enter your experience (e.g., 5 years)',
    validation: { required: 'Experience is required' },
  },
  {
    id: 'languages',
    label: 'Languages Known',
    type: 'text',
    placeholder: 'Enter languages you know (e.g., English, Spanish)',
    validation: { required: 'Languages are required' },
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter a brief description about yourself',
    validation: { required: 'Description is required' },
  },
  {
    id: 'resume',
    label: 'Upload Resume',
    type: 'file',
    placeholder: 'Upload your resume (PDF only)',
    validation: { required: 'Resume is required' },
  },
];

type FormData = {
  skills: string;
  experience: string;
  languages: string;
  description: string;
  resume: FileList;
};

const DetailsPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="borderSignup">
          <div className="logoContainer">
            <img src={logo} alt="logo" width="205px" height="110px" />
          </div>
          <h2 className="detailsHeading">Details</h2>

          {/* Dynamic Form Fields */}
          {Fields.map((field) => (
            <div key={field.id} className="form-group">
              <div className="SignUplabels">
                <label htmlFor={field.id}>{field.label}:</label>
              </div>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.id}
                  className="SignUpinputs"
                  placeholder={field.placeholder}
                  {...register(field.id as keyof FormData, field.validation)}
                />
              ) : field.type === 'file' ? (
                <div className="file-upload-container">
                  <label htmlFor={field.id} className="file-upload-label">
                    Choose File
                  </label>
                  <input
                    type="file"
                    id={field.id}
                    className="file-upload-input"
                    accept=".pdf"
                    {...register(field.id as keyof FormData, field.validation)}
                  />
                  <span className="file-upload-text">No file chosen</span>
                </div>
              ) : (
                <InputField
                  type={field.type}
                  id={field.id}
                  className="SignUpinputs"
                  placeholder={field.placeholder}
                  errors={errors}
                  {...register(field.id as keyof FormData, field.validation)}
                />
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="submit-btn-div">
            <button type="submit" className="btnSubmit">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DetailsPage;