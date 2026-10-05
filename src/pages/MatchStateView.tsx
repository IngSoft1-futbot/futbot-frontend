import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Player {
  player_id: number;
  name: string;
  shirt_number: number;
  behavior_id: number;
}

interface MatchState {
  id_match: number;
  home_team_name: string;
  away_team_name: string;
  home_goals: number;
  away_goals: number;
  current_period: number;
  timeRemaining: string;
  status: 'started' | 'finished';
}

const AVAILABLE_BEHAVIORS = [
  { id: 0, name: 'Default / Balanceado' },
  { id: 1, name: 'Ofensivo' },
  { id: 2, name: 'Defensivo' },
  { id: 3, name: 'Presión Alta' },
  { id: 4, name: 'Contraataque' },
];

export const MatchStateView: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [matchState] = useState<MatchState>({
    id_match: Number(matchId) || 0,
    home_team_name: 'Equipo Local',
    away_team_name: 'Equipo Visitante',
    home_goals: 0,
    away_goals: 0,
    current_period: 1,
    timeRemaining: '12:00',
    status: 'started',
  });

  const [myPlayers, setMyPlayers] = useState<Player[]>([
    { player_id: 1, name: 'Jugador 1', shirt_number: 10, behavior_id: 0 },
    { player_id: 2, name: 'Jugador 2', shirt_number: 7, behavior_id: 1 },
    { player_id: 3, name: 'Jugador 3', shirt_number: 5, behavior_id: 2 },
  ]);

  const [activeMenuPlayerId, setActiveMenuPlayerId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(5);

  // Lógica de cuenta regresiva de 5 segundos
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
    }
  }, [countdown]);

  const handleSelectBehavior = (playerId: number, behaviorId: number) => {
    setMyPlayers((prev) =>
      prev.map((p) => (p.player_id === playerId ? { ...p, behavior_id: behaviorId } : p))
    );
    setActiveMenuPlayerId(null);
  };

  const getBehaviorName = (behaviorId: number) => {
    return AVAILABLE_BEHAVIORS.find((b) => b.id === behaviorId)?.name || `Opción #${behaviorId}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 relative">
      {/* Overlay de Cuenta Regresiva Funcional */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-gray-300 mb-2 uppercase tracking-widest">
            El partido comienza en
          </h2>
          <span className="text-8xl font-black text-amber-400 animate-pulse font-mono">
            {countdown}
          </span>
          <p className="text-sm text-gray-400 mt-4">Prepara tus ajustes tácticos</p>
        </div>
      )}

      {/* Marcador Superior */}
      <header className="w-full max-w-4xl bg-slate-800 rounded-lg p-4 mb-4 flex justify-between items-center border border-slate-700 shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/FriendlyMatchesList')}
            className="mr-2 text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded text-gray-300"
          >
            ← Volver a Lista
          </button>
          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
            <span className="font-bold text-lg">{matchState.home_team_name}</span>
            <span className="text-xl font-black text-amber-400 mx-2">{matchState.home_goals}</span>
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
            <span className="text-xl font-black text-amber-400 mx-2">{matchState.away_goals}</span>
            <span className="font-bold text-lg">{matchState.away_team_name}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase font-semibold">
            Cuarto {matchState.current_period}
          </p>
          <p className="text-2xl font-mono font-bold text-emerald-400">{matchState.timeRemaining}</p>
        </div>
      </header>

      {/* Pantalla de Narración */}
      <main className="w-full max-w-4xl flex-1 bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col justify-between min-h-[350px] max-h-[450px]">
        <div className="overflow-y-auto space-y-3 pr-2 pt-2 flex-1">
          <p className="text-center text-gray-500 my-auto italic">Esperando eventos...</p>
        </div>
      </main>

      {/* Controles Tácticos Interactivos */}
      <footer className="w-full max-w-4xl mt-4">
        <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
          Comportamientos Tácticos En Vivo:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {myPlayers.map((player) => (
            <div key={player.player_id} className="relative">
              <button
                onClick={() =>
                  setActiveMenuPlayerId(
                    activeMenuPlayerId === player.player_id ? null : player.player_id
                  )
                }
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-lg text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-sm text-amber-300 truncate">{player.name}</span>
                  <span className="text-xs font-mono text-gray-400">#{player.shirt_number}</span>
                </div>
                <span className="text-xs text-emerald-400 mt-1 font-mono truncate">
                  ▶ {getBehaviorName(player.behavior_id)}
                </span>
              </button>

              {activeMenuPlayerId === player.player_id && (
                <div className="absolute bottom-full mb-2 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-30 overflow-hidden">
                  {AVAILABLE_BEHAVIORS.map((behavior) => (
                    <button
                      key={behavior.id}
                      onClick={() => handleSelectBehavior(player.player_id, behavior.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors text-slate-200"
                    >
                      {behavior.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default MatchStateView;