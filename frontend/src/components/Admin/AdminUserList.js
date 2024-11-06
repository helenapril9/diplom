import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEye, faUserShield, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import './AdminUserList.css';

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    const fetchUsers = async (page) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users/?page=${page}`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });
            setUsers(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 5));
        } catch (err) {
            setError('Failed to load users: ' + (err.response?.data?.detail || 'Unknown error'));
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handleUserClick = (user) => {
        navigate(`/admin/users/${user.id}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/admin/auth';
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });
            const newUsers = users.filter(user => user.id !== userId);
            setUsers(newUsers);

            if (newUsers.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchUsers(currentPage);
            }
        } catch (err) {
            setError('Failed to delete user: ' + (err.response?.data?.detail || 'Unknown error'));
        }
    };

    const toggleAdminStatus = async (userId, isAdmin) => {
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/update_admin_status/`, {
                is_superuser: !isAdmin,
            }, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });
            fetchUsers(currentPage);
        } catch (err) {
            setError('Failed to update admin status: ' + (err.response?.data?.detail || 'Unknown error'));
        }
    };

    return (
        <div>
            <h1>Список пользователей</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя пользователя</th>
                        <th>Email-адрес</ th>
                        <th>Администратор</th>
                        <th>Количество файлов</th>
                        <th>Размер файла</th>
                        <th>Дата загрузки</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users && users.length > 0 ? (
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.is_superuser ? 'Yes' : 'No'}</td>
                                <td>{user.files_count}</td>
                                <td>{user.total_size}</td>
                                <td>{user.last_upload ? moment(user.last_upload).format('DD.MM.YY HH:mm') : 'N/A'}</td>
                                <td>
                                    <FontAwesomeIcon
                                        icon={faEye}
                                        style={{ cursor: 'pointer', color: 'blue', margin: '0 5px' }}
                                        onClick={() => handleUserClick(user)}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        style={{ cursor: 'pointer', color: 'blue', margin: '0 5px' }}
                                        onClick={() => handleDeleteUser(user.id)}
                                    />
                                    <FontAwesomeIcon
                                        icon={user.is_superuser ? faUserSlash : faUserShield}
                                        style={{ cursor: 'pointer', color: 'blue', margin: '0 5px' }}
                                        onClick={() => toggleAdminStatus(user.id, user.is_superuser)}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <br/>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <br/>
            <button onClick={handleLogout}>Выход</button>
        </div>
    );
};

export default AdminUserList;

