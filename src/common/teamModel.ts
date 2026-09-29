export interface Team {
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