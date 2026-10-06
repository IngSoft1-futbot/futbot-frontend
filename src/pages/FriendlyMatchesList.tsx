import React, { useState, useEffect, useRef } from 'react';
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

interface UserTeam {
  id_team: number;
  name: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const FriendlyMatchesList: React.FC = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
  const currentUserId = Number(localStorage.getItem('user_id')) || 1;

  // Referencia para mantener el WebSocket activo sin provocar re-renders
  const wsRef = useRef<WebSocket | null>(null);

  const [matches, setMatches] = useState<FriendlyMatch[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados para Modal de Selección de Equipo al Unirse
  const [joiningMatchId, setJoiningMatchId] = useState<number | null>(null);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Buscar si el usuario actual tiene una sala creada abierta
  const myCreatedMatch = matches.find(
    m => m.creator_id === currentUserId && m.status === 'open'
  );

  // 1. Cargar lista de partidos
  const fetchFriendlyMatches = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/friendly-matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  // 2. CONEXIÓN WEBSOCKET USANDO useRef
  useEffect(() => {
    if (!myCreatedMatch) {
      // Si no hay sala, nos aseguramos de cerrar cualquier socket previo
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/amistoso/${myCreatedMatch.id_match}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`Conectado al WebSocket de la sala #${myCreatedMatch.id_match}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tipo === 'jugador_unido' || data.tipo === 'partido_iniciado') {
          ws.close();
          wsRef.current = null;
          navigate(`/match/${myCreatedMatch.id_match}`);
        }
      } catch (err) {
        console.error("Error al procesar mensaje WebSocket:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("Error en WebSocket de la sala:", error);
    };

    return () => {
      // Limpieza al desmontar o cambiar de estado
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [myCreatedMatch, navigate, token]);

  // 3. Crear Sala
  const handleCreateRoom = async (data: CreateRoomData) => {
    const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/friendly-matches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        home_team_id: data.teamId,
        match_duration: data.durationMinutes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al crear la sala.");
    }

    await fetchFriendlyMatches();
  };

  // 4. Cancelar Sala (Cierra explícitamente el socket usando wsRef)
  const handleCancelRoom = async (matchId: number) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/friendly-matches/${matchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMatches(prev => prev.filter(match => match.id_match !== matchId));
      }
    } catch (error) {
      console.error("Error al cancelar la sala:", error);
    }
  };

  // 5. Abrir Modal de selección de equipo para unirse
  const handleOpenJoinModal = async (matchId: number) => {
    setJoiningMatchId(matchId);
    setSelectedTeamId(null);
    setIsLoadingTeams(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const teamsData = await response.json();
        setUserTeams(teamsData.data || teamsData || []);
      }
    } catch (error) {
      console.error("Error al obtener equipos del usuario:", error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // 6. Confirmar Unión con equipo propio
  const handleConfirmJoinMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningMatchId || !selectedTeamId) return;

    setIsJoining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/friendly-matches/${joiningMatchId}/away-team`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          away_team_id: selectedTeamId
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/match/${data.id_match || joiningMatchId}`);
      } else {
        const err = await response.json();
        alert(err.detail || "Error al unirse al partido");
      }
    } catch (error) {
      console.error("Error al unirse al partido:", error);
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
                        <strong className="text-gray-800">Equipo Local:</strong> {match.home_team_name || `ID #${match.home_team_id}`}
                      </p>
                      <p>
                        <strong className="text-gray-800">Duración por cuarto:</strong> {match.match_duration} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isOwner && !isInProgress && (
                      <button
                        onClick={() => handleOpenJoinModal(match.id_match)}
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
            onClick={() => setShowCreateModal(true)}
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

      {/* Modal de Creación de Partido */}
      <CreateFriendlyMatchModal
        isOpen={showCreateModal}
        userId={currentUserId}
        token={token}
        onClose={() => setShowCreateModal(false)}
        onCreateMatch={handleCreateRoom}
      />

      {/* Modal de Selección de Equipo para UNIRSE */}
      {joiningMatchId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Seleccionar tu Equipo Visitante</h3>

            {isLoadingTeams ? (
              <p className="text-center text-gray-500 py-4">Cargando tus equipos...</p>
            ) : userTeams.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-500 mb-4">No tienes equipos registrados. Crea uno antes de unirte.</p>
                <button
                  type="button"
                  onClick={() => setJoiningMatchId(null)}
                  className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmJoinMatch} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Elije con qué equipo deseas jugar:
                  </label>
                  <div className="border rounded-md divide-y divide-gray-200 max-h-48 overflow-y-auto">
                    {userTeams.map((team) => (
                      <label
                        key={team.id_team}
                        className={`flex items-center p-3 cursor-pointer transition-colors ${
                          selectedTeamId === team.id_team ? 'bg-green-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedJoinTeam"
                          value={team.id_team}
                          checked={selectedTeamId === team.id_team}
                          onChange={() => setSelectedTeamId(team.id_team)}
                          className="text-green-600 focus:ring-green-500 h-4 w-4"
                        />
                        <span className="ml-3 font-medium text-gray-800">{team.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setJoiningMatchId(null)}
                    disabled={isJoining}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedTeamId || isJoining}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isJoining ? 'Uniéndose...' : 'Confirmar y Jugar'}
                  </button>
                </div>
              </form>
            )}
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
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400 mb-2"></div>
              <h2 className="text-3xl font-extrabold text-white tracking-wide">
                ESPERANDO OPONENTE
              </h2>
              <p className="text-gray-300 text-base">
                Tu sala fue creada. En cuanto un oponente se una, la partida comenzará automáticamente.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 w-full text-left text-sm text-gray-300 space-y-2">
              <p><strong className="text-white">Equipo Local:</strong> {myCreatedMatch.home_team_name || `#${myCreatedMatch.home_team_id}`}</p>
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