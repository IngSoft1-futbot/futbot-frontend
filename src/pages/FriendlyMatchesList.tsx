import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Team } from '../common/teamModel';
import { mockUsers } from '../api/users';

interface FriendlyMatch {
  id: number;
  creatorClub: string;
  teamName: string;
  creatorId: string;
  guestUserId?: string | null;
  status: 'waiting' | 'in_progress' | 'finished';
}

const FriendlyMatchesList: React.FC = () => {
  const navigate = useNavigate();

  // Usuario logueado actual
  const currentUser = mockUsers[1]; 
  const currentUserId = `user_${currentUser.user_id}`;

  // Estado inicial de partidos
  const [matches, setMatches] = useState<FriendlyMatch[]>([
    {//partido disponible para unirse
      id: 1,
      creatorClub: 'Boca Juniors',
      teamName: 'Xeneize FC',
      creatorId: 'user_99',
      guestUserId: null,
      status: 'waiting',
    },
    {//partido ya empezado
      id: 2,
      creatorClub: 'River Plate',
      teamName: 'Millonarios',
      creatorId: 'user_88',
      guestUserId: 'user_77',
      status: 'in_progress',
    },
  ]);

  // Modales y carga de equipos
  const [showModal, setShowModal] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Verificar si el usuario actual tiene una sala activa creada
  const hasCreatedRoom = Boolean(matches.find(m => m.creatorId === currentUserId && m.status !== 'finished'));
  // Verificar si el usuario actual está jugando en alguna sala
  const userActiveMatch = matches.find(
    m => (m.creatorId === currentUserId || m.guestUserId === currentUserId) && m.status !== 'finished'
  );

  useEffect(() => {
    if (showModal) {
      fetchUserTeams();
    }
  }, [showModal]);

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

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamName || hasCreatedRoom) return;

    //Creación de sala de partido amistoso
    const newMatch: FriendlyMatch = {
      id: Date.now(),
      creatorClub: 'Mi Club FC',
      teamName: selectedTeamName,
      creatorId: currentUserId,
      guestUserId: null,
      status: 'waiting',
    };

    setMatches(prev => [...prev, newMatch]);
    setSelectedTeamName('');
    setShowModal(false);
  };

  const handleJoinMatch = (matchId: number) => {
    setMatches(prev =>
      prev.map(match =>
        match.id === matchId
          ? { ...match, guestUserId: currentUserId, status: 'in_progress' }
          : match
      )
    );

    navigate(`/match/${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Partidos Amistosos Disponibles</h2>
          <button
            onClick={() => navigate('/Main')}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Volver al Menú
          </button>
        </div>

        {hasCreatedRoom && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md">
            Ya has creado una sala. Estás esperando a que un oponente se una.
          </div>
        )}

        {matches.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No hay partidos disponibles. ¡Crea una sala abajo!
          </p>
        ) : (
          <div className="grid gap-4 mb-8">
            {matches.map(match => {
              const isOwner = match.creatorId === currentUserId;
              const isGuest = match.guestUserId === currentUserId;
              const isParticipant = isOwner || isGuest;
              const isInProgress = match.status === 'in_progress';

              return (
                <div
                  key={match.id}
                  className={`border rounded-lg p-4 flex justify-between items-center transition-colors ${
                    isOwner
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg text-gray-900">{match.teamName}</span>
                      {isOwner && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          Tu Sala
                        </span>
                      )}
                      {isInProgress && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded animate-pulse">
                          En Juego
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Club:</strong> {match.creatorClub}
                    </p>
                  </div>

                  {/* Lógica de botones */}
                  <div>
                    {/* Caso 1: Creador esperando que se una alguien */}
                    {isOwner && !isInProgress && (
                      <button
                        disabled
                        className="bg-amber-100 text-amber-700 border border-amber-300 px-4 py-2 rounded-md text-sm font-semibold cursor-not-allowed flex items-center space-x-2"
                      >
                        <span className="animate-pulse h-2 w-2 bg-amber-500 rounded-full"></span>
                        <span>Esperando oponente...</span>
                      </button>
                    )}

                    {/* Caso 2: El partido ya está en juego (para participantes o espectadores terceros) */}
                    {isInProgress && (
                      <button
                        onClick={() => navigate(`/match/${match.id}`)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                      >
                        {isParticipant ? 'Ir al Partido' : 'Ver Partido'}
                      </button>
                    )}

                    {/* Caso 3: Sala disponible para unirse (solo si el usuario actual no tiene una sala activa) */}
                    {!isOwner && !isInProgress && (
                      <button
                        onClick={() => handleJoinMatch(match.id)}
                        disabled={Boolean(userActiveMatch)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                          userActiveMatch
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        Unirse
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t pt-6 flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            disabled={hasCreatedRoom}
            className={`w-full sm:w-auto py-3 px-6 rounded-md font-semibold transition-colors duration-200 shadow-sm ${
              hasCreatedRoom
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {hasCreatedRoom ? 'Ya tienes una sala activa' : '+ Crear Sala de Partido'}
          </button>
        </div>
      </div>

      {/* Modal Selección de Equipo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Seleccionar Equipo</h3>

            {isLoadingTeams ? (
              <p className="text-center text-gray-500 py-4">Cargando tus equipos...</p>
            ) : (
              <form onSubmit={handleCreateRoom} className="space-y-4">
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
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTeamName('');
                    }}
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
      )}
    </div>
  );
};

export default FriendlyMatchesList;