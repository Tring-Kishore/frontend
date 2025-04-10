import React, { useEffect, useState } from "react";
import {Button,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Dialog,DialogTitle,DialogContent,DialogActions,TextField,TablePagination,
  Grid,MenuItem,Chip,Box,InputLabel,Select,FormControl,SelectChangeEvent,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_JOB_ALL_POSTS_QUERY,
  ADD_JOB_POST_MUTATION,
  GET_JOB_POSTS_QUERY,
  APPLY_FOR_JOB_MUTATION,
  UPDATE_JOB_POST_MUTATION,
  UPDATE_JOB_POST_STATUS_MUTATION,
} from "./JobPostPageAPI/JobPostPageAPI";
import "./JobPostPage.scss";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CreateIcon from "@mui/icons-material/Create";
import { useNavigate } from "react-router-dom";


type UserRole = "user" | "organization" | "admin";

interface JobPost {
  id: string;
  job_title: string;
  category: string;
  openings: string;
  experience: string;
  description: string;
  package: string;
  language: string;
  skills: string;
  organization_id: string;
  organization_name: string;
  status: "requested" | "approved" | "rejected" | "waiting_list";
}

const JobPostPage: React.FC = () => {

  const navigate = useNavigate();
  const [userType,setUserType] = useState();
  const [userId,setUserId] = useState();
  useEffect(() => {
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUserType(decoded.role);
          setUserId(decoded.userId);
        } catch (error) {
          console.error('Error decoding token:', error);
          
          localStorage.removeItem('token');
          navigate('/signin');
        }
      }
    }, [navigate]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState<JobPost>({
    id: "",
    job_title: "",
    category: "",
    openings: "",
    experience: "",
    description: "",
    package: "",
    language: "",
    skills: "",
    organization_id: "",
    organization_name: "",
    status: "requested",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  

  
  const {
    data: allJobPostsData,
    refetch: refetchAllJobPosts,
    loading: allJobPostsLoading,
  } = useQuery(GET_JOB_ALL_POSTS_QUERY, {
    fetchPolicy: "network-only",
    skip: userType === "organization", 
  });

  const {
    data: orgJobPostsData,
    refetch: refetchOrgJobPosts,
    loading: orgJobPostsLoading,
  } = useQuery(GET_JOB_POSTS_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        id: userId,
      },
    },
    skip: userType !== "organization",
  });

  
  
  const [addJobPost] = useMutation(ADD_JOB_POST_MUTATION, {
    fetchPolicy: "network-only",
    onCompleted: () => {
      refetchOrgJobPosts();
      toast.success("Job post added successfully");
      setOpenAddDialog(false);
    },
    onError: (err) => {
      toast.error(`Failed to add job post: ${err.message}`);
    },
  });

  const [updateJobPost] = useMutation(UPDATE_JOB_POST_MUTATION, {
    fetchPolicy: "network-only",
    onCompleted: () => {
      refetchOrgJobPosts();
      toast.success("Job post updated successfully");
      setOpenEditDialog(false);
    },
    onError: (err) => {
      toast.error(`Failed to update job post: ${err.message}`);
    },
  });

  const [applyForJob] = useMutation(APPLY_FOR_JOB_MUTATION, {
    fetchPolicy: "network-only",
    onCompleted: () => {
      toast.success("Applied for job successfully");
      setSelectedJob(null);
    },
    onError: (err) => {
      if (err.message.includes("already applied")) {
        toast.error("You have already applied for this job");
        setSelectedJob(null);
      } else {
        toast.error(`Failed to apply for job: ${err.message}`);
        setSelectedJob(null);
      }
    },
  });

  const [updateJobPostStatus] = useMutation(UPDATE_JOB_POST_STATUS_MUTATION, {
    fetchPolicy: "network-only",
    onCompleted: () => {
      refetchAllJobPosts();
      toast.success("Job post status updated successfully");
      setSelectedJob(null);
    },
    onError: (err) => {
      toast.error(`Failed to update job post status: ${err.message}`);
    },
  });

  
  const allPosts = userType === "organization" 
    ? orgJobPostsData?.jobPosts || []
    : allJobPostsData?.allJobPosts || [];

    const jobPosts = userType === "admin" && statusFilter !== "all"
    ? allPosts.filter((post : any) => post.status === statusFilter)
    : userType === "user"
    ? allPosts.filter((post : any) => post.status === "approved") 
    : allPosts;

  const paginatedJobPosts = jobPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setFormData({
      id: "",
      job_title: "",
      category: "",
      openings: "",
      experience: "",
      description: "",
      package: "",
      language: "",
      skills: "",
      organization_id: "",
      organization_name: "",
      status: "requested",
    });
    setSkills([]);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenEditDialog = (job: JobPost) => {
    setSelectedJob(job);
    setFormData(job);
    setSkills(job.skills ? job.skills.split(",") : []);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value as string }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value as string,
    }));
  };

  const handleSkillsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, skills: value }));
  };

  const handleSkillsKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && formData.skills.trim()) {
      e.preventDefault();
      const newSkill = formData.skills.trim().replace(/,/g, "");
      if (newSkill && !skills.includes(newSkill)) {
        setSkills((prev) => [...prev, newSkill]);
        setFormData((prev) => ({ ...prev, skills: "" }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleAddPost = async () => {
    const submissionData = {
      ...formData,
      skills: skills.join(","),
    };

    const validationError = validateJobPost(submissionData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await addJobPost({
        variables: {
          input: {
            job_title: submissionData.job_title,
            category: submissionData.category,
            openings: submissionData.openings,
            experience: submissionData.experience,
            description: submissionData.description,
            package: submissionData.package,
            language: submissionData.language,
            skills: submissionData.skills,
            organization_id: userId,
          },
        },
      });
    } catch (error) {
      toast.error("Failed to add job post");
      console.error(error);
    }
  };

  const handleUpdatePost = async () => {
    const submissionData = {
      ...formData,
      skills: skills.join(","),
    };

    const validationError = validateJobPost(submissionData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await updateJobPost({
      variables: {
        input: {
          id: submissionData.id,
          job_title: submissionData.job_title,
          category: submissionData.category,
          openings: submissionData.openings,
          experience: submissionData.experience,
          description: submissionData.description,
          package: submissionData.package,
          language: submissionData.language,
          skills: submissionData.skills,
        },
      },
    });
  };

  const handleUpdateStatus = async (status: string) => {
    if (selectedJob) {
      await updateJobPostStatus({
        variables: {
          input: {
            id: selectedJob.id,
            status,
          },
        },
      });
    }
  };

  const handleViewClick = (job: JobPost) => {
    setSelectedJob(job);
  };

  const handleCloseViewDialog = () => {
    setSelectedJob(null);
  };

  const handleApply = async () => {
    if (selectedJob) {
      await applyForJob({
        variables: {
          input: {
            jobpost_id: selectedJob.id,
            user_id: userId,
            organization_id: selectedJob.organization_id,
          },
        },
      });
    }
  };

  const validateJobPost = (formData: JobPost): string | null => {
    if (!formData.job_title.trim()) return "Job Title is required.";
    if (!formData.category.trim()) return "Category is required.";
    if (!formData.openings.trim()) return "Openings is required.";
    if (!formData.experience.trim()) return "Experience is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (!formData.package.trim()) return "Package is required.";
    if (!formData.language.trim()) return "Language is required.";
    if (skills.length === 0) return "At least one skill is required.";

    if (isNaN(Number(formData.openings)) || Number(formData.openings) <= 0) {
      return "Openings must be a valid number greater than 0.";
    }
    if (isNaN(Number(formData.package)) || Number(formData.package) <= 0) {
      return "Package must be a valid number greater than 0.";
    }

    return null;
  };

  const jobTitleOptions = [
    { value: "Software Engineer", label: "Software Engineer" },
    { value: "Ui/Ux Designer", label: "Ui/Ux Designer" },
    { value: "Backend Developer", label: "Backend Developer" },
    { value: "Testing", label: "Testing" },
    { value: "Frontend Developer", label: "Frontend Developer" },
  ];

  const categoryOptions = [
    { value: "Full time", label: "Full Time" },
    { value: "Part time", label: "Part Time" },
    { value: "Work From Home", label: "Work From Home" },
  ];

  const experienceOptions = [
    { value: "1+ Years", label: "1+ Years" },
    { value: "2+ Years", label: "2+ Years" },
    { value: "3+ Years", label: "3+ Years" },
    { value: "4+ Years", label: "4+ Years" },
    { value: "5+ Years", label: "5+ Years" },
    { value: "6+ Years", label: "6+ Years" },
    { value: "7+ Years", label: "7+ Years" },
    { value: "8+ Years", label: "8+ Years" },
  ];

  useEffect(() => {
    if (openEditDialog) {
      handleCloseViewDialog();
    }
  }, [openEditDialog]);

  return (
    <div className="jobPostPage">
      {userType === "organization" && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddDialog}
        >
          Add Post
        </Button>
      )}

{userType === "admin" && (
        <div className="adminControls">
          <FormControl variant="outlined" style={{ minWidth: 200, marginBottom: 20 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Filter by Status"
            >
              <MenuItem value="all">All Posts</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="waiting_list">Waiting List</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {paginatedJobPosts.length > 0 ? (
        <TableContainer component={Paper} className="jobPostTable">
          <Table>
            <TableHead className="tableHeader">
              <TableRow>
                <TableCell align="center" className="tableHeaderContent">
                  S.No
                </TableCell>
                <TableCell align="center" className="tableHeaderContent">
                  Job Title
                </TableCell>
                <TableCell align="center" className="tableHeaderContent">
                  Category
                </TableCell>
                {(userType === "user" || userType === 'admin') && (
                  <TableCell align="center" className="tableHeaderContent">
                    Company
                  </TableCell>
                )}
                <TableCell align="center" className="tableHeaderContent">
                  Openings
                </TableCell>
                <TableCell align="center" className="tableHeaderContent">
                  Experience
                </TableCell>
                {(userType === "admin" || userType === "organization") && (
                  <TableCell align="center" className="tableHeaderContent">
                    Status
                  </TableCell>
                )}
                
                  <TableCell align="center" className="tableHeaderContent">
                    Action
                  </TableCell>
                
                
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedJobPosts.map((post: JobPost, index: number) => (
                <TableRow key={post.id} hover style={{ cursor: "pointer" }}>
                  <TableCell align="center" className="tableBodyConent">
                    {index + 1 + page * rowsPerPage}
                  </TableCell>
                  <TableCell align="center" className="tableBodyConent">
                    {post.job_title}
                  </TableCell>
                  <TableCell align="center" className="tableBodyConent">
                    {post.category}
                  </TableCell>
                  {(userType === "user" || userType === 'admin') && (
                    <TableCell align="center" className="tableBodyConent">
                      {post.organization_name || "N/A"}
                    </TableCell>
                  )}
                  <TableCell align="center" className="tableBodyConent">
                    {post.openings}
                  </TableCell>
                  <TableCell align="center" className="tableBodyConent">
                    {post.experience}
                  </TableCell>
                  {(userType === "admin" || userType==='organization') && (
                  <TableCell align="center" className="tableBodyConent">
                    <Chip
                      label={post.status}
                      color={
                        post.status === "approved" ? "success" :
                        post.status === "rejected" ? "error" :
                        post.status === "waiting_list" ? "warning" : "default"
                      }
                    />
                  </TableCell>
                )}
                  {userType === "organization" && (
                    <TableCell align="center" className="tableBodyConent">
                      <Button
                        variant="outlined"
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClick(post);
                        }}
                        style={{ marginRight: "8px" }}
                      >
                        <RemoveRedEyeIcon />
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDialog(post);
                        }}
                      >
                        <CreateIcon />
                      </Button>
                    </TableCell>
                  )}
                  
                  {(userType === "user" || userType === 'admin') && (
                    <TableCell className="tableBodyConent">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleViewClick(post)}
                        style={{ textAlign: "center" }}
                      >
                        <RemoveRedEyeIcon />
                      </Button>
                    </TableCell>
                  )}
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={jobPosts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <div className="noDataMessage">No data Found</div>
      )}

      {/* Add Job Dialog */}
      {userType === "organization" && (
        <Dialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add Job Post</DialogTitle>
          <DialogContent>
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="job-title-label">Job Title</InputLabel>
                    <Select
                      labelId="job-title-label"
                      id="job_title"
                      name="job_title"
                      value={formData.job_title}
                      label="Job Title"
                      onChange={handleSelectChange}
                    >
                      {jobTitleOptions.map((job) => (
                        <MenuItem key={job.value} value={job.value}>
                          {job.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="jobpost-category">Category</InputLabel>
                    <Select
                      labelId="jobpost-category"
                      id="category"
                      name="category"
                      value={formData.category}
                      label="Category"
                      onChange={handleSelectChange}
                    >
                      {categoryOptions.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Openings"
                    name="openings"
                    value={formData.openings}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="jobpost-experience">Experience</InputLabel>
                    <Select
                      labelId="jobpost-experience"
                      id="experience"
                      name="experience"
                      label="Experience"
                      value={formData.experience}
                      onChange={handleSelectChange}
                    >
                      {experienceOptions.map((exp) => (
                        <MenuItem key={exp.value} value={exp.value}>
                          {exp.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Package"
                    name="package"
                    value={formData.package}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleSkillsInput}
                    onKeyDown={handleSkillsKeyDown}
                    placeholder="Type skills and press Enter or comma"
                  />
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                        sx={{ margin: "2px" }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    name="description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddPost} color="primary" variant="contained">
              Add Post
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Job Dialog */}
      {userType === "organization" && (
        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Job Post</DialogTitle>
          <DialogContent>
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Job Title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                  >
                    {jobTitleOptions.map((job) => (
                      <MenuItem key={job.value} value={job.value}>
                        {job.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Openings"
                    name="openings"
                    value={formData.openings}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                  >
                    {experienceOptions.map((exp) => (
                      <MenuItem key={exp.value} value={exp.value}>
                        {exp.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Package"
                    name="package"
                    value={formData.package}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Skills"
                    name="skills"
                    // value={formData.skills}
                    onChange={handleSkillsInput}
                    onKeyDown={handleSkillsKeyDown}
                    placeholder="Type skills and press Enter or comma"
                  />
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                        sx={{ margin: "2px" }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    name="description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePost}
              color="primary"
              variant="contained"
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* View Job Dialog */}
      <Dialog
        open={Boolean(selectedJob) && !openEditDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Job Details</DialogTitle>
        <DialogContent>
          <p>
            <strong>Job Title:</strong> {selectedJob?.job_title}
          </p>
          <p>
            <strong>Category:</strong> {selectedJob?.category}
          </p>
          {userType === "user" && (
            <p>
              <strong>Company:</strong>{" "}
              {selectedJob?.organization_name || "N/A"}
            </p>
          )}
          <p>
            <strong>Openings:</strong> {selectedJob?.openings}
          </p>
          <p>
            <strong>Experience:</strong> {selectedJob?.experience}
          </p>
          <p>
            <strong>Description:</strong> {selectedJob?.description}
          </p>
          <p>
            <strong>Package:</strong> {selectedJob?.package}
          </p>
          <p>
            <strong>Language:</strong> {selectedJob?.language}
          </p>
          <p>
            <strong>Skills:</strong> {selectedJob?.skills}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="secondary">
            Cancel
          </Button>
          {userType === "user" && (
            <Button onClick={handleApply} color="primary" variant="contained">
              Apply
            </Button>
          )}
          {userType === "admin" && (
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Button
                variant={selectedJob?.status === "approved" ? "contained" : "outlined"}
                color="success"
                onClick={() => handleUpdateStatus("approved")}
              >
                Approve
              </Button>
              <Button
                variant={selectedJob?.status === "rejected" ? "contained" : "outlined"}
                color="error"
                onClick={() => handleUpdateStatus("rejected")}
              >
                Reject
              </Button>
              <Button
                variant={selectedJob?.status === "waiting_list" ? "contained" : "outlined"}
                color="warning"
                onClick={() => handleUpdateStatus("waiting_list")}
              >
                Waiting List
              </Button>
            </div>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobPostPage;
