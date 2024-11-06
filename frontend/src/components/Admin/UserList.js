import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users/``, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users');
            }
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h2>Admin Users</h2>
            {error && <p>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Superuser</th>
                        <th>Files Count</th>
                        <th>Files Size</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.is_superuser ? 'Yes' : 'No'}</td>
                            <td>{user.files_count}</td>
                            <td>{user.files_size}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserList;

