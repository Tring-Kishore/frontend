import React, { useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Button, TablePagination } from '@mui/material';
import './UserPage.scss';
import { GET_ALL_USERS, DELETE_ONE_USER } from './UserPageAPI/UserPageAPI';
import { useMutation, useQuery } from '@apollo/client';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  phone: string;
  experience: string;
  skills: string;
}
const UserPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { data, loading, error, refetch } = useQuery(GET_ALL_USERS,{fetchPolicy:'network-only'});
  const [page,setPage] = useState(0);
  const [rowsPerPage,setRowsPerPage] = useState(5);
  
  const [deleteUser] = useMutation(DELETE_ONE_USER, {
    fetchPolicy:'network-only',
    onCompleted: () => {
      toast('User deleted successfully');
      handleCloseDialog();
      refetch(); 
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    },
  });


  const handleChangePage = (event : unknown,newPage : number) => {
    setPage(newPage)
  }
  const handleChangePageRows = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
  
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

 
  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser({ variables: { id: selectedUser.id } });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

 
  if (loading) return <Loader/>;
  if (error) return <p>Error: {error.message}</p>;

  const users = data?.users || [];
  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  return (
    <div className="userPage">
      <h1>Users</h1>

      
      {paginatedUsers.length > 0 ? (
      <TableContainer component={Paper} className="userTable">
        <Table>
          <TableHead className='tableHead'>
            <TableRow>
              <TableCell className='tableHeaderContent'>S.No</TableCell>
              <TableCell className='tableHeaderContent'>Name</TableCell>
              <TableCell className='tableHeaderContent'>Email</TableCell>
              <TableCell className='tableHeaderContent'>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user: User, index: number) => (
              <TableRow key={user.id} hover onClick={() => handleRowClick(user)} style={{ cursor: 'pointer' }}>
                <TableCell className='tableBodyContent'>{index + 1}</TableCell>
                <TableCell className='tableBodyContent'>{user.name}</TableCell>
                <TableCell className='tableBodyContent'>{user.email}</TableCell>
                <TableCell className='tableBodyContent'>{user.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangePageRows}
      />
      </TableContainer>) : (
        <div className='noDataMessage'>No data Found</div>
      )}

      
      {selectedUser && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>User Details</DialogTitle>
          <DialogContent>
            <div className="userDetails">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDelete} color="secondary">
              Delete
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

export default UserPage;