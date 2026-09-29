import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import type { Behavior } from '../common/behaviorModel';
import type { Player } from '../common/playerModel';
import type { Team } from '../common/teamModel'

import { mockPlayers } from '../api/players';
import { mockBehaviors } from '../api/behaviours'

function TeamCreation() {

    const navigate = useNavigate();

    const [players, setPlayers] = useState<Player[]>(mockPlayers);

    const [selectedIds, setSelectedIds] = useState<(number | null)[]>([null, null, null, null, null, null]);

    const [teamName, setTeamName] = useState<(string | '')>();

    const [behaviors, setBehaviors] = useState<Behavior[]>(mockBehaviors);

    const [selectedBehaviors, setSelectedBehaviors] = useState<(number | null)[]>([null, null, null, null, null, null]);

    
    const [team, setTeam] = useState<Team>({
        name: 'Mi equipo',
        jugadores_titulares: [{ player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }],
        jugadores_suplentes: [{ player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }, { player_id: 0, behavior_id: 0 }]
    });

    // Log team whenever it changes
    useEffect(() => {
        console.log('Team updated:', team);
    }, [team]);

    const handlePlayerSelection = (slot: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value);
        setSelectedIds(prev => prev.map((id, i) => (i === slot ? value : id)));
    };

    const handleBehaviorSelection = (slot: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value);
        
        setSelectedBehaviors(prev => prev.map((id, i) => (i === slot ? value : id)));
    };

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
                    newTeam.jugadores_titulares[index].behavior_id = selectedBehaviors[index] ?? 0;
                } else {
                    newTeam.jugadores_suplentes[index - 3].player_id = mockPlayers[element - 1].id
                    newTeam.jugadores_suplentes[index - 3].behavior_id = selectedBehaviors[index] ?? 0;
                }

            }

        }
        setTeam(newTeam);
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

                    <div className='flex flex-col'>
                        <p>Jugadores Titulares:</p>
                        {[0, 1, 2].map(slot => (
                            <div key={slot}>
                                
                                <select 
                                    className='border-red-500 mb-2'
                                    value={selectedIds[slot] ?? ''}
                                    onChange={e => handlePlayerSelection(slot, e)}
                                    required
                                >
                                    <option value="">Seleccionar jugador</option>
                                    {getOptionsForSlot(slot).map(player => (
                                        <option key={player.id} value={player.id}> {player.name} </option>))}
                                </select>

                                <select 
                                    value={selectedBehaviors[slot] ?? ''}
                                    onChange={e => handleBehaviorSelection(slot, e)}
                                    required
                                    className="mb-2"
                                >
                                    <option value="">Seleccionar Comportamiento</option>
                                    {behaviors.map(behavior =>
                                        <option key={behavior.behavior_id} value={behavior.behavior_id}> {behavior.name}</option>
                                    )}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p>Jugadores Suplentes:</p>
                        {[3, 4, 5].map(slot => (
                            <div key={slot}>
                                
                                <select 
                                    className='border-red-500 mb-2'
                                    value={selectedIds[slot] ?? ''}
                                    onChange={e => handlePlayerSelection(slot, e)}
                                    required
                                >
                                    <option value="">Seleccionar jugador</option>
                                    {getOptionsForSlot(slot).map(player => (
                                        <option key={player.id} value={player.id}>
                                            {player.name}
                                        </option>
                                    ))}
                                </select>

                                <select 
                                    value={selectedBehaviors[slot] ?? ''}
                                    onChange={e => handleBehaviorSelection(slot, e)}
                                    required
                                    className="mb-2"
                                >
                                    <option value="">Seleccionar Comportamiento</option>
                                    {behaviors.map(behavior =>
                                        <option key={behavior.behavior_id} value={behavior.behavior_id}> {behavior.name}</option>
                                    )}
                                </select>
                            </div>
                        ))}
                    </div>
                    <button type='submit'> Crear Equipo </button>
                </form>

            </div>
        </div>
    );
}

export default TeamCreation;