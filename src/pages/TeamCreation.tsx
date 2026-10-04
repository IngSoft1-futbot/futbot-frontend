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

  const [selectedIds, setSelectedIds] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const [teamName, setTeamName] = useState<string>("");

  const [behaviors, setBehaviors] = useState<Behavior[]>([
    {
      behavior_id: 0,
      name: "Default Behavior",
    },
    {
      behavior_id: 1,
      name: "Behavior One",
    },
    {
      behavior_id: 2,
      name: "Behavior Two",
    },
  ]);

  const [selectedBehaviors, setSelectedBehaviors] = useState<(number | null)[]>(
    [null, null, null, null, null, null],
  );

  const [team, setTeam] = useState<Team>({
    name: "Mi equipo",
    jugadores_titulares: [
      { player_id: 0, behavior_id: 0 },
      { player_id: 0, behavior_id: 0 },
      { player_id: 0, behavior_id: 0 },
    ],
    jugadores_suplentes: [
      { player_id: 0, behavior_id: 0 },
      { player_id: 0, behavior_id: 0 },
      { player_id: 0, behavior_id: 0 },
    ],
  });

  // Log team whenever it changes
  useEffect(() => {
    console.log("Team updated:", team);
  }, [team]);

  useEffect(() => {
    const fetchUserPlayers = async () => {
      try {
        setLoading(true);
        const userPlayers = await getUserPlayers();
        setPlayers(userPlayers);
        console.log("Players updated:", userPlayers);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch players",
        );
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlayers();
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
        return await response.json();
      } else {
        throw new Error(`Failed to fetch players: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      return []; // Return empty array on error instead of undefined
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

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    let newTeam: Team = {
      name: "",
      jugadores_titulares: [
        { player_id: 0, behavior_id: 0 },
        { player_id: 0, behavior_id: 0 },
        { player_id: 0, behavior_id: 0 },
      ],
      jugadores_suplentes: [
        { player_id: 0, behavior_id: 0 },
        { player_id: 0, behavior_id: 0 },
        { player_id: 0, behavior_id: 0 },
      ],
    };

    if (teamName !== undefined) {
      newTeam.name = teamName;
    }

    for (let index = 0; index < selectedIds.length; index++) {
      if (players != null) {
        if (index < 3) {
          newTeam.jugadores_titulares[index] = {
            player_id: selectedIds[index] ?? 0,
            behavior_id: selectedBehaviors[index] ?? 0,
          };
        } else {
          newTeam.jugadores_suplentes[index - 3] = {
            player_id: selectedIds[index] ?? 0,
            behavior_id: selectedBehaviors[index] ?? 0,
          };
        }
      }
    }
    setTeam(newTeam);
    alert("Equipo creado satisfactoriamente");

    setTimeout(() => {
      navigate("/Main");
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-gray-100  items-center flex justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 ">Crear equipo</h2>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              required
              id="teamName"
              maxLength={20}
              onChange={handleTeamNameChange}
              placeholder="Nombre del equipo"
            />
          </label>

          <div className="flex flex-col">
            <p>Jugadores Titulares:</p>
            {[0, 1, 2].map((slot) => (
              <div key={slot}>
                <select
                  className="border-red-500 mb-2"
                  value={selectedIds[slot] ?? ""}
                  onChange={(e) => handlePlayerSelection(slot, e)}
                  required
                >
                  <option value="">Seleccionar jugador</option>
                  {getOptionsForSlot(slot).map((player: Player) => (
                    <option key={player.player_id} value={player.player_id}>
                      {" "}
                      {player.name}{" "}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBehaviors[slot] ?? ""}
                  onChange={(e) => handleBehaviorSelection(slot, e)}
                  required
                  className="mb-2"
                >
                  <option value="">Seleccionar Comportamiento</option>
                  {behaviors.map((behavior) => (
                    <option
                      key={behavior.behavior_id}
                      value={behavior.behavior_id}
                    >
                      {" "}
                      {behavior.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div>
            <p>Jugadores Suplentes:</p>
            {[3, 4, 5].map((slot) => (
              <div key={slot}>
                <select
                  className="border-red-500 mb-2"
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
                  value={selectedBehaviors[slot] ?? ""}
                  onChange={(e) => handleBehaviorSelection(slot, e)}
                  required
                  className="mb-2"
                >
                  <option value="">Seleccionar Comportamiento</option>
                  {behaviors.map((behavior) => (
                    <option
                      key={behavior.behavior_id}
                      value={behavior.behavior_id}
                    >
                      {" "}
                      {behavior.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button type="submit"> Crear Equipo </button>
        </form>
      </div>
    </div>
  );
};

export default TeamCreation;
