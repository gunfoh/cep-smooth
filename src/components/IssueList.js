// src/components/IssueList.js
import React from 'react';

function IssueList({ issues, onBack }) {
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
        } catch {
            return isoString;
        }
    };
    
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl animate-fade-in w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Reported Issues</h2>
                <button onClick={onBack} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">Back</button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {issues.length > 0 ? (
                    issues.slice().reverse().map(issue => (
                        <div key={issue.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-lg text-gray-900">{issue.type} <span className="text-sm font-medium text-gray-500">({issue.status})</span></h3>
                            <p className="text-gray-700 mt-1">{issue.description}</p>
                            <p className="text-sm text-gray-500 mt-2">Time: {formatDate(issue.timestamp)}</p>
                            <p className="text-sm text-gray-500">Location: {issue.location[0].toFixed(5)}, {issue.location[1].toFixed(5)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No issues reported yet.</p>
                )}
            </div>
        </div>
    );
}

export default IssueList;
