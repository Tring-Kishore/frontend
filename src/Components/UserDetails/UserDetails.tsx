
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_USER_DETAILS_QUERY,
  UPDATE_USER_MUTATION,
  GENERATE_UPLOAD_URL,
  DELETE_RESUME_MUTATION,
  GET_DOWNLOAD_RESUME_URL,
  UPDATE_USER_RESUME_MUTATION,
} from "./UserDetailsAPI/UserDetailsAPI";
import "./UserDetails.scss";
import { jwtDecode } from "jwt-decode";
import Loader from "../Loader/Loader";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import client from "../../apolloClient";
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
const UserDetails = () => {
  const token: any = localStorage.getItem("token");
  const decoded: any = jwtDecode(token);
  const userId = decoded.userId;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    age: "",
    experience: "",
    skills: "",
    description: "",
    resumeUrl: "",
    resumeKey: "",
  });

  const { data, loading, error, refetch } = useQuery(GET_USER_DETAILS_QUERY, {
    variables: { input: { id: userId } },
    fetchPolicy:'network-only',
    onCompleted: (data) => {
      if (data?.user) {
        setUser((prev) => ({
          ...prev,
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          age: data.user.age || "",
          experience: data.user.experience || "",
          skills: data.user.skills || "",
          description: data.user.description || "",
          resumeKey: data.user.resumeKey || "",
          
        }));
        console.log('the resumeKey',data.user.resumeKey);
        
      }
    },
  });

  const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      toast.success("User details updated successfully!");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [deleteResume] = useMutation(DELETE_RESUME_MUTATION, {
    onCompleted: () => {
      toast.success("Resume deleted successfully!");
      setUser((prev) => ({ ...prev, resumeUrl: "", resumeKey: "" }));
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          input: {
            id: userId,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            age: user.age || null,
            experience: user.experience || null,
            skills: user.skills || null,
            description: user.description || null,
          },
        },
      });
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const maxSize = 5;
      const maxFileSize = maxSize * 1024 * 1024;
      if(file.size > maxFileSize)
      {
        toast.error('Faild to Upload the resume, the file size should be below 5MB');
        return;
      }



      const originalName = file.name.split('.').slice(0, -1).join('.').replace(/\s+/g, '_');
      const extension = file.name.split('.').pop();

      if(extension !== 'pdf')
      {
        toast.error('Only PDF files are allowed');
        return;
      }
      const timestamp = new Date().getTime();
      const fileName = `resume/${originalName}_${timestamp}.${extension}`;
      
      try {
        
        const { data: uploadData } = await client.mutate({
          mutation: GENERATE_UPLOAD_URL,
          variables: {
            input: {
              fileName,
              fileType: file.type
            }
          }
        });
  
        const { presignedUrl, key } = uploadData?.generateUploadUrl;
  
        console.log('thepresigned url',presignedUrl,'the key is',key);
        
        await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type }
        });
  
        
        setUser(prev => ({
          ...prev,
          resumeKey: key,
        }));
  
        
        await client.mutate({
          mutation: UPDATE_USER_RESUME_MUTATION,
          variables: {
            input: {
              id: userId,
              resumeKey: key
            }
          }
        });
  
        
        await refetch();
        
        toast.success("Resume uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Upload failed");
      }
    }
  };
  const handleDownloadResume = async () => {
    if (!user.resumeKey) return;

    try {
      const { data } = await client.query({
        query: GET_DOWNLOAD_RESUME_URL,
        variables: {
          input: {
            bucket: "jobportal-media-resume",
            key: user.resumeKey,
          },
        },
        fetchPolicy: "network-only",
      });

      window.open(data.generateDownloadUrl.downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume.");
    }
  };

  const handleDeleteResume = async () => {
    try {
      await deleteResume({
        variables: {
          input: { id: userId },
        },
      });
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p>Error fetching user details: {error.message}</p>;

  console.log("the resume key",user);
  
  return (
    <div className="outer-class">
      <div className="user-details-container">
        <h1>User Details</h1>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>
              Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              Email <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input
              type="text"
              name="age"
              value={user.age}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Experience</label>
            <input
              name="experience"
              value={user.experience}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Skills</label>
            <input
              name="skills"
              value={user.skills}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={user.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Resume</label>
            {user.resumeKey ? (
              <div className="resume-actions">
                <div className="resume-info">
                  <strong>Current Resume:</strong>
                  <span className="resume-name">
                    {user.resumeKey || "MyResume.pdf"}
                  </span>
                </div>
                <div className="resume-buttons">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadResume}
                    startIcon={<DownloadIcon />}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<UploadIcon />}
                  >
                    Replace
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                Upload Resume
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </Button>
            )}
          </div>

          <div className="button-group">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/dashboard")}
            >
              Close
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetails;
