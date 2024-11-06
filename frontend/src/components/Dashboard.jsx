import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faLink, faDownload, faEdit } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import '../App.css';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [file, setFile] = useState(null);
    const [newFilename, setNewFilename] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [renameFileId, setRenameFileId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchFiles(currentPage);
        fetchUserDetails();
    }, [currentPage]);

    const fetchFiles = async (page) => {
        try {
            const response = await axios.get(`${apiUrl}/api/files/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                params: {
                    page: page
                }
            });
            setFiles(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 5));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/user/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            setUsername(response.data.username);
            setEmail(response.data.email);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${apiUrl}/api/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            fetchFiles(currentPage);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileDelete = async (fileId) => {
        try {
            await axios.delete(`${apiUrl}/api/files/${fileId}/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            const newFiles = files.filter(file => file.id !== fileId);
            setFiles(newFiles);

            if (newFiles.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchFiles(currentPage);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerateLink = async (fileId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/generate-link/${fileId}/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            const downloadLink = response.data.download_link;
            navigator.clipboard.writeText(downloadLink);
            alert('Download link copied to clipboard: ' + downloadLink);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileDownload = async (fileId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/download/${fileId}/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const fileRecord = files.find(f => f.id === fileId);
            let fileName = 'downloadedFile';
            if (fileRecord && fileRecord.file) {
                fileName = fileRecord.file.split('/').pop();
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRenameFileChange = (e) => {
        setNewFilename(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setNewDescription(e.target.value.slice(0, 20)
        );
    };

    const handleEditClick = (file) => {
        setRenameFileId(file.id);
        const decodedFileName = decodeURIComponent(file.file.split('/').pop());
        setNewFilename(decodedFileName);
        setNewDescription(file.description || '');
    };

    const handleRenameFileSubmit = async (fileId) => {
        if (!newFilename.trim() && !newDescription.trim()) {
            setRenameFileId(null);
            setNewFilename('');
            setNewDescription('');
            return;
         }

        try {
            const updatedData = {};
            if (newFilename.trim()) {
                updatedData.new_filename = newFilename;
            }
            if (newDescription.trim()) {
                updatedData.description = newDescription;
            }


        await axios.patch(`${apiUrl}/api/files/${fileId}/rename/`, updatedData, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        });

            setRenameFileId(null);
            setNewFilename('');
            setNewDescription('');
            fetchFiles(currentPage);
        } catch (error) {
            console.error(error);
        }
    };


    const handleRenameCancel = () => {
        setRenameFileId(null);
        setNewFilename('');
        setNewDescription('');
    };

    return (
        <div className="dashboard">
            <h2>Вы вошли как:</h2>
            <p>Имя пользователя: {username}</p>
            <p>Email-адрес: {email}</p>

            <h2>Список файлов</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя файла</th>
                        <th>Размер файла (KB)</th>
                        <th>Дата загрузки файла</th>
                        <th>Описание файла</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {files.length > 0 ? (
                        files.map(file => (
                            <tr key={file.id}>
                                <td>{file.id}</td>
                                <td>
                                    {renameFileId === file.id ? (
                                        <input
                                            type="text"
                                            value={newFilename}
                                            onChange={handleRenameFileChange}
                                        />
                                    ) : (
                                        decodeURIComponent(file.file.split('/').pop())
                                    )}
                                </td>
                                <td>{(file.size / 1024).toFixed(2)} </td>
                                <td>{moment.utc(file.uploaded_at).format('DD.MM.YY HH:mm')}</td>
                                <td>
                                    {renameFileId === file.id ? (
                                        <input
                                            type="text"
                                            value={newDescription}
                                            onChange={handleDescriptionChange}
                                            maxLength={20}
                                        />
                                    ) : (
                                        file.description || 'No description'
                                    )}
                                </td>
                                <td>
                                    {renameFileId === file.id ? (
                                        <>
                                            <button onClick={() => handleRenameFileSubmit(file.id)}>Сохранить</button>
                                            <button onClick={handleRenameCancel}>Не сохранять</button>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faDownload}
                                                style={{ cursor: 'pointer', margin: '0 5px' }}
                                                onClick={() => handleFileDownload(file.id)}
                                                title="Download"
                                            />
                                            <FontAwesomeIcon
                                                icon={faLink}
                                                style={{ cursor: 'pointer', margin: '0 5px' }}
                                                onClick={() => handleGenerateLink(file.id)}
                                                title="Generate link"
                                            />
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                style={{ cursor: 'pointer', margin: '0 5px' }}
                                                onClick={() => handleFileDelete(file.id)}
                                                title="Delete"
                                            />
                                            <FontAwesomeIcon
                                                icon={faEdit}
                                                style={{ cursor: 'pointer', margin: '0 5px' }}
                                                onClick={() => handleEditClick(file)}
                                                title="Rename"
                                            />
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No files found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Назад</button>
                <span>Страница {currentPage} из {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Вперед</button>
            </div>

            <h2>Загрузка файла</h2>
            <form onSubmit={handleFileUpload}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Загрузить</button>
            </form>

            <button className="logout-button" onClick={handleLogout}>Выход</button>
        </div>
    );
};

export default Dashboard;

