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

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form data:', formData);

        // Here you would typically send the data to your backend
        alert('Log in form submitted!');
    };

    function handleRedirect(e: React.MouseEvent) {
        // Redirect to signup page - this would typically use react-router-dom
        e.preventDefault();
        navigate('/SignUp');

    }

    function handleLogin(event: React.SubmitEvent<HTMLButtonElement>){
        event.preventDefault();
        /* setTimeout(()=>{
            navigate('/PlayersCreation')
        },3000) 
        
        Implement redirection to the creation of 6 players
        */
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
                        onSubmit={handleLogin}
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