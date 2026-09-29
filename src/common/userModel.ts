export interface User {
    user_id: number,
    username: string,
    email: string,
    name: string,
    avatar: string,
    created_at: Date,
    first_time_login: boolean
}