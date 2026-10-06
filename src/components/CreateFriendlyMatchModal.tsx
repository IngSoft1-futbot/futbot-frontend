import React, { useState, useEffect } from 'react';

export interface CreateRoomData {
  teamName: string;
  durationMinutes: number;
}

interface TeamFromBackend {
  team_id: number;
  name: string;
}

interface CreateFriendlyMatchModalProps {
  isOpen: boolean;
  userId: number;
  token: string;
  onClose: () => void;
  onCreateMatch: (data: CreateRoomData) => Promise<void>;
}

export const CreateFriendlyMatchModal: React.FC<CreateFriendlyMatchModalProps> = ({
  isOpen,
  userId,
  token,
  onClose,
  onCreateMatch,
}) => {
  const [userTeams, setUserTeams] = useState<TeamFromBackend[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserTeams();
    }
  }, [isOpen]);

  const fetchUserTeams = async () => {
    setIsLoadingTeams(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los equipos.");
      }

      const data = await response.json();
      const teamsData = data.data;
      setUserTeams(teamsData);
      if (teamsData.length > 0) {
        setSelectedTeamId(teamsData[0].team_id);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    const selectedTeam = userTeams.find(team => team.team_id === selectedTeamId);
    if (!selectedTeam) {
      setErrorMessage("El equipo seleccionado ya no está disponible.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onCreateMatch({
        teamName: selectedTeam.name,
        durationMinutes,
      });

      setSelectedTeamId(null);
      setDurationMinutes(2);
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "No se pudo crear la sala.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTeamId(null);
    setDurationMinutes(2);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Crear Sala de Partido Amistoso</h3>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {errorMessage}
          </div>
        )}

        {isLoadingTeams ? (
          <p className="text-center text-gray-500 py-4">Cargando tus equipos...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selecciona tu Equipo:
              </label>

              {userTeams.length === 0 ? (
                <p className="text-sm text-red-500">No tienes equipos creados. Crea uno primero.</p>
              ) : (
                <div className="border rounded-md divide-y divide-gray-200 max-h-40 overflow-y-auto">
                  {userTeams.map(team => (
                    <label
                      key={team.team_id}
                      className={`flex items-center p-3 cursor-pointer transition-colors ${
                        selectedTeamId === team.team_id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedTeam"
                        value={team.team_id}
                        checked={selectedTeamId === team.team_id}
                        onChange={() => setSelectedTeamId(team.team_id)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="ml-3 font-medium text-gray-800">{team.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duración de cada cuarto (minutos):
              </label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                <option value={1}>1 Minuto por cuarto</option>
                <option value={2}>2 Minutos por cuarto</option>
                <option value={3}>3 Minutos por cuarto</option>
                <option value={4}>4 Minutos por cuarto</option>
                <option value={5}>5 Minutos por cuarto</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tiempo de juego asignado a cada uno de los cuatro tiempos del encuentro.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedTeamId || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando...' : 'Crear Sala'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};