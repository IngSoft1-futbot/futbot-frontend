import React from 'react';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import TeamCreation from './pages/TeamCreation';
import MainPage from './pages/MainPage'
import PlayersCreation from './pages/PlayersCreation';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path='/' element={<Navigate to="/SignUp" />} />
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/LogIn' element={<LogIn />} />
        <Route path='/TeamCreation' element={<TeamCreation />} />
        <Route path='/PlayersCreation' element={<PlayersCreation/>}/>
        <Route path='/Main' element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
