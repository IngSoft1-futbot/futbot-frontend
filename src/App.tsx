import React from 'react';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/SignUp"/>} />
        <Route path='/SignUp' element={<SignUp/>}/>
        <Route path='/LogIn' element={<LogIn/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
