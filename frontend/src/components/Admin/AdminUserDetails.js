import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import Pagination from './Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEye, faUserShield, faUserSlash } from '@fortawesome/free-solid-svg-icons';

const AdminUserDetails = () => {
    const { userId } = useParams();
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFiles = async (page = 1) => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/files/?user=${userId}&page=${page}`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                });
                setFiles(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 5));
            } catch (err) {
                setError('Failed to load files: ' + (err.response?.data?.detail || 'Unknown error'));
            }
        };

        fetchFiles(currentPage);
    }, [userId, currentPage]);

    const handleBackToList = () => {
        navigate('/admin/dashboard');
    };

    const handleDelete = async (fileId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/files/${fileId}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });

            let newPage = currentPage;
            const newTotalPages = totalPages;

            if (files.length === 1 && currentPage === newTotalPages) {
                newPage = Math.max(currentPage - 1, 1);
            }

            const fetchUpdatedFiles = async (page) => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/files/?user=${userId}&page=${page}`, {
                        headers: {
                            Authorization: `Token ${localStorage.getItem('token')}`,
                        },
                    });
                    if (response.data.results.length === 0 && page > 1) {
                        return await fetchUpdatedFiles(page - 1);
                    }
                    setFiles(response.data.results);
                    setTotalPages(Math.ceil(response.data.count / 5));
                    setCurrentPage(page);
                } catch (err) {
                    setError('Failed to fetch updated files: ' + (err.response?.data?.detail || 'Unknown error'));
                }
            };

            await fetchUpdatedFiles(newPage);

        } catch (err) {
            setError('Failed to delete file: ' + (err.response?.data?.detail || 'Unknown error'));
        }
    };

    return (
        <div>
            <h1>Пользователь ID: {userId}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя файла</th>
                        <th>Дата загрузки файла</th>
                        <th>Размер файла (байт)</th>
                        <th>Описание файла</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>
                    {files.length > 0 ? (
                        files.map(file => (
                            <tr key={file.id}>
                                <td>{file.id}</td>
                                <td>{file.file.split('/').pop()}</td>
                                <td>{moment.utc(file.uploaded_at).format('DD.MM.YY HH:mm') || 'N/A'}</td>
                                <td>{file.size}</td>
                                <td>{file.description || 'No description'}</td>
                                <td>
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        style={{ cursor: 'pointer', color: 'blue', margin: '0 5px' }}
                                        onClick={() => handleDelete(file.id)}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No files found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <br />
            <button onClick={handleBackToList}>Список пользователей</button>
        </div>
    );
};

export default AdminUserDetails;

