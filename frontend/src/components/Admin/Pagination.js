import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div>
            <button onClick={handlePrevious} disabled={currentPage === 1}>Назад</button>
            <span>{currentPage} of {totalPages}</span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>Вперед</button>
        </div>
    );
};

export default Pagination;

