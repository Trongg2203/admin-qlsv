export interface LoggedIn {
    access_token: string,
    expires_in: number,
    isLoggedIn:boolean,
    is_admin: boolean,
    user_type: number,
}

// Matches App\Http\Requests\Auth\RegisterRequest exactly.
// NOTE: register uses `weight` (not `current_weight`); gender is 0=male, 1=female only.
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    date_of_birth: string; // YYYY-MM-DD, must be >= 10 years ago
    gender: number;        // 0=male, 1=female
    height: number;        // cm, 100-250
    weight: number;        // kg, 30-300
    activity_level: number; // 0-4
}

