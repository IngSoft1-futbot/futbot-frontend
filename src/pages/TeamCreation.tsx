import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Behavior } from "../common/behaviorModel";
import type { Player } from "../common/playerModel";
import type { Team } from "../common/teamModel";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "http://127.0.0.1:8000";

const TeamCreation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedIds, setSelectedIds] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const [teamName, setTeamName] = useState<string>("");

  // Estado inicial vacío, se llenará con el fetch
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);

  const [selectedBehaviors, setSelectedBehaviors] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Hacemos el fetch de jugadores y comportamientos en paralelo
        const [userPlayers, userBehaviors] = await Promise.all([
          getUserPlayers(),
          getUserBehaviors()
        ]);
        
        setPlayers(userPlayers);
        setBehaviors(userBehaviors);
        
        console.log("Players updated:", userPlayers);
        console.log("Behaviors updated:", userBehaviors);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch data",
        );
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const getUserPlayers = async () => {
    if (!token) {
      console.log("No token found. Please log in.");
      return [];
    }

    try {
      const decodedToken = jwtDecode(token);
      const user_id = parseInt(decodedToken.sub ?? "-1");

      if (Number.isNaN(user_id)) {
        throw new Error("Invalid sub in token");
      }

      const response = await fetch(`${API_BASE_URL}/users/${user_id}/players`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log("¡Jugadores recibidos satisfactoriamente!");
        // Asumiendo que el endpoint de jugadores devuelve directamente la lista
        // Si tiene un formato con "data" como behaviors, cambialo a: const res = await response.json(); return res.data;
        return await response.json();
      } else {
        throw new Error(`Failed to fetch players: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      return [];
    }
  };

  const getUserBehaviors = async () => {
    if (!token) {
      console.log("No token found. Please log in.");
      return [];
    }

    try {
      const decodedToken = jwtDecode(token);
      const user_id = parseInt(decodedToken.sub ?? "-1");

      if (Number.isNaN(user_id)) {
        throw new Error("Invalid sub in token");
      }

      const response = await fetch(`${API_BASE_URL}/users/${user_id}/behaviors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log("¡Comportamientos recibidos satisfactoriamente!");
        const jsonResponse = await response.json();
        // Basado en el endpoint, los behaviors vienen dentro de la propiedad "data"
        return jsonResponse.data; 
      } else {
        throw new Error(`Failed to fetch behaviors: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching behaviors:", error);
      return [];
    }
  };

  const handlePlayerSelection = (
    slot: number,
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value);
    setSelectedIds((prev) => prev.map((id, i) => (i === slot ? value : id)));
  };

  const handleBehaviorSelection = (
    slot: number,
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value);

    setSelectedBehaviors((prev) =>
      prev.map((id, i) => (i === slot ? value : id)),
    );
  };

  const getOptionsForSlot = (slot: number) => {
    if (players != null) {
      return players.filter(
        (p) => !selectedIds.some((id, i) => i !== slot && id === p.player_id),
      );
    } else {
      throw error;
    }
  };

  function handleTeamNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTeamName(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      setCreationError("Debes iniciar sesión para crear un equipo.");
      return;
    }

    if (selectedIds.some((playerId) => playerId === null) ||
      selectedBehaviors.some((behaviorId) => behaviorId === null)) {
      setCreationError("Selecciona un jugador y un comportamiento para cada puesto.");
      return;
    }

    const getAssignment = (index: number) => {
      const playerId = selectedIds[index];
      const behaviorId = selectedBehaviors[index];
      if (playerId == null || behaviorId == null) {
        throw new Error("Selecciona un jugador y un comportamiento para cada puesto.");
      }
      return { player_id: playerId, behavior_id: behaviorId };
    };

    const newTeam: Team = {
      name: teamName.trim(),
      jugadores_titulares: [getAssignment(0), getAssignment(1), getAssignment(2)],
      jugadores_suplentes: [getAssignment(3), getAssignment(4), getAssignment(5)],
    };

    try {
      setSubmitting(true);
      setCreationError(null);
      const userId = Number(jwtDecode(token).sub);
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("No se pudo identificar al usuario. Inicia sesión nuevamente.");
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTeam),
      });

      if (!response.ok) {
        const responseBody: unknown = await response.json();
        const detail =
          typeof responseBody === "object" &&
          responseBody !== null &&
          "detail" in responseBody &&
          typeof responseBody.detail === "string"
            ? responseBody.detail
            : `Error ${response.status}`;
        throw new Error(detail);
      }

      window.alert("Equipo creado satisfactoriamente");
      navigate("/Main");
    } catch (err) {
      setCreationError(
        err instanceof Error ? err.message : "No se pudo crear el equipo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 items-center flex justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Crear equipo</h2>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              required
              id="teamName"
              maxLength={30}
              onChange={handleTeamNameChange}
              placeholder="Nombre del equipo"
              className="mb-4 w-full p-2 border rounded"
            />
          </label>

          <div className="flex flex-col">
            <p className="font-semibold mb-2">Jugadores Titulares:</p>
            {[0, 1, 2].map((slot) => (
              <div key={slot} className="flex flex-col mb-4">
                <select
                  className="p-2 border rounded mb-2"
                  value={selectedIds[slot] ?? ""}
                  onChange={(e) => handlePlayerSelection(slot, e)}
                  required
                >
                  <option value="">Seleccionar jugador</option>
                  {getOptionsForSlot(slot).map((player: Player) => (
                    <option key={player.player_id} value={player.player_id}>
                      {player.name}
                    </option>
                  ))}
                </select>

                <select
                  className="p-2 border rounded"
                  value={selectedBehaviors[slot] ?? ""}
                  onChange={(e) => handleBehaviorSelection(slot, e)}
                  required
                >
                  <option value="">Seleccionar Comportamiento</option>
                  {behaviors.map((behavior) => (
                    <option
                      key={behavior.behavior_id}
                      value={behavior.behavior_id}
                    >
                      {behavior.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <p className="font-semibold mb-2 mt-4">Jugadores Suplentes:</p>
            {[3, 4, 5].map((slot) => (
              <div key={slot} className="flex flex-col mb-4">
                <select
                  className="p-2 border rounded mb-2"
                  value={selectedIds[slot] ?? ""}
                  onChange={(e) => handlePlayerSelection(slot, e)}
                  required
                >
                  <option value="">Seleccionar jugador</option>
                  {getOptionsForSlot(slot).map((player: Player) => (
                    <option key={player.player_id} value={player.player_id}>
                      {player.name}
                    </option>
                  ))}
                </select>

                <select
                  className="p-2 border rounded"
                  value={selectedBehaviors[slot] ?? ""}
                  onChange={(e) => handleBehaviorSelection(slot, e)}
                  required
                >
                  <option value="">Seleccionar Comportamiento</option>
                  {behaviors.map((behavior) => (
                    <option
                      key={behavior.behavior_id}
                      value={behavior.behavior_id}
                    >
                      {behavior.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {creationError && (
            <p role="alert" className="text-red-500">
              Error al crear el equipo: {creationError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {submitting ? "Creando..." : "Crear Equipo"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamCreation;