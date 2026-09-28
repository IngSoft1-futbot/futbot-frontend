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
        },
        {
            player_id: number,
            behavior_id: number
        },
        {
            player_id: number,
            behavior_id: number
        }
    ],
    jugadores_suplentes: [
        {
            player_id: number,
            behavior_id: number
        },
        {
            player_id: number,
            behavior_id: number
        },
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
        jugadores_titulares: [{ player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }],
        jugadores_suplentes: [{ player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }]
    });

    const [selectedIds, setSelectedIds] = useState<(number | null)[]>([null, null, null, null, null, null]);

    const [teamName, setTeamName] = useState<(string | '')>();

    const handlePlayerSelection = (slot: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value);
        setSelectedIds(prev => prev.map((id, i) => (i === slot ? value : id)));
    };

    // players available for a given slot: not picked in any other slot
    const getOptionsForSlot = (slot: number) =>
        players.filter(
            p => !selectedIds.some((id, i) => i !== slot && id === p.id)
        );

    function handleTeamNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setTeamName(e.target.value);
    }

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        let newTeam: Team = {
            name: '',
            jugadores_titulares: [{ player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }],
            jugadores_suplentes: [{ player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }]
        };

        if (teamName !== undefined) {
            newTeam.name = teamName
        }

        for (let index = 0; index < selectedIds.length; index++) {

            const element = selectedIds[index];

            if (element !== null) {

                console.log(mockPlayers[element - 1]);

                if (index < 3) {
                    newTeam.jugadores_titulares[index].player_id = mockPlayers[element - 1].id
                } else if (index >= 3) {
                    newTeam.jugadores_suplentes[index - 3].player_id = mockPlayers[element - 1].id
                } else {
                    alert('impossible state');
                }

            }

        }

        console.log(newTeam);
        alert("Equipo creado satisfactoriamente");

        setTimeout(() => {
            navigate('/Main');
        }, 3000)

    }

    return (
        <div className="min-h-screen bg-gray-100  items-center flex justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 ">Crear equipo</h2>

                <form className='flex flex-col' onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input type="text" required id='teamName' maxLength={20} onChange={handleTeamNameChange} placeholder="Nombre del equipo" />
                    </label>

                    <p>Jugadores Titulares:</p>
                    {[0, 1, 2].map(slot => (
                        <select className='border-red-500'
                            key={slot}
                            value={selectedIds[slot] ?? ''}
                            onChange={e => handlePlayerSelection(slot, e)}
                            required
                        >
                            <option value="">Seleccionar jugador</option>
                            {getOptionsForSlot(slot).map(player => (
                                <option key={player.id} value={player.id}> {player.name} </option>))}
                        </select>
                    ))}

                    <p>Jugadores Suplentes:</p>
                    {[3, 4, 5].map(slot => (
                        <select key={slot} value={selectedIds[slot] ?? ''} onChange={e => handlePlayerSelection(slot, e)}>
                            <option value="">Seleccionar jugador</option>
                            {getOptionsForSlot(slot).map(player => (
                                <option key={player.id} value={player.id}>
                                    {player.name}
                                </option>
                            ))}
                        </select>
                    ))}
                    <button type='submit'> Crear Equipo </button>
                </form>

            </div>
        </div>
    );
}

export default TeamCreation;