import React, { useEffect, useState } from 'react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './AdminFileList.css';

const AdminFileList = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/files/`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                });
                setFiles(response.data);
            } catch (err) {
                setError('Failed to load files: ' + (err.response?.data?.detail || 'Unknown error'));
            }
        };

        fetchFiles();
    }, []);

    const handleDelete = async (fileId) => {
        try {
            await axios.delete(`http://localhost:8000/api/admin/files/${fileId}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });
            setFiles(files.filter(file => file.id !== fileId));
        } catch (err) {
            setError('Failed to delete file: ' + (err.response?.data?.detail || 'Unknown error'));
        }
    };

    return (
        <div>
            <h2>File List</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {files.map(file => (
                    <li key={file.id}>
                        {file.filename}
                        <FontAwesomeIcon
                            icon={faTrash}
                            style={{ cursor: 'pointer', color: 'blue', marginLeft: '10px' }}
                            onClick={() => handleDelete(file.id)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminFileList;

