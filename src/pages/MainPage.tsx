import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'FriendlyMatchesList' | 'PlayersCreation' | 'TeamCreation'>('FriendlyMatchesList');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Futbot - Menú Principal</h1>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('FriendlyMatchesList')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'FriendlyMatchesList'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Partidos Amistosos
          </button>
          <button
            onClick={() => setActiveTab('PlayersCreation')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'PlayersCreation'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Crear Jugador
          </button>
          <button
            onClick={() => setActiveTab('TeamCreation')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'TeamCreation'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Crear Equipo
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'FriendlyMatchesList' && (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-6 text-center">
                Bienvenido al sistema de partidos amistosos. 
                Puedes crear una sala, unirte a una existente o ver las disponibles.
              </p>
              <button
                onClick={() => navigate('/FriendlyMatchesList')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
              >
                Ir a Partidos Amistosos
              </button>
            </div>
          )}

          {activeTab === 'PlayersCreation' && (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-6 text-center">
                Crea nuevos jugadores para tu equipo. 
                Asigna puntos a las diferentes habilidades.
              </p>
              <button
                onClick={() => navigate('/PlayersCreation')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
              >
                Ir a Crear Jugador
              </button>
            </div>
          )}

          {activeTab === 'TeamCreation' && (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-6 text-center">
                Crea tu equipo seleccionando jugadores y asignándoles comportamientos.
              </p>
              <button
                onClick={() => navigate('/TeamCreation')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
              >
                Ir a Crear Equipo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}