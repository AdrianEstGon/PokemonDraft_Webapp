import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Fab,
} from "@mui/material";
import { Add, Edit, Delete, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { getPokemons, createPokemon, updatePokemon, deletePokemon } from "../services/PokemonService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  role: string;
}

export default function PokemonCrud() {
    const navigate = useNavigate();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);

  const [form, setForm] = useState({ name: "", imageUrl: "", role: "" });

  useEffect(() => {
    fetchPokemons();
  }, []);

  const fetchPokemons = async () => {
    try {
      setLoading(true);
      const data = await getPokemons();
      setPokemons(data);
    } catch (err) {
      toast.error("Error loading Pokémons");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pokemon?: Pokemon) => {
    if (pokemon) {
      setEditingPokemon(pokemon);
      setForm({ name: pokemon.name, imageUrl: pokemon.imageUrl, role: pokemon.role });
    } else {
      setEditingPokemon(null);
      setForm({ name: "", imageUrl: "", role: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPokemon(null);
  };

  const handleSave = async () => {
    try {
      if (editingPokemon) {
        const updated = await updatePokemon(editingPokemon.id, form);
        setPokemons((prev) => prev.map((p) => (p.id === editingPokemon.id ? updated : p)));
        toast.success("Pokémon updated!");
      } else {
        const created = await createPokemon(form);
        setPokemons((prev) => [...prev, created]);
        toast.success("Pokémon created!");
      }
      handleCloseDialog();
    } catch (err) {
      toast.error("Error saving Pokémon");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Pokémon?")) return;
    try {
      await deletePokemon(id);
      setPokemons((prev) => prev.filter((p) => p.id !== id));
      toast.success("Pokémon deleted!");
    } catch (err) {
      toast.error("Error deleting Pokémon");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Tooltip title="Return to Draft" placement="right">
        <Fab color="primary" onClick={() => navigate("/")} sx={{ position: "fixed", top: 24, left: 24, zIndex: 10, bgcolor: "black" }}>
          <ArrowBackIcon />
        </Fab>
      </Tooltip>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Pokemon Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Pokemon
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pokemons
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pokemon) => (
                  <TableRow key={pokemon.id} hover>
                    <TableCell>{pokemon.id}</TableCell>
                    <TableCell>{pokemon.name}</TableCell>
                    <TableCell>
                      <img src={pokemon.imageUrl} alt={pokemon.name} style={{ width: 50, height: 50 }} />
                    </TableCell>
                    <TableCell>{pokemon.role}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleOpenDialog(pokemon)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(pokemon.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && pokemons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Pokemons found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pokemons.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPokemon ? "Edit Pokémon" : "Add Pokémon"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingPokemon ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
