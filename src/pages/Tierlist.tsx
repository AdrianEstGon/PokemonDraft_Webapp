import { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Card, CardMedia,
  Tooltip, IconButton, CircularProgress
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import {
  DndContext, closestCenter, DragOverlay,
  type DragStartEvent, type DragEndEvent
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import toast, { Toaster } from "react-hot-toast";
import { getPokemons, updatePokemon } from "../services/PokemonService";
import { motion } from "framer-motion";

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  role: string;
  tier?: string | null;
}

const tiersList = ["S","A","B","C"] as const;
const tierColors: Record<string, string> = {
  S:"#ff5252", A:"#ff9800", B:"#ffeb3b", C:"#8bc34a", D:"#2196f3"
};

/* ---------------- DroppableTier ---------------- */
function DroppableTier({ id, title, color, children }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Paper
      ref={setNodeRef}
      elevation={3}
      sx={{
        mb:1, p:1, borderRadius:1, bgcolor:color,
        transition:"all 0.2s",
        boxShadow: isOver ? "0 6px 16px rgba(0,0,0,0.35)" : undefined,
        transform: isOver ? "scale(1.02)" : undefined
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" sx={{ color:"#fff", mb:0.5 }}>
        Tier {title}
      </Typography>
      <Box sx={{ display:"flex", gap:0.25, flexWrap:"wrap" }}>{children}</Box>
    </Paper>
  );
}

/* ---------------- AvailableDroppable ---------------- */
function AvailableDroppable({ children }: any) {
  const { setNodeRef, isOver } = useDroppable({ id: "available" });
  return (
    <Paper
      ref={setNodeRef}
      elevation={3}
      sx={{
        p:0.5, borderRadius:1, bgcolor: isOver ? "#f0f0f0" : "#fafafa",
        overflowY:"auto",
        transition:"all 0.2s",
        boxShadow: isOver ? "0 6px 16px rgba(0,0,0,0.2)" : undefined,
        transform: isOver ? "scale(1.01)" : undefined
      }}
    >
      {children}
    </Paper>
  );
}

/* ---------------- DraggablePokemon ---------------- */
function DraggablePokemon({ pokemon, size=40 }: { pokemon: Pokemon; size?: number }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: String(pokemon.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    touchAction: "manipulation" as const,
    transition: "transform 0.15s ease"
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes} {...listeners}
      sx={{
        width:size, height:size, borderRadius:1, p:0.1,
        border:"1px solid rgba(0,0,0,0.1)", bgcolor:"#fff",
        boxShadow:"0 1px 4px rgba(0,0,0,0.1)",
        display:"flex", alignItems:"center", justifyContent:"center",
        ...style
      }}
    >
      <CardMedia
        component="img"
        image={pokemon.imageUrl}
        alt={pokemon.name}
        sx={{ width:size-4, height:size-4, objectFit:"contain" }}
      />
    </Card>
  );
}

/* ---------------- Main Page ---------------- */
export default function PokemonTierListPage() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePokemon, setActivePokemon] = useState<Pokemon | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const pokes = await getPokemons();
        const seen = new Set<number>();
        const clean = pokes.filter((p: { id: number; }) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setPokemons(clean.map((p: { tier: any; }) => ({...p, tier: p.tier ?? null})));
      } catch(err) {
        console.error(err);
        toast.error("Error loading pokemons");
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const id = Number(event.active.id);
    const found = pokemons.find(p => p.id === id) || null;
    setActivePokemon(found);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActivePokemon(null);
    if (!over) return;
    const overId = String(over.id);
    setPokemons(prev =>
      prev.map(p =>
        p.id === Number(active.id)
          ? { ...p, tier: overId === "available" ? null : overId }
          : p
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        pokemons.map(p => updatePokemon(p.id, {...p, tier: p.tier || null}))
      );
      toast.success("Tiers saved!");
    } catch(err) {
      console.error(err);
      toast.error("Error saving tiers");
    } finally { setSaving(false); }
  };

  const handleReset = () => {
    setPokemons(prev => prev.map(p => ({...p, tier:null})));
    toast.success("Tier list reset!");
  };

  if (loading)
  return (
    <Box
        sx={{
          flex: 1,
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.img
          src="/pokeball.png" // ⚠️ asegúrate de poner la imagen en public/
          alt="Loading Pokémons..."
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{ width: "min(50vw, 180px)", height: "auto" }}
        />
      </Box>
  );


  const tiers: Record<string, Pokemon[]> = {};
  tiersList.forEach(t => { tiers[t] = pokemons.filter(p => p.tier===t); });
  const available = pokemons.filter(p => !p.tier);

  return (
    <Box sx={{height:"100vh", width:"90vw", display:"flex", flexDirection:"column", p:1, mt:10}}>
      <Toaster position="top-right" />
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{flex:1, display:"flex", flexDirection:"column", gap:0, overflow:"hidden"}}>
          <Box sx={{overflowY:"auto"}}>
            {tiersList.map(t=>(
              <DroppableTier key={t} id={t} title={t} color={tierColors[t]}>
                {tiers[t].length===0
                  ? <Typography color="white">Drag Pokemon here</Typography>
                  : tiers[t].map(p=><DraggablePokemon key={p.id} pokemon={p} size={40} />)}
              </DroppableTier>
            ))}
          </Box>

          {/* Available ahora es droppable real */}
          <AvailableDroppable>
            <Box sx={{display:"grid", gap:0.1, gridTemplateColumns:"repeat(20, 1fr)"}}>
              {available.map(p=><DraggablePokemon key={p.id} pokemon={p} size={80} />)}
            </Box>
          </AvailableDroppable>
        </Box>

        {/* Overlay bonito */}
        <DragOverlay>
          {activePokemon && (
            <Card
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                p: 0.5,
                bgcolor: "white",
                boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "scale(1.1)",
                transition: "transform 0.15s ease"
              }}
            >
              <CardMedia
                component="img"
                image={activePokemon.imageUrl}
                alt={activePokemon.name}
                sx={{ width:72, height:72, objectFit:"contain" }}
              />
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      {/* Reset y Save */}
      <Tooltip title="Reset Tier List">
        <IconButton
          sx={{position:"fixed", bottom:72, right:16, bgcolor:"white", boxShadow:2}}
          onClick={handleReset}
        >
          <RestartAltIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={saving ? "Saving..." : "Save Tier List"}>
        <span>
          <IconButton
            sx={{position:"fixed", bottom:16, right:16, bgcolor:"white", boxShadow:2}}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24}/> : <SaveIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
