import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


interface FormData {
    email: string;
    password: string;
}


const LogIn = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://127.0.0.1:8000/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 200) {
                const responseData = await response.json();
                localStorage.setItem('access_token', responseData.access_token);
                localStorage.setItem('token_type', 'bearer');
                alert("Login exitoso")
                navigate('/PlayersCreation')

            } else if (response.status === 401) {

                alert("Acceso no autorizado");

            } else if (response.status === 422) {
                const errorData = await response.json()

                alert("Error al iniciar sesion: \n" + errorData.detail[0].msg);

            } else {
                const errorData = await response.json()

                alert("Error al iniciar sesion: \n" + errorData.detail)
            }

        } catch (exception) {

            console.error(exception);
        }

    }
    function handleRedirect(e: React.MouseEvent) {
        e.preventDefault();
        navigate('/SignUp');

    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Log In
                    </button>
                </form>
                <button onClick={handleRedirect}>Sin cuenta?</button>
            </div>
        </div>
    );
};

export default LogIn;