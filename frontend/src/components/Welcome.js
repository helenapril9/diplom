import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
    return (
        <div className="welcome">
            <h1>Облако</h1>
            <div className="welcome-links">
                <Link to="/auth" className="welcome-link">Вход/Регистрация</Link>
                <Link to="/admin/auth" className="welcome-link">Панель администратора</Link>
            </div>
        </div>
    );
};

export default Welcome;

