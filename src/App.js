// src/App.js
import React, { useState, useEffect } from 'react';
import { loadData, saveData } from './dataManager';
import MainMenu from './components/MainMenu';
import ReportForm from './components/ReportForm';
import IssueList from './components/IssueList';
import HeatmapView from './components/HeatmapView';

function App() {
    const [database, setDatabase] = useState(loadData());
    const [view, setView] = useState('main_menu'); // main_menu, report, view_all, heatmap

    const DEEPDALE_COORDS = [53.765, -2.685];

    // Save data whenever the database changes
    useEffect(() => {
        saveData(database);
    }, [database]);
    
    const addReport = (report) => {
        setDatabase(prevDb => [...prevDb, report]);
        setView('main_menu');
    };

    const renderView = () => {
        switch (view) {
            case 'report':
                return <ReportForm onSubmit={addReport} onCancel={() => setView('main_menu')} initialCoords={DEEPDALE_COORDS} />;
            case 'view_all':
                return <IssueList issues={database} onBack={() => setView('main_menu')} />;
            case 'heatmap':
                return <HeatmapView issues={database} onBack={() => setView('main_menu')} initialCoords={DEEPDALE_COORDS} />;
            default:
                return <MainMenu setView={setView} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto">
                {renderView()}
            </div>
        </div>
    );
}

export default App;
