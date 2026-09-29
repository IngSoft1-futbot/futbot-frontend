import type {User} from '../common/userModel'

export const mockUsers: User[] = [
  {
    user_id: 1,
    username: "john_doe",
    email: "john.doe@example.com",
    name: "John Doe",
    avatar: "https://example.com/avatars/john.jpg",
    created_at: new Date("2023-01-15"),
    first_time_login: false
  },
  {
    user_id: 2,
    username: "jane_smith",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    avatar: "https://example.com/avatars/jane.jpg",
    created_at: new Date("2023-02-20"),
    first_time_login: true
  },
  {
    user_id: 3,
    username: "bob_wilson",
    email: "bob.wilson@example.com",
    name: "Bob Wilson",
    avatar: "https://example.com/avatars/bob.jpg",
    created_at: new Date("2023-03-10"),
    first_time_login: false
  }
];