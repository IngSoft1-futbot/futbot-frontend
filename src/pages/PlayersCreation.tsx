import React, { useState } from 'react';

interface PacssAttributes {
  power: number;
  agility: number;
  control: number;
  speed: number;
  strength: number;
}

interface Player {
  name: string;
  shirt_number: number | null;
  pacss: PacssAttributes;
  team_id: number;
}

const TOTAL_POINTS = 300;
const MIN_ATTRIBUTE_VALUE = 20;

const PlayersCreation: React.FC = () => {
  const [Player, setPlayer] = useState<Player>({
    name: '',
    shirt_number: null,
    pacss: {
      power: 20,
      agility: 20,
      control: 20,
      speed: 20,
      strength: 20,
    },
    team_id: 1

  }
  ); //ver como se van a asignar los id de equipos

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const usedPoints = Object.values(Player.pacss).reduce((acc, curr) => acc + curr, 0);
  const remainingPoints = TOTAL_POINTS - usedPoints;

  //nombre menor igual a 30 caracteres 
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' && value.length > 30) return;
    setPlayer((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleShirtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val: number | null = e.target.value === '' ? null : parseInt(e.target.value, 10);
    if (val !== null && (val < 0 || val > 99)) return; // Entre 0 y 99
    setPlayer((prev) => ({ ...prev, shirt_number: val }));
  }; //!TODO Handle --1 and stuff like that

  const handleAttributeChange = (attr: keyof PacssAttributes, newValue: number) => {
  const currentValue = Player.pacss[attr];

  // Calculo la sobra con los valores actuales
  const currentTotal = Object.values(Player.pacss).reduce((sum, val) => sum + val, 0);
  const pointsLeft = TOTAL_POINTS - currentTotal;

  // Máximo que puede alcanzar el slider
  const maxAllowed = currentValue + pointsLeft;

  // Si presiono al extremo derecho se actualiza al maximo que queda
  const clampedValue = Math.min(newValue, maxAllowed);

  setPlayer((prev) => ({
    ...prev,
    pacss: {
      ...prev.pacss,
      [attr]: clampedValue,
    },
  }));
};

  const isFormValid =
    Player.name.trim().length > 0 &&
    Player.shirt_number !== null &&
    remainingPoints === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!Player.name.trim()){
        setErrorMessage('Ingrese un nombre válido.');
        return;
    }

    if (Player.shirt_number === null){
        setErrorMessage('Ingrese un número de camiseta entre (0-99).');
        return;
    }

    if (remainingPoints !== 0){
        setErrorMessage('Debes asignar los ${TOTAL_POINTS} puntos disponibles.');
        return;
    }

    if (!isFormValid) return;

    const requestBody ={
        name: Player.name,
        shirt_number: Number(Player.shirt_number),
        paccs_attribute: Player.pacss,
        team_id: Player.team_id
    };


  console.log('[MOCK] Formulario enviado con éxito:', requestBody);

  

  try {
    setIsSubmitting(true);

      setSuccessMessage('¡Jugador creado satisfactoriamente! (Modo Mock)');
    //Primeras dos lineas del try mockeadas para caso exitoso
      setIsSubmitting(true);
      const userId = 1; // ID de usuario según auth modificar según corresponda

      const response = await fetch(`http://127.0.0.1:8000/users/${userId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 201) {
        setSuccessMessage('¡Jugador creado satisfactoriamente!');
      } else {
        const errorData = await response.json().catch(() => null);
        setErrorMessage(errorData?.detail || 'No pudimos crear el jugador. Parámetros inválidos.');
      }
    } catch (error) {
      setErrorMessage('No pudimos crear jugador. Intentá nuevamente en unos minutos.');
    } finally {
      setIsSubmitting(false);
    }
  }; 

const pacssLabels: Record<keyof PacssAttributes, string> = {
    power: 'Potencia (Power)',
    agility: 'Agilidad (Agility)',
    control: 'Control (Control)',
    speed: 'Velocidad (Speed)',
    strength: 'Fuerza (Strength)',
  };
  
  
 return (
  
  <div className="pantalla-principal min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div className="tarjeta-formulario bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      
      <h1 className="titulo-pagina text-2xl font-bold text-center mb-6" style={{ color: '#27135e', opacity: 0.8 }}>
  Crear Jugador
</h1>

      {/* Cartel de Error */}
      {errorMessage && (
        <div className="mensaje-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Cartel de Éxito */}
      {successMessage && (
        <div className="mensaje-exito bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="formulario flex flex-col space-y-5">
        
        {/* Campo Nombre */}
        <div className="campo-entrada flex flex-col space-y-1">
          <label className="etiqueta-campo text-sm font-semibold text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={Player.name}
            onChange={handleTextChange}
            placeholder="Ej: Lionel Messi"
            required
            className="input-texto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="contador-caracteres text-xs text-gray-400 text-right">
            {Player.name.length}/30
          </span>
        </div>

        {/* Campo Número de Camiseta */}
        <div className="campo-entrada flex flex-col space-y-1">
          <label className="etiqueta-campo text-sm font-semibold text-gray-700">
            Número de Camiseta (0 - 99)
          </label>
          <input
            type="number"
            name="shirt_number"
            value={Player.shirt_number ?? ''}
            onChange={handleShirtChange}
            placeholder="Ej: 10"
            required
            min={0}
            max={99}
            className="input-numero px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Panel Contador de Puntos */}
        <div className="caja-puntos-restantes bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
          <p className="subtitulo-puntos text-xs text-blue-600 uppercase font-semibold">
            Puntos Disponibles
          </p>
          <p className="numero-puntos text-xl font-bold text-blue-800">
            {remainingPoints} <span className="puntos-totales text-sm font-normal text-gray-500">/ {TOTAL_POINTS}</span>
          </p>
        </div>

        {/* Sliders de Atributos PACSS */}
<div className="seccion-atributos flex flex-col space-y-4 pt-2">
  <p className="etiqueta-campo text-sm font-semibold text-gray-700">
    Atributos PACSS
  </p>

  {(Object.keys(Player.pacss) as Array<keyof PacssAttributes>).map((attr) => (
    <div key={attr} className="filas-atributos flex flex-col space-y-1">
      <div className="encabezado-slider flex justify-between text-xs font-medium text-gray-600">
        <span>{pacssLabels[attr]}</span>
        <span className="valor-atributo font-bold text-gray-800">
          {Player.pacss[attr]} pts
        </span>
      </div>
      <input
        type="range"
        min={MIN_ATTRIBUTE_VALUE}
        max={220}
        value={Player.pacss[attr]}
        onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value, 10))}
        className="slider-deslizante w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
      />
    </div>
  ))}
</div>

        {/* Botón de submit */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="boton-crear-jugador w-full mt-4 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-200 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : 'Crear Jugador'}
        </button>

      </form>
    </div>
  </div>
);}


export default PlayersCreation;