// src/components/ReportForm.js
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

// Map Component defined inside ReportForm for simplicity
const MapPicker = ({ initialCoords, onPositionChange }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('map-picker').setView(initialCoords, 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            const marker = L.marker(initialCoords, { draggable: true }).addTo(map);
            marker.on('dragend', (event) => {
                const { lat, lng } = event.target.getLatLng();
                onPositionChange([lat, lng]);
            });
            mapRef.current = map;
        }
    }, [initialCoords, onPositionChange]);

    return <div id="map-picker" className="h-64 w-full rounded-lg shadow-inner bg-gray-200 z-0"></div>;
};


function ReportForm({ onSubmit, onCancel, initialCoords }) {
    const [issueType, setIssueType] = useState('Pothole');
    const [description, setDescription] = useState('');
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    const [manualTime, setManualTime] = useState('');
    const [markerPosition, setMarkerPosition] = useState(initialCoords);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description) {
            alert('Please enter a description.');
            return;
        }
        const newReport = {
            id: Date.now(),
            type: issueType,
            description,
            location: markerPosition,
            timestamp: useCurrentTime ? new Date().toISOString() : manualTime,
            status: 'Reported'
        };
        onSubmit(newReport);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Report an Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type of Issue</label>
                    <select value={issueType} onChange={e => setIssueType(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        <option>Pothole</option>
                        <option>Broken Streetlight</option>
                        <option>Trash/Litter</option>
                        <option>Graffiti</option>
                        <option>Public Transportation</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" rows="3"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Time of Issue</label>
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                            <input type="checkbox" checked={useCurrentTime} onChange={e => setUseCurrentTime(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            <label className="ml-2 block text-sm text-gray-900">Use current time</label>
                        </div>
                        {!useCurrentTime && (
                            <input type="datetime-local" value={manualTime} onChange={e => setManualTime(e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        )}
                    </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Location (drag marker to set)</label>
                   <MapPicker initialCoords={initialCoords} onPositionChange={setMarkerPosition} />
                </div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Submit Report</button>
                </div>
            </form>
        </div>
    );
}

export default ReportForm;
