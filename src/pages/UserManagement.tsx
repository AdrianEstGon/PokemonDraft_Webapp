import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TablePagination,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Stack,
  Fab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser, updateUser } from "../services/UserService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  id: number;
  username: string;
  role: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [editOpen, setEditOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usernameEdit, setUsernameEdit] = useState("");
  const [roleEdit, setRoleEdit] = useState("user");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  const handleEditOpen = (user: User) => {
    setCurrentUser(user);
    setUsernameEdit(user.username);
    setRoleEdit(user.role);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!currentUser) return;
    try {
      await updateUser(currentUser.id, { username: usernameEdit, role: roleEdit });
      toast.success("User updated successfully");
      setEditOpen(false);
      setCurrentUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container sx={{ py: 4, maxWidth: "lg" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Tooltip title="Return to Draft" placement="right">
        <Fab
          color="primary"
          onClick={() => navigate("/app")}
          sx={{ position: "fixed", top: 24, left: 24, zIndex: 10, bgcolor: "black" }}
        >
          <ArrowBackIcon />
        </Fab>
      </Tooltip>

      {/* 🔹 Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>
        <Box sx={{ width: 48 }} /> {/* placeholder para balancear el header */}
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3, boxShadow: 4 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      "&:hover": { bgcolor: "grey.100" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>{user.username}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{user.role}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit User">
                        <IconButton color="primary" onClick={() => handleEditOpen(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton color="error" onClick={() => handleDelete(user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ "& .MuiTablePagination-toolbar": { justifyContent: "flex-end" } }}
          />
        </Paper>
      )}

      {/* 🔹 Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle>Edit User</DialogTitle>
  <DialogContent 
    sx={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 2, 
      overflowY: "auto", 
      maxHeight: "60vh"
    }}
  >
    <TextField
      margin="dense"
      label="Username"
      value={usernameEdit}
      onChange={(e) => setUsernameEdit(e.target.value)}
      fullWidth
    />
    <Select
      value={roleEdit}
      onChange={(e) => setRoleEdit(e.target.value)}
      fullWidth
    >
      <MenuItem value="user">User</MenuItem>
      <MenuItem value="admin">Admin</MenuItem>
    </Select>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
    <Button variant="contained" onClick={handleEditSave}>
      Save
    </Button>
  </DialogActions>
</Dialog>

    </Container>
  );
}
