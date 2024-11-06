import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        axios.get(`/api/admin/users/${id}/`)
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.error(error);
            });

        axios.get(`/api/admin/files/`, { params: { user: id } })
            .then(response => {
                setFiles(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [id]);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h2>{user.username} Details</h2>
            <p>Email: {user.email}</p>
            <p>Admin: {user.is_superuser ? 'Yes' : 'No'}</p>
            <h3>Files</h3>
            <ul>
                {files.map(file => (
                    <li key={file.id}>{file.file.split('/').pop()}</li>
                ))}
            </ul>
        </div>
    );
};

export default UserDetail;

