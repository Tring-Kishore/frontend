import React, { useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TablePagination, Box, Tabs, Tab,
} from '@mui/material';
import './CompanyPage.scss';
import { GET_ALL_ORGANIZATIONS, UPDATE_ORGANIZATION_STATUS, DELETE_ONE_ORGANIZATION } from './CompanyPageAPI/CompanyPageAPI';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';


interface Company {
  id: string;
  website: string;
  description: string;
  status: string;
  location: string;
  organization_id: string;
  update_password_state: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

const CompanyPage: React.FC = () => {
  const { data: allCompaniesData, loading: allCompaniesLoading, error: allCompaniesError, refetch: refetchAllCompanies } = useQuery(GET_ALL_ORGANIZATIONS, { fetchPolicy: 'network-only' });
  
  const [updateOrganizationStatus] = useMutation(UPDATE_ORGANIZATION_STATUS, {
    fetchPolicy: 'network-only',
    onCompleted: () => {
      toast.success('Updated organization status');
      handleCloseDialog();
     
      refetchAllCompanies();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Failed to update organization status');
    },
  });
  
  const [deleteOrganization] = useMutation(DELETE_ONE_ORGANIZATION, {
    fetchPolicy: 'network-only',
    onCompleted: () => {
      toast.success('Organization deleted successfully');
      handleCloseDialog();
      
      refetchAllCompanies();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Failed to delete organization');
    },
  });
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState(0);

  if (allCompaniesLoading) return <Loader />;
  if (allCompaniesError) return <p>Error: {allCompaniesError.message}</p>;
  

  const allCompanies = allCompaniesData?.getAllOrganizations || [];
  
  console.log('the all companies ',allCompanies);
  
  
  const getFilteredCompanies = () => {
    switch (activeTab) {
      case 0:
        return allCompanies;
      case 1: 
        return allCompanies.filter((company: Company) => company.status === 'pending');
      case 2: 
        return allCompanies.filter((company : Company) => company.status === 'rejected');
      case 3: 
        return allCompanies.filter((company : Company) => company.status === 'approved');
      default:
        return allCompanies;
    }
  };

  const filteredCompanies = getFilteredCompanies();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const paginatedCompanies = filteredCompanies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
  };

  const handleApprove = async () => {
    if (selectedCompany) {
      try {
        await updateOrganizationStatus({
          variables: { 
            input: {
              id: selectedCompany.id, 
              status: 'approved' 
            }
          },
        });
      } catch (error) {
        console.error('Error approving organization:', error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedCompany) {
      try {
        await updateOrganizationStatus({
          variables: { 
            input: {
              id: selectedCompany.id, 
              status: 'rejected' 
            }
          },
        });
      } catch (error) {
        console.error('Error rejecting organization:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCompany) {
      try {
        await deleteOrganization({ 
          variables: { 
            input: {  
              id: selectedCompany.id 
            }
          } 
        });
      } catch (error) {
        console.error('Error deleting organization:', error);
      }
    }
  };

  const tabStyle = {
    textTransform: 'none',
    '&::first-letter':{
      textTransform:'uppercase'
    },
    letterSpacing:'1px',
  }

  return (
    <div className="companyPage">
      <h1>Companies</h1>
      <div className="btns">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label='company table'>
            <Tab label='All' sx={tabStyle} />
            <Tab label='Requested Companies' sx={tabStyle}  />
            <Tab label='Rejected Companies' sx={tabStyle} />
            <Tab label='Approved Companies' sx={tabStyle} />
          </Tabs>
        </Box>
        
      </div>

      {paginatedCompanies.length > 0 ? (
        <TableContainer component={Paper} className="companyTable">
          <Table>
            <TableHead className="tableHead">
              <TableRow>
                <TableCell className='tableHeaderContent'>S.No</TableCell>
                <TableCell className='tableHeaderContent'>Company Name</TableCell>
                <TableCell className='tableHeaderContent'>Email</TableCell>
                <TableCell className='tableHeaderContent'>Website</TableCell>
                <TableCell className='tableHeaderContent'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCompanies.map((company: Company, index: number) => (
                <TableRow key={company.id} hover onClick={() => handleRowClick(company)} style={{ cursor: 'pointer' }}>
                  <TableCell className='tableBodyConent'>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell className='tableBodyConent'>{company.user.name}</TableCell>
                  <TableCell className='tableBodyConent'>{company.user.email}</TableCell>
                  <TableCell className='tableBodyConent'>{company.website}</TableCell>
                  <TableCell className='tableBodyConent'>{company.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCompanies.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <div className='noDataMessage'>No data Found</div>
      )}

      {selectedCompany && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Company Details</DialogTitle>
          <DialogContent>
            <div className="companyDetails">
              <p><strong>Name:</strong> {selectedCompany.user.name}</p>
              <p><strong>Email:</strong> {selectedCompany.user.email}</p>
              <p><strong>Website:</strong> {selectedCompany.website}</p>
              <p><strong>Status:</strong> {selectedCompany.status}</p>
            </div>
          </DialogContent>
          <DialogActions>
            {selectedCompany.status === 'pending' ? (
              <>
                <Button onClick={handleApprove} color="primary">Approve</Button>
                <Button onClick={handleReject} color="secondary">Reject</Button>
              </>
            ) : selectedCompany.status === 'approved' ? (
              <Button onClick={handleDelete} color="secondary">Delete</Button>
            ) : null}
            <Button onClick={handleCloseDialog} color="inherit">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default CompanyPage;
