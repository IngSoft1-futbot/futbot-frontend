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
  shirt_number: number | '';
  pacss: PacssAttributes;
  team_id: number;
}

const TOTAL_POINTS = 300;
const MIN_ATTRIBUTE_VALUE = 20;

const PlayersCreation: React.FC = () => {
  const [Player, setPlayer] = useState<Player>({
    name: '',
    shirt_number: '',
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
    const val = e.target.value === '' ? '' : parseInt(e.target.value);
    if (typeof val === 'number' && (val < 0 || val > 99)) return; // Entre 0 y 99
    setPlayer((prev) => ({ ...prev, shirt_number: val }));
  }; //!TODO Handle --1 and stuff like that

  const handleAttributeChange = (attr: keyof PacssAttributes, value: number) => {
    const currentVal = Player.pacss[attr];
    const diff = value - currentVal;

    // Verificar que no sobrepase los puntos disponibles ni baje del mínimo
    if (value < MIN_ATTRIBUTE_VALUE || remainingPoints - diff < 0) return;

    setPlayer((prev) => ({
      ...prev,
      pacss: {
        ...prev.pacss,
        [attr]: value,
      },
    }));
  };

  return (
    <div>
      <h1>Create Player</h1>
      <form>
        <label>
          Name:
          <input type='text' name='name' value={Player.name} onChange={handleTextChange} />
        </label>
        <label>
          Shirt Number:
          <input type='number' name='shirt_number' value={Player.shirt_number} onChange={handleShirtChange} />
        </label>
        <label>
          Power:
        <input type='range'></input>

        </label>



      </form>
    </div>
  );




}


export default PlayersCreation;