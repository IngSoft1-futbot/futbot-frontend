import React from 'react';
import { useState } from 'react';
import { mockPlayers } from '../api/players';
import { useNavigate } from 'react-router-dom';


interface Team {
    name: string,
    jugadores_titulares: [
        {
            player_id: number,
            behavior_id: number
        }
    ],
    jugadores_suplentes: [
        {
            player_id: number,
            behavior_id: number
        }
    ]
}
interface Player {
    id: number,
    name: string,
    shirt_number: number | null,
    pacss: {},
    team_id: number | null
}

function TeamCreation() {

    const navigate = useNavigate();

    const [players, setPlayers] = useState<Player[]>(mockPlayers);

    const [team, setTeam] = useState<Team>({
        name: 'Mi equipo',
        jugadores_titulares: [{ player_id: 0, behavior_id: 0 }],
        jugadores_suplentes: [{ player_id: 0, behavior_id: 0 }]
    });

    function handleRedirect(e: React.MouseEvent) {
        // Redirect to signup page - this would typically use react-router-dom
        e.preventDefault();
        navigate('/Main');

    }

    const [selectedIds, setSelectedIds] = useState<(number | null)[]>([null, null, null]);

    const handlePlayerSelection = (slot: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value);
        setSelectedIds(prev => prev.map((id, i) => (i === slot ? value : id)));
    };

    // players available for a given slot: not picked in any other slot
    const getOptionsForSlot = (slot: number) =>
        players.filter(
            p => !selectedIds.some((id, i) => i !== slot && id === p.id)
        );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Crear equipo</h2>

                <form>
                    <label>
                        Name:
                        <input type="text" maxLength={20} placeholder="Nombre del equipo" />
                    </label>

                    <p>Jugadores Titulares:</p>
                    {[0, 1, 2].map(slot => (
                        <select
                            key={slot}
                            value={selectedIds[slot] ?? ''}
                            onChange={e => handlePlayerSelection(slot, e)}
                        >
                            <option value="">Seleccionar jugador</option>
                            {getOptionsForSlot(slot).map(player => (
                                <option key={player.id} value={player.id}>
                                    {player.name}
                                </option>
                            ))}
                        </select>
                    ))}
                </form>

                <button onClick={handleRedirect}>Crear Equipo</button>
            </div>
        </div>
    );
}

export default TeamCreation;