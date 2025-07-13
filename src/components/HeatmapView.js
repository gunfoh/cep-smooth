// src/components/HeatmapView.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

function HeatmapView({ issues, onBack, initialCoords }) {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) return; // Initialize map only once

        const map = L.map('heatmap-map').setView(initialCoords, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // --- Clustering Logic ---
        const reportsWithCoords = issues.filter(r => Array.isArray(r.location));
        const CLUSTER_THRESHOLD = 0.0005;
        let clusters = [];

        reportsWithCoords.forEach(report => {
            let placed = false;
            for (const cluster of clusters) {
                const dist = Math.sqrt(Math.pow(cluster.center[0] - report.location[0], 2) + Math.pow(cluster.center[1] - report.location[1], 2));
                if (dist < CLUSTER_THRESHOLD) {
                    cluster.reports.push(report);
                    const totalLat = cluster.reports.reduce((sum, r) => sum + r.location[0], 0);
                    const totalLon = cluster.reports.reduce((sum, r) => sum + r.location[1], 0);
                    cluster.center = [totalLat / cluster.reports.length, totalLon / cluster.reports.length];
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                clusters.push({ center: report.location, reports: [report] });
            }
        });

        // --- Draw Clusters on Map ---
        clusters.forEach(cluster => {
            const count = cluster.reports.length;
            const size = 20 + count * 5;
            
            const icon = L.divIcon({
                html: `<div class="flex items-center justify-center w-full h-full bg-red-500 text-white font-bold rounded-full border-2 border-white shadow-lg">${count}</div>`,
                className: '',
                iconSize: [size, size]
            });

            const marker = L.marker(cluster.center, { icon }).addTo(map);
            const popupContent = cluster.reports.map(r => `<b>${r.type}</b><br>${r.description}`).join('<hr class="my-1">');
            marker.bindPopup(popupContent);
        });
        
        mapRef.current = map;
    }, [issues, initialCoords]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-2xl animate-fade-in w-full max-w-4xl">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Issue Heatmap</h2>
                <button onClick={onBack} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">Back</button>
            </div>
            <div id="heatmap-map" className="h-[65vh] w-full rounded-lg shadow-inner bg-gray-200 z-0"></div>
        </div>
    );
}

export default HeatmapView;
