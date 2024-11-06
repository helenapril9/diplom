import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isLogin ? `${apiUrl}/api/login/` : `${apiUrl}/api/register/`;
        const data = isLogin ? { username: formData.username, password: formData.password } : formData;

        try {
            const response = await axios.post(url, data);
            console.log(response.data);
            if (isLogin) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            } else {
                setIsLogin(true);
                setErrors({});
            }
        } catch (error) {
            if (error.response) {
                setErrors(error.response.data);
            }
        }
    };

    const handleNavigateHome = () => {
        navigate("/");
    };

    const handleModeSwitch = () => {
        setIsLogin(!isLogin);
        setErrors({});
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Login:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} />
                    {errors.username && <p className="error">{errors.username}</p>}
                </div>
                {!isLogin && (
                    <div>
                        <label>Email-адрес:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        {errors.email && <p className="error">{errors.email}</p>}
                    </div>
                )}
                <div>
                    <label>Пароль:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    {errors.password && <p className="error">{errors.password}</p>}
                </div>
                {!isLogin && (
                    <div>
                        <label>Подтвердите пароль:</label>
                        <input type="password" name="password2" value={formData.password2} onChange={handleChange} />
                        {errors.password2 && <p className="error">{errors.password2}</p>}
                    </div>
                )}
                {errors.non_field_errors && <p className="error">{errors.non_field_errors}</p>}
                <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
            </form>
            <button onClick={handleModeSwitch}>
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
            <button onClick={handleNavigateHome}>
                Домашняя страница
            </button>
        </div>
    );
};

export default Auth;

