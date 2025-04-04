import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TablePagination,
} from '@mui/material';
import './ApplicationsPage.scss';
import { jwtDecode } from 'jwt-decode';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_APPLICATIONS, GET_ALL_USER_APPLICATIONS, UPDATE_APPLICATION_STATUS } from './ApplicationPageAPI/ApplicationPageAPI';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';
import { WITHDRAW_APPLICATION } from './ApplicationPageAPI/ApplicationPageAPI';
import {GET_DOWNLOAD_RESUME_URL} from '../UserDetails/UserDetailsAPI/UserDetailsAPI'
import client from '../../apolloClient';
type UserRole = 'user' | 'organization';

interface JobApplication {
  id: string;
  jobpost_id: string;
  organization_id: string;
  user_id: string;
  status: string;
  name: string;
  email: string;
  job_title: string;
  category: string;
  company: string;
  openings: string;
  skills: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  skills: string;
  status: string;
  resumeKey:string;
}

const ApplicationsPage: React.FC = () => {
  const token: any = localStorage.getItem('token');
  const decoded: any = jwtDecode(token);
  const userType: UserRole = decoded.role;
  const organizationId = decoded.userId;
  const userId = decoded.userId;

  console.log('Decoded Token:', decoded);

  const { data: jobPostsData, loading, error } = useQuery(
    userType === 'user' ? GET_ALL_USER_APPLICATIONS : GET_ALL_APPLICATIONS,
    {
      fetchPolicy: 'network-only',
      variables: {
        input: {
          id: userType === 'user' ? userId : organizationId
        }
      },
      skip: userType === 'organization' && !organizationId,
    }
  );

  const jobPosts = userType === 'user' ? jobPostsData?.getUserJobApplied || [] : jobPostsData?.jobApplied || [];
  console.log('Job Posts Data:', jobPosts);

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateApplicationStatus] = useMutation(UPDATE_APPLICATION_STATUS, {
    fetchPolicy: 'network-only',
    refetchQueries: [
      {
        query: userType === 'user' ? GET_ALL_USER_APPLICATIONS : GET_ALL_APPLICATIONS,
        variables: {
          input: {
            id: userType === 'user' ? userId : organizationId
          }
        },
      },
    ],
    awaitRefetchQueries: true,
  });
  const [withdrawApplication] = useMutation(WITHDRAW_APPLICATION, {
    fetchPolicy: 'network-only',
    refetchQueries: [
      {
        query: GET_ALL_USER_APPLICATIONS,
        variables: {
          input: {
            id: userId
          }
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  
  const handleJobRowClick = (application: JobApplication) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  
  const handleApplicantRowClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setOpenDialog(true);
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApplication(null);
    setSelectedApplicant(null);
  };

  const handleWithdrawJob = async  () => {
    if(selectedApplication)
    {
      try{
        await withdrawApplication({
          variables:{
            input:{
              id : selectedApplication.id
            }
          }
        });
        toast.success('Application withdraw successfully')
        handleCloseDialog();
      }
      catch(error : any)
      {
        console.error(`Error withdrawing application`,error);
        toast.error('Error in withdraw');
      }
    }
  }

  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  
  const paginatedJobPosts = jobPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  
  const handleApprove = async () => {
    if (selectedApplicant) {
      try {
        await updateApplicationStatus({
          variables: { 
            input: {
              id: selectedApplicant.id,
              status: 'Approved'
            }
          },
        });
        toast.success(`Approved: ${selectedApplicant.name}`);
        
        handleCloseDialog();
      } catch (error) {
        console.error('Error approving application:', error);
        toast.error('Failed to approve application');
      }
    }
  };

  const handleReject = async () => {
    if (selectedApplicant) {
      try {
        await updateApplicationStatus({
          variables: { 
            input: {
              id: selectedApplicant.id,
              status: 'rejected'
            }
          },
        });
        toast(`Rejected: ${selectedApplicant.name}`);
        handleCloseDialog();
      } catch (error) {
        console.error('Error rejecting application:', error);
        toast.error('Failed to reject application');
      }
    }
  };

  const handleWaitingList = async () => {
    if (selectedApplicant) {
      try {
        await updateApplicationStatus({
          variables: { 
            input: {
              id: selectedApplicant.id,
              status: 'waiting list'
            }
          },
        });
        toast(`Added to Waiting List: ${selectedApplicant.name}`);
        handleCloseDialog();
      } catch (error) {
        console.error('Error adding to waiting list:', error);
        toast.error('Failed to add to waiting list');
      }
    }
  };

  const handleDownloadResume = async (fileName: any) => {
    if (!fileName) return;

    try {
      const { data } = await client.query({
        query: GET_DOWNLOAD_RESUME_URL,
        variables: {
          input: {
            bucket: "jobportal-media-resume",
            key: fileName,
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
  

  if (loading) return <Loader/>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="applicationsPage">
      <h1>Applications</h1>

      {userType === 'user' && (
  <TableContainer component={Paper} className="applicationsTable">
    <Table>
      <TableHead className="tableHead">
        <TableRow>
          <TableCell align='center' className='tableHeaderContent'>S.No</TableCell>
          <TableCell align='center' className='tableHeaderContent'>Job Title</TableCell>
          <TableCell align='center' className='tableHeaderContent'>Company</TableCell>
          <TableCell align='center' className='tableHeaderContent'>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedJobPosts.map((application: JobApplication, index: number) => (
          <TableRow
            key={application.id}
            hover
            onClick={() => handleJobRowClick(application)}
            style={{ cursor: 'pointer' }}
          >
            <TableCell align='center' className='tableBodyConent'>{index + 1 + page * rowsPerPage}</TableCell>
            <TableCell align='center' className='tableBodyConent'>{application.job_title}</TableCell>
            <TableCell align='center' className='tableBodyConent'>{application.company}</TableCell>
            <TableCell align='center' className='tableBodyConent'>{application.status}</TableCell>
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
)}

      
      {userType === 'organization' && (
        <>
        
        {paginatedJobPosts.length > 0 ? (
        <TableContainer component={Paper} className="applicationsTable">
          <Table>
            <TableHead className="tableHead">
              <TableRow>
                <TableCell className='tableHeaderContent'>Name</TableCell>
                <TableCell className='tableHeaderContent'>Email</TableCell>
                <TableCell className='tableHeaderContent'>Job Role</TableCell>
                {/* <TableCell className='tableHeaderContent'>Skills</TableCell> */}
                <TableCell className='tableHeaderContent'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedJobPosts.map((applicant: Applicant, index: number) => (
                <TableRow
                  key={applicant.id}
                  hover
                  onClick={() => handleApplicantRowClick(applicant)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell className='tableBodyConent'>{applicant.name}</TableCell>
                  <TableCell className='tableBodyConent'>{applicant.email}</TableCell>
                  <TableCell className='tableBodyConent'>{applicant.job_title}</TableCell>
                  {/* <TableCell className='tableBodyConent'>{applicant.skills}</TableCell> */}
                  <TableCell className='tableBodyConent'>{applicant.status}</TableCell>
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
        </TableContainer>) : (
          <div className='noDataMessage'>No data Found</div>
        )}
       </> 
      )}

      
      {userType === 'user' && selectedApplication && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Job Application Details</DialogTitle>
          <DialogContent>
            <div className="jobDetails">
              <p><strong>Job Title:</strong> {selectedApplication.job_title}</p>
              <p><strong>Category:</strong> {selectedApplication.category}</p>
              <p><strong>Company:</strong> {selectedApplication.company}</p>
              <p><strong>Openings:</strong> {selectedApplication.openings}</p>
              <p><strong>Skills:</strong> {selectedApplication.skills}</p>
              <p><strong>Status:</strong> {selectedApplication.status}</p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Close
            </Button>
            <Button onClick={handleWithdrawJob} color="error" variant="contained">
              Withdraw Application
            </Button>
          </DialogActions>
        </Dialog>
      )}

      
      {userType === 'organization' && selectedApplicant && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Applicant Details</DialogTitle>
          <DialogContent>
            <div className="applicantDetails">
              <p><strong>Name:</strong> {selectedApplicant.name}</p>
              <p><strong>Email:</strong> {selectedApplicant.email || selectedApplicant?.email}</p>
              <p><strong>Job Role:</strong> {selectedApplicant.job_title}</p>
              <p><strong>Skills:</strong> {selectedApplicant.skills}</p>
              <p><strong>Status:</strong> {selectedApplicant.status}</p>
              <p><strong>Resume:</strong><Button variant='outlined' sx={{marginLeft:'10px'}} onClick={() => handleDownloadResume(selectedApplicant.resumeKey)}> Resume</Button>  </p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleApprove} color="primary">
              Approve
            </Button>
            <Button onClick={handleReject} color="secondary">
              Reject
            </Button>
            <Button onClick={handleWaitingList} color="info">
              Waiting List
            </Button>
            <Button onClick={handleCloseDialog} color="inherit">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
      )}
    </div>
  );
};

export default ApplicationsPage;