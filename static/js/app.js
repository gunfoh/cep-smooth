const { useState, useEffect, useRef } = React;


function App() {
    const [database, setDatabase] = useState([]);
    const [view, setView] = useState('main_menu');
    const [isLoading, setIsLoading] = useState(true);

    const DEEPDALE_COORDS = [53.765, -2.685];

    //heartbeat new
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetch('/api/heartbeat', { method: 'POST' })
                .catch(err => console.error("Heartbeat failed:", err));
        }, 3000); //send heartbeat every 3 seconds

        
        return () => clearInterval(intervalId);
    }, []); 

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/issues');
                const data = await response.json();
                setDatabase(data);
            } catch (error) {
                console.error("Failed to fetch issues:", error);
                alert("Could not connect to the server to load issues.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const addReport = async (report) => {
        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
            if (!response.ok) throw new Error('Server error');
            const newReportData = await response.json();
            setDatabase(prevDb => [...prevDb, newReportData.report]);
            setView('main_menu');
        } catch (error) {
            console.error("Failed to submit report:", error);
            alert("Failed to submit the report. Please try again.");
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading...</div>;
    }

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

//ui


function MainMenu({ setView }) {
    const Button = ({ children, onClick, colorClass }) => (
        <button onClick={onClick} className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out ${colorClass}`}>
            {children}
        </button>
    );
    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl space-y-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Civic Engagement Platform</h1>
            <Button onClick={() => setView('report')} colorClass="bg-blue-500 hover:bg-blue-600">Report a New Issue</Button>
            <Button onClick={() => setView('view_all')} colorClass="bg-blue-500 hover:bg-blue-600">View All Reported Issues</Button>
            <Button onClick={() => setView('heatmap')} colorClass="bg-teal-500 hover:bg-teal-600">View Issue Heatmap</Button>
        </div>
    );
}
const MapPicker = ({ initialCoords, onPositionChange }) => {
    const mapRef = useRef(null);
    useEffect(() => {
        if (mapRef.current) return;
        const map = L.map('map-picker').setView(initialCoords, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        const marker = L.marker(initialCoords, { draggable: true }).addTo(map);
        marker.on('dragend', (event) => {
            const { lat, lng } = event.target.getLatLng();
            onPositionChange([lat, lng]);
        });
        mapRef.current = map;
    }, [initialCoords, onPositionChange]);
    return <div id="map-picker" className="h-64 w-full rounded-lg shadow-inner bg-gray-200"></div>;
};
function ReportForm({ onSubmit, onCancel, initialCoords }) {
    const [issueType, setIssueType] = useState('Pothole');
    const [description, setDescription] = useState('');
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    const [manualTime, setManualTime] = useState('');
    const [markerPosition, setMarkerPosition] = useState(initialCoords);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description) { alert('Please enter a description.'); return; }
        const newReport = { id: Date.now(), type: issueType, description, location: markerPosition, timestamp: useCurrentTime ? new Date().toISOString() : manualTime, status: 'Reported' };
        onSubmit(newReport);
    };
    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Report an Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700">Type of Issue</label><select value={issueType} onChange={e => setIssueType(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"><option>Pothole</option><option>Broken Streetlight</option><option>Trash/Litter</option><option>Graffiti</option><option>Public Transportation</option><option>Other</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" rows="3"></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700">Time of Issue</label><div className="mt-2 space-y-2"><div className="flex items-center"><input type="checkbox" checked={useCurrentTime} onChange={e => setUseCurrentTime(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label className="ml-2 block text-sm text-gray-900">Use current time</label></div>{!useCurrentTime && (<input type="datetime-local" value={manualTime} onChange={e => setManualTime(e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm" />)}</div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Location (drag marker to set)</label><MapPicker initialCoords={initialCoords} onPositionChange={setMarkerPosition} /></div>
                <div className="flex justify-between pt-4"><button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button><button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Submit Report</button></div>
            </form>
        </div>
    );
}
function IssueList({ issues, onBack }) {
    const formatDate = (isoString) => { if (!isoString) return 'N/A'; try { return new Date(isoString).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return isoString; } };
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">All Reported Issues</h2><button onClick={onBack} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">Back</button></div><div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">{issues.length > 0 ? (issues.slice().reverse().map(issue => (<div key={issue.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200"><h3 className="font-bold text-lg text-gray-900">{issue.type} <span className="text-sm font-medium text-gray-500">({issue.status})</span></h3><p className="text-gray-700 mt-1">{issue.description}</p><p className="text-sm text-gray-500 mt-2">Time: {formatDate(issue.timestamp)}</p><p className="text-sm text-gray-500">Location: {issue.location[0].toFixed(5)}, {issue.location[1].toFixed(5)}</p></div>))) : (<p className="text-center text-gray-500 py-8">No issues reported yet.</p>)}</div></div>
    );
}
function HeatmapView({ issues, onBack, initialCoords }) {
    const mapRef = useRef(null);
    useEffect(() => {
        if (mapRef.current) return;
        const map = L.map('heatmap-map').setView(initialCoords, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        const reportsWithCoords = issues.filter(r => Array.isArray(r.location));
        const CLUSTER_THRESHOLD = 0.0005;
        let clusters = [];
        reportsWithCoords.forEach(report => {
            let placed = false;
            for (const cluster of clusters) {
                const dist = Math.sqrt(Math.pow(cluster.center[0] - report.location[0], 2) + Math.pow(cluster.center[1] - report.location[1], 2));
                if (dist < CLUSTER_THRESHOLD) { cluster.reports.push(report); const totalLat = cluster.reports.reduce((sum, r) => sum + r.location[0], 0); const totalLon = cluster.reports.reduce((sum, r) => sum + r.location[1], 0); cluster.center = [totalLat / cluster.reports.length, totalLon / cluster.reports.length]; placed = true; break; }
            }
            if (!placed) { clusters.push({ center: report.location, reports: [report] }); }
        });
        clusters.forEach(cluster => {
            const count = cluster.reports.length;
            const size = 20 + count * 5;
            const icon = L.divIcon({ html: `<div class="flex items-center justify-center w-full h-full bg-red-500 text-white font-bold rounded-full border-2 border-white shadow-lg">${count}</div>`, className: '', iconSize: [size, size] });
            const marker = L.marker(cluster.center, { icon }).addTo(map);
            const popupContent = cluster.reports.map(r => `<b>${r.type}</b><br>${r.description}`).join('<hr class="my-1">');
            marker.bindPopup(popupContent);
        });
        mapRef.current = map;
    }, [issues, initialCoords]);
    return (
        <div className="bg-white p-4 rounded-xl shadow-2xl w-full max-w-4xl"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">Issue Heatmap</h2><button onClick={onBack} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">Back</button></div><div id="heatmap-map" className="h-[65vh] w-full rounded-lg shadow-inner bg-gray-200"></div></div>
    );
}

//renders app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
