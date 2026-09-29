import type {User} from '../common/userModel'

export const mockUsers: User[] = [
    {
        user_id: 1,
        username: "john_doe",
        email: "john.doe@example.com",
        name: "John Doe",
        avatar: "https://example.com/avatar1.jpg",
        created_at: new Date("2023-01-15"),
        first_time_login: false
    },
    {
        user_id: 2,
        username: "jane_smith",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        avatar: "https://example.com/avatar2.jpg",
        created_at: new Date("2023-03-22"),
        first_time_login: true
    },
    {
        user_id: 3,
        username: "bob_wilson",
        email: "bob.wilson@example.com",
        name: "Bob Wilson",
        avatar: "https://example.com/avatar3.jpg",
        created_at: new Date("2023-06-10"),
        first_time_login: false
    }
];
