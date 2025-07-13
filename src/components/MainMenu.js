// src/components/MainMenu.js
import React from 'react';

const Button = ({ children, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out ${colorClass}`}
    >
        {children}
    </button>
);

function MainMenu({ setView }) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl space-y-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Civic Engagement Platform</h1>
            <Button onClick={() => setView('report')} colorClass="bg-blue-500 hover:bg-blue-600">Report a New Issue</Button>
            <Button onClick={() => setView('view_all')} colorClass="bg-blue-500 hover:bg-blue-600">View All Reported Issues</Button>
            <Button onClick={() => setView('heatmap')} colorClass="bg-teal-500 hover:bg-teal-600">View Issue Heatmap</Button>
        </div>
    );
}

export default MainMenu;
