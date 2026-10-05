import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateFriendlyMatchModal, type CreateRoomData } from '../components/CreateFriendlyMatchModal';

interface FriendlyMatch {
  id_match: number;
  home_team_id: number;
  home_team_name?: string;
  creator_name?: string;
  creator_id?: number;
  match_duration: number;
  away_team_id: number | null;
  status: 'open' | 'started' | 'finished' | 'cancelled';
}

interface TeamSummary {
  team_id: number;
  name: string;
}

const API_BASE_URL = 'http://localhost:8000';

const FriendlyMatchesList: React.FC = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token') || '';
  const currentUserId = Number(localStorage.getItem('user_id')) || 1;

  const [matches, setMatches] = useState<FriendlyMatch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joinMatchId, setJoinMatchId] = useState<number | null>(null);
  const [joinTeams, setJoinTeams] = useState<TeamSummary[]>([]);
  const [isLoadingJoinTeams, setIsLoadingJoinTeams] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const myCreatedMatch = matches.find(
    m => m.creator_id === currentUserId && m.status === 'open'
  );

  const fetchFriendlyMatches = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/friendly-matches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error("Error cargando partidos amistosos:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFriendlyMatches();
  }, []);

  const handleCreateRoom = async (data: CreateRoomData) => {
    const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/friendly-matches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        home_team_id: data.teamId,
        team_name: data.team_name,
        match_duration: data.durationMinutes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al crear la sala.");
    }

    await fetchFriendlyMatches();
  };

  const handleCancelRoom = async (matchId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/friendly-matches/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMatches(prev => prev.filter(match => match.id_match !== matchId));
      }
    } catch (error) {
      console.error("Error al cancelar la sala:", error);
    }
  };

  const handleJoinMatch = async (matchId: number) => {
    setJoinMatchId(matchId);
    setJoinTeams([]);
    setJoinError('');
    setIsLoadingJoinTeams(true);
    try {
      const teamsResponse = await fetch(`${API_BASE_URL}/users/${currentUserId}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!teamsResponse.ok) {
        const errorData = await teamsResponse.json();
        throw new Error(errorData.detail || 'No se pudieron cargar tus equipos.');
      }
      const teamsData: { data: TeamSummary[] } = await teamsResponse.json();
      setJoinTeams(teamsData.data);
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'No se pudieron cargar tus equipos.');
    } finally {
      setIsLoadingJoinTeams(false);
    }
  };

  const submitJoinMatch = async (matchId: number, teamId: number) => {
    setIsJoining(true);
    setJoinError('');
    try {
      const response = await fetch(`${API_BASE_URL}/friendly-matches/${matchId}/join`, {
        method: 'POST',
        body: JSON.stringify({ team_id: teamId }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'No se pudo unir al partido.');
      }

      if (response.ok) {
        const data = await response.json();
        navigate(`/match/${data.id_match || matchId}`);
      }
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'No se pudo unir al partido.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">Partidos Amistosos Disponibles</h2>
            <button
              onClick={fetchFriendlyMatches}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isRefreshing ? 'Actualizando...' : '🔄 Actualizar lista'}
            </button>
          </div>

          <button
            onClick={() => navigate('/Main')}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Volver al Menú
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Cargando salas...</p>
        ) : matches.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No hay partidos disponibles. ¡Crea una sala abajo o haz clic en actualizar!
          </p>
        ) : (
          <div className="grid gap-4 mb-8">
            {matches.map(match => {
              const isOwner = match.creator_id === currentUserId;
              const isInProgress = match.status === 'started';

              return (
                <div
                  key={match.id_match}
                  className={`border rounded-lg p-5 flex justify-between items-center transition-colors ${
                    isOwner
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-xl text-gray-900">
                        {match.creator_name || `Creador #${match.home_team_id}`}
                      </span>
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

                    <div className="flex items-center space-x-8 text-sm text-gray-600 pt-1">
                      <p>
                        <strong className="text-gray-800">Equipo:</strong> {match.home_team_name || `Equipo ID #${match.home_team_id}`}
                      </p>
                      <p>
                        <strong className="text-gray-800">Duración por cuarto:</strong> {match.match_duration} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isOwner && !isInProgress && (
                      <button
                        onClick={() => handleJoinMatch(match.id_match)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold transition-colors"
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
            disabled={Boolean(myCreatedMatch)}
            className={`w-full sm:w-auto py-3 px-6 rounded-md font-semibold transition-colors duration-200 shadow-sm ${
              myCreatedMatch
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {myCreatedMatch ? 'Esperando oponente...' : '+ Crear Sala de Partido'}
          </button>
        </div>
      </div>

      <CreateFriendlyMatchModal
        isOpen={showModal}
        userId={currentUserId}
        token={token}
        onClose={() => setShowModal(false)}
        onCreateMatch={handleCreateRoom}
      />

      {joinMatchId !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-match-title"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <h2 id="join-match-title" className="mb-4 text-xl font-bold text-gray-900">
              Elige el equipo para unirte
            </h2>

            {isLoadingJoinTeams ? (
              <p className="py-4 text-center text-gray-600">Cargando tus equipos...</p>
            ) : joinTeams.length === 0 && !joinError ? (
              <p className="py-4 text-center text-gray-600">
                No tienes equipos disponibles para unirte al partido.
              </p>
            ) : (
              <div className="grid gap-2">
                {joinTeams.map(team => (
                  <button
                    key={team.team_id}
                    onClick={() => submitJoinMatch(joinMatchId, team.team_id)}
                    disabled={isJoining}
                    className="rounded-md border border-gray-300 px-4 py-3 text-left font-medium text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            )}

            {joinError && <p role="alert" className="mt-4 text-sm text-red-600">{joinError}</p>}

            <button
              onClick={() => setJoinMatchId(null)}
              disabled={isJoining}
              className="mt-5 w-full rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Pantalla Completa: ESPERANDO OPONENTE */}
      {myCreatedMatch && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-95 flex flex-col justify-between items-center p-8 z-50">
          <div className="w-full flex justify-end">
            <span className="text-gray-400 text-sm font-mono">
              Sala ID: #{myCreatedMatch.id_match}
            </span>
          </div>

          <div className="flex flex-col items-center text-center space-y-6 max-w-lg">
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white tracking-wide">
                ESPERANDO OPONENTE
              </h2>
              <p className="text-gray-300 text-base">
                Tu sala fue creada. El partido comenzará automáticamente cuando alguien se una.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 w-full text-left text-sm text-gray-300 space-y-2">
              <p><strong className="text-white">Equipo:</strong> {myCreatedMatch.home_team_name || `#${myCreatedMatch.home_team_id}`}</p>
              <p><strong className="text-white">Duración por cuarto:</strong> {myCreatedMatch.match_duration} min</p>
            </div>
          </div>

          <div className="w-full max-w-md pb-4">
            <button
              onClick={() => handleCancelRoom(myCreatedMatch.id_match)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-lg transition-colors duration-200 shadow-lg text-lg uppercase tracking-wider"
            >
              Cancelar Sala
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendlyMatchesList;