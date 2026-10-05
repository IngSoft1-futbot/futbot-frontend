import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "http://localhost:8000";
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
  timeRemaining: { formatTime: (seconds: number) => string };
  status: "started" | "finished";
}

const TOTAL_PERIODS = 4; // set to 1 if your match has a single period
const PERIOD_SECONDS = 12 * 1; // 12 seconds for testing; change to 12 * 60 for real matches
const MY_TEAM: "home" | "away" = "home"; // which side the logged-in user coaches

type MatchResult = "win" | "lose" | "draw";

const RESULT_UI: Record<MatchResult, { title: string; color: string }> = {
  win: { title: "¡Victoria!", color: "text-emerald-400" },
  lose: { title: "Derrota", color: "text-red-400" },
  draw: { title: "Empate", color: "text-amber-400" },
};

interface Behavior {
  behavior_id: number;
  name: string;
}

export const MatchStateView: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [availableBehaviors, setAvailableBehaviors] = useState<Behavior[]>([]);
  const [matchState, setMatchState] = useState<MatchState>({
    id_match: Number(matchId) || 0,
    home_team_name: "Equipo Local",
    away_team_name: "Equipo Visitante",
    home_goals: 0,
    away_goals: 0,
    current_period: 1,
    timeRemaining: { formatTime: (seconds) => formatTime(seconds) },
    status: "started",
  });
  const [secondsRemaining, setSecondsRemaining] = useState(PERIOD_SECONDS);

  const [myPlayers, setMyPlayers] = useState<Player[]>([
    { player_id: 1, name: "Jugador 1", shirt_number: 10, behavior_id: 0 },
    { player_id: 2, name: "Jugador 2", shirt_number: 7, behavior_id: 1 },
    { player_id: 3, name: "Jugador 3", shirt_number: 5, behavior_id: 2 },
  ]);

  const [activeMenuPlayerId, setActiveMenuPlayerId] = useState<number | null>(
    null,
  );
  const [countdown, setCountdown] = useState<number | null>(5);

  useEffect(() => {
    // Don't run during the overlay or if the match is over
    if (countdown !== null || matchState.status !== "started") return;

    const interval = setInterval(() => {
      setSecondsRemaining((s) => Math.max(s - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, matchState.status]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const fetchBehaviors = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.log("No token found. Please log in.");
        return;
      }
      try {
        const decodedToken = jwtDecode<{ sub: string }>(token);
        const user_id = parseInt(decodedToken.sub ?? "-1");
        if (Number.isNaN(user_id)) {
          throw new Error("Invalid sub in token");
        }
        const response = await fetch(
          `${API_BASE_URL}/users/${user_id}/behaviors`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.status === 200) {
          console.log("¡Comportamientos recibidos satisfactoriamente!");
          const jsonResponse = await response.json();
          setAvailableBehaviors(jsonResponse.data);
        } else {
          throw new Error(`Failed to fetch behaviors: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching behaviors:", error);
      }
    };

    fetchBehaviors();
  }, []);

  // Lógica de cuenta regresiva de 5 segundos

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(
        () => setCountdown((prev) => (prev !== null ? prev - 1 : null)),
        1000,
      );
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
    }
  }, [countdown]);

  const handleSelectBehavior = (playerId: number, behaviorId: number) => {
    setMyPlayers((prev) =>
      prev.map((p) =>
        p.player_id === playerId ? { ...p, behavior_id: behaviorId } : p,
      ),
    );
    setActiveMenuPlayerId(null);
  };

  useEffect(() => {
    if (secondsRemaining > 0 || matchState.status !== "started") return;

    if (matchState.current_period < TOTAL_PERIODS) {
      setMatchState((prev) => ({
        ...prev,
        current_period: prev.current_period + 1,
      }));
      setSecondsRemaining(PERIOD_SECONDS);
    } else {
      setMatchState((prev) => ({ ...prev, status: "finished" }));
      setActiveMenuPlayerId(null);
    }
  }, [secondsRemaining, matchState.status, matchState.current_period]);

  const getBehaviorName = (behaviorId: number) => {
    return (
      availableBehaviors.find((b) => b.behavior_id === behaviorId)?.name ||
      `Opción #${behaviorId}`
    );
  };

  const getResult = (): MatchResult => {
    const mine =
      MY_TEAM === "home" ? matchState.home_goals : matchState.away_goals;
    const theirs =
      MY_TEAM === "home" ? matchState.away_goals : matchState.home_goals;
    if (mine > theirs) return "win";
    if (mine < theirs) return "lose";
    return "draw";
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
          <p className="text-sm text-gray-400 mt-4">
            Prepara tus ajustes tácticos
          </p>
        </div>
      )}

      {/* Resultado del Partido */}

      {matchState.status === "finished" &&
        (() => {
          const result = RESULT_UI[getResult()];
          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <h2 className="text-xl font-bold text-gray-300 mb-2 uppercase tracking-widest">
                Final del partido
              </h2>
              <span className={`text-6xl font-black ${result.color}`}>
                {result.title}
              </span>
              <p className="text-2xl font-mono font-bold mt-4">
                {matchState.home_team_name} {matchState.home_goals} -{" "}
                {matchState.away_goals} {matchState.away_team_name}
              </p>
              <button
                onClick={() => navigate("/FriendlyMatchesList")}
                className="mt-6 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-gray-200"
              >
                Volver a la lista
              </button>
            </div>
          );
        })()}

      {/* Marcador Superior */}
      <header className="w-full max-w-4xl bg-slate-800 rounded-lg p-4 mb-4 flex justify-between items-center border border-slate-700 shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/FriendlyMatchesList")}
            className="mr-2 text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded text-gray-300"
          >
            ← Volver a Lista
          </button>
          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
            <span className="font-bold text-lg">
              {matchState.home_team_name}
            </span>
            <span className="text-xl font-black text-amber-400 mx-2">
              {matchState.home_goals}
            </span>
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
            <span className="text-xl font-black text-amber-400 mx-2">
              {matchState.away_goals}
            </span>
            <span className="font-bold text-lg">
              {matchState.away_team_name}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase font-semibold">
            Cuarto {matchState.current_period}
          </p>
          <p className="text-2xl font-mono font-bold text-emerald-400">
            {formatTime(secondsRemaining)}
          </p>
        </div>
      </header>

      {/* Pantalla de Narración */}
      <main className="w-full max-w-4xl flex-1 bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col justify-between min-h-[350px] max-h-[450px]">
        <div className="overflow-y-auto space-y-3 pr-2 pt-2 flex-1">
          <p className="text-center text-gray-500 my-auto italic">
            Esperando eventos...
          </p>
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
                    activeMenuPlayerId === player.player_id
                      ? null
                      : player.player_id,
                  )
                }
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-lg text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-sm text-amber-300 truncate">
                    {player.name}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    #{player.shirt_number}
                  </span>
                </div>
                <span className="text-xs text-emerald-400 mt-1 font-mono truncate">
                  ▶ {getBehaviorName(player.behavior_id)}
                </span>
              </button>

              {activeMenuPlayerId === player.player_id && (
                <div className="absolute bottom-full mb-2 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-30 overflow-hidden">
                  {availableBehaviors.map((behavior) => (
                    <button
                    disabled={matchState.status === "finished"}
                      key={behavior.behavior_id}
                      onClick={() =>
                        handleSelectBehavior(
                          player.player_id,
                          behavior.behavior_id,
                        )
                      }
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
