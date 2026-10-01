import React, { useState, useEffect } from 'react';
import type { Team } from '../common/teamModel';

// Definir las Props que recibirá el modal desde la vista contenedora
interface CreateFriendlyMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (selectedTeamName: string) => void;
}

export const CreateFriendlyMatchModal: React.FC<CreateFriendlyMatchModalProps> = ({
  isOpen,
  onClose,
  onCreateMatch,
}) => {
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Cada vez que se abra el modal, consultamos los equipos del usuario
  useEffect(() => {
    if (isOpen) {
      fetchUserTeams();
    }
  }, [isOpen]);

  const fetchUserTeams = async () => {
    setIsLoadingTeams(true);
    try {
      setTimeout(() => {
        const mockFetchedTeams: Team[] = [
          {
            name: 'Barcelona',
            jugadores_titulares: [{ player_id: 1, behavior_id: 1 }, { player_id: 2, behavior_id: 1 }, { player_id: 3, behavior_id: 1 }],
            jugadores_suplentes: [{ player_id: 4, behavior_id: 1 }, { player_id: 5, behavior_id: 1 }, { player_id: 6, behavior_id: 1 }]
          },
          {
            name: 'Boca',
            jugadores_titulares: [{ player_id: 7, behavior_id: 1 }, { player_id: 8, behavior_id: 1 }, { player_id: 9, behavior_id: 1 }],
            jugadores_suplentes: [{ player_id: 10, behavior_id: 1 }, { player_id: 11, behavior_id: 1 }, { player_id: 12, behavior_id: 1 }]
          },
          {
            name: 'River',
            jugadores_titulares: [{ player_id: 13, behavior_id: 1 }, { player_id: 14, behavior_id: 1 }, { player_id: 15, behavior_id: 1 }],
            jugadores_suplentes: [{ player_id: 16, behavior_id: 1 }, { player_id: 17, behavior_id: 1 }, { player_id: 18, behavior_id: 1 }]
          },
          {
            name: 'Velez',
            jugadores_titulares: [{ player_id: 19, behavior_id: 1 }, { player_id: 20, behavior_id: 1 }, { player_id: 21, behavior_id: 1 }],
            jugadores_suplentes: [{ player_id: 22, behavior_id: 1 }, { player_id: 23, behavior_id: 1 }, { player_id: 24, behavior_id: 1 }]
          }
        ];
        setUserTeams(mockFetchedTeams);
        setIsLoadingTeams(false);
      }, 300);
    } catch (error) {
      console.error("Error al obtener equipos:", error);
      setIsLoadingTeams(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamName) return;

    // Ejecuta el callback enviando el equipo seleccionado
    onCreateMatch(selectedTeamName);

    // Resetea y cierra
    setSelectedTeamName('');
    onClose();
  };

  const handleClose = () => {
    setSelectedTeamName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Seleccionar Equipo</h3>

        {isLoadingTeams ? (
          <p className="text-center text-gray-500 py-4">Cargando tus equipos...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Equipos disponibles del club:
              </label>

              {userTeams.length === 0 ? (
                <p className="text-sm text-red-500">No tienes equipos creados. Crea uno primero.</p>
              ) : (
                <div className="border rounded-md divide-y divide-gray-200 max-h-48 overflow-y-auto">
                  {userTeams.map((team, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center p-3 cursor-pointer transition-colors ${
                        selectedTeamName === team.name ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedTeam"
                        value={team.name}
                        checked={selectedTeamName === team.name}
                        onChange={e => setSelectedTeamName(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="ml-3 font-medium text-gray-800">{team.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedTeamName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Crear Sala
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};