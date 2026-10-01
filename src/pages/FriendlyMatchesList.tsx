import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../api/users';
import { CreateFriendlyMatchModal } from '../components/CreateFriendlyMatchModal';

// Definición de la interfaz FriendlyMatch
interface FriendlyMatch {
  roomId: number;
  ownerName: string; // Nombre del Club
  teamName: string; 
  creatorId: string;
  guestUserId: string | null;
  status: 'waiting' | 'in_progress' | 'finished';
}

const FriendlyMatchesList: React.FC = () => {
  const navigate = useNavigate();

  // Usuario logueado actual
  const currentUser = mockUsers[1]; 
  const currentUserId = `user_${currentUser.user_id}`;

  // Partidos disponibles (mock data)
  const [matches, setMatches] = useState<FriendlyMatch[]>([
    {
      roomId: 1,
      ownerName: 'Boca Juniors',
      teamName: 'Xeneize FC',
      creatorId: 'user_99',
      guestUserId: null,
      status: 'waiting',
    },
    {
      roomId: 2,
      ownerName: 'River Plate',
      teamName: 'Millonarios',
      creatorId: 'user_88',
      guestUserId: 'user_77',
      status: 'in_progress',
    },
  ]);

  // Estado para visibilidad del modal de creación
  const [showModal, setShowModal] = useState(false);

  // Verificar si el usuario actual tiene una sala activa creada (esperando o jugando)
  const hasCreatedRoom = Boolean(matches.find(m => m.creatorId === currentUserId && m.status !== 'finished'));
  
  // Verificar si el usuario actual está participando en algún partido activo
  const userActiveMatch = matches.find(
    m => (m.creatorId === currentUserId || m.guestUserId === currentUserId) && m.status !== 'finished'
  );

  // Recibe la respuesta del modal cuando se crea una sala con éxito
  const handleCreateRoom = (selectedTeamName: string) => {
    if (hasCreatedRoom) return;

    const newMatch: FriendlyMatch = {
      roomId: Date.now(),
      ownerName: 'Mi Club FC',
      teamName: selectedTeamName,
      creatorId: currentUserId,
      guestUserId: null,
      status: 'waiting',
    };

    setMatches(prev => [...prev, newMatch]);
  };

  const handleCancelRoom = (roomId: number) => {
    setMatches(prev => prev.filter(match => match.roomId !== roomId));
  };

  const handleJoinMatch = (roomId: number) => {
    setMatches(prev =>
      prev.map(match =>
        match.roomId === roomId
          ? { ...match, guestUserId: currentUserId, status: 'in_progress' }
          : match
      )
    );

    navigate(`/match/${roomId}`);
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

              const canWatch = !hasCreatedRoom || isParticipant;

              return (
                <div
                  key={match.roomId}
                  className={`border rounded-lg p-4 flex justify-between items-center transition-colors ${
                    isOwner
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {/* Información del Partido */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xl text-gray-900">{match.ownerName}</span>
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
                      <strong>Equipo:</strong> {match.teamName}
                    </p>
                  </div>

                  {/* Acciones de Botones */}
                  <div className="flex items-center space-x-2">
                    {isOwner && !isInProgress && (
                      <>
                        <div className="bg-amber-100 text-amber-700 border border-amber-300 px-4 py-2 rounded-md text-sm font-semibold flex items-center space-x-2">
                          <span className="animate-pulse h-2 w-2 bg-amber-500 rounded-full"></span>
                          <span>Esperando oponente...</span>
                        </div>
                        <button
                          onClick={() => handleCancelRoom(match.roomId)}
                          className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
                          title="Cancelar Sala"
                        >
                          Cancelar
                        </button>
                      </>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => {
                          if (isParticipant) {
                            navigate(`/match/${match.roomId}`);
                          } else if (canWatch) {
                            navigate(`/watch-match/${match.roomId}`);
                          }
                        }}
                        disabled={!canWatch}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm ${
                          canWatch
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isParticipant ? 'Ir al Partido' : 'Ver Partido'}
                      </button>
                    )}

                    {!isOwner && !isInProgress && (
                      <button
                        onClick={() => handleJoinMatch(match.roomId)}
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

      {/* Componente Modular del Modal */}
      <CreateFriendlyMatchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreateMatch={handleCreateRoom}
      />
    </div>
  );
};

export default FriendlyMatchesList;