import React, { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
  Grid,
  MenuItem,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_JOB_ALL_POSTS_QUERY,
  ADD_JOB_POST_MUTATION,
  GET_JOB_POSTS_QUERY,
  APPLY_FOR_JOB_MUTATION,
  UPDATE_JOB_POST_MUTATION,
  GET_ADMIN_JOB_POSTS_QUERY,
  UPDATE_JOB_POST_STATUS_MUTATION
} from "./JobPostPageAPI/JobPostPageAPI";
import "./JobPostPage.scss";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CreateIcon from "@mui/icons-material/Create";
import Loader from "../Loader/Loader";

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
  const token: any = localStorage.getItem("token");
  const decoded: any = jwtDecode(token);
  const userType: UserRole = decoded.role;
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
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
    status:"requested"
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const {
    data: adminJobPostsData,
    refetch: refetchAdminJobPosts,
    loading: adminJobPostsLoading,
  } = useQuery(GET_ADMIN_JOB_POSTS_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      status: statusFilter === "all" ? null : statusFilter,
    },
    skip: userType !== "admin",
  });
  const {
    data: orgJobPostsData,
    refetch: refetchOrgJobPosts,
    loading: orgJobPostsLoading,
  } = useQuery(GET_JOB_POSTS_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        id: decoded.userId,
      },
    },
    skip: userType !== "organization",
  });

  const {
    data: allJobPostsData,
    refetch: refetchAllJobPosts,
    loading: allJobPostsLoading,
  } = useQuery(GET_JOB_ALL_POSTS_QUERY, {
    fetchPolicy: "network-only",
    skip: userType !== "user",
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

  // const jobPosts = userType === "user"
  // ? allJobPostsData?.allJobPosts || []
  // : orgJobPostsData?.jobPosts || [];

  const jobPosts =
    userType === "user"
      ? allJobPostsData?.allJobPosts || []
      : userType === "organization"
      ? orgJobPostsData?.jobPosts || []
      : adminJobPostsData?.adminJobPosts || [];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const paginatedJobPosts = jobPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
      status:"requested"
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenEditDialog = (job: JobPost) => {
    setSelectedJob(job);
    setFormData(job);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddPost = async () => {
    const validationError = validateJobPost(formData);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await addJobPost({
        variables: {
          input: {
            job_title: formData.job_title,
            category: formData.category,
            openings: formData.openings,
            experience: formData.experience,
            description: formData.description,
            package: formData.package,
            language: formData.language,
            skills: formData.skills,
            organization_id: decoded.userId,
          },
        },
      });
    } catch (error) {
      toast.error("Failed to add job post");
      console.error(error);
    }
  };

  const handleUpdatePost = async () => {
    const validationError = validateJobPost(formData);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const variables = {
      input: {
        id: formData.id,
        job_title: formData.job_title,
        category: formData.category,
        openings: formData.openings,
        experience: formData.experience,
        description: formData.description,
        package: formData.package,
        language: formData.language,
        skills: formData.skills,
      },
    };

    await updateJobPost({ variables });
  };

  const [updateJobPostStatus] = useMutation(UPDATE_JOB_POST_STATUS_MUTATION, {
    fetchPolicy: "network-only",
    onCompleted: () => {
      refetchAdminJobPosts();
      toast.success("Job post status updated successfully");
      setSelectedJob(null);
    },
    onError: (err) => {
      toast.error(`Failed to update job post status: ${err.message}`);
    },
  });
  
  const handleUpdateStatus = async (status: string) => {
    if(selectedJob)
    {
      await updateJobPostStatus({
        variables: {
          input: {
            id : selectedJob.id,
            status
          }
        }
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
      const variables = {
        input: {
          jobpost_id: selectedJob.id,
          user_id: decoded.userId,
          organization_id: selectedJob.organization_id,
        },
      };

      await applyForJob({ variables });
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
    if (!formData.skills.trim()) return "Skills are required.";

    if (isNaN(Number(formData.openings)) || Number(formData.openings) <= 0) {
      return "Openings must be a valid number greater than 0.";
    }
    if (isNaN(Number(formData.package)) || Number(formData.package) <= 0) {
      return "Package must be a valid number greater than 0.";
    }

    return null;
  };

  useEffect(() => {
    if (openEditDialog) {
      handleCloseViewDialog();
    }
  }, [openEditDialog]);

  // if (loading) return <Loader />;

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
                {userType === "user" && (
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
                {userType === "organization" && (
                  <TableCell align="center" className="tableHeaderContent">
                    Actions
                  </TableCell>
                )}
                {userType === "user" && (
                  <TableCell align="center" className="tableHeaderContent">
                    Action
                  </TableCell>
                )}
                {userType === "admin" && (
                  <TableCell align="center" className="tableHeaderContent">
                    Status
                  </TableCell>
                )}
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
                  {userType === "user" && (
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
                  {userType === "user" && (
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
                  {userType === "admin" && (
                    <TableCell align="center" className="tableBodyConent">
                      {post.status}
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

      {userType === "admin" && (
        <div className="adminControls">
          <TextField
            select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            variant="outlined"
            style={{ minWidth: 200, marginBottom: 20 }}
          >
            <MenuItem value="all">All Posts</MenuItem>
            <MenuItem value="requested">Requested</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="waiting_list">Waiting List</MenuItem>
          </TextField>
        </div>
      )}

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
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Job Title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
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
                    fullWidth
                    margin="normal"
                    label="Experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                  />
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
                    fullWidth
                    margin="normal"
                    label="Job Title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
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
                    fullWidth
                    margin="normal"
                    label="Experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                  />
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
            <>
              <Button
                onClick={() => handleUpdateStatus("approved")}
                color="primary"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleUpdateStatus("rejected")}
                color="error"
              >
                Reject
              </Button>
              <Button
                onClick={() =>
                  handleUpdateStatus("waiting_list")
                }
                color="secondary"
              >
                Waiting List
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobPostPage;
