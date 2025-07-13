// src/dataManager.js

const DATA_KEY = 'civic_issues_database';

/**
 * Loads the issue database from localStorage.
 * @returns {Array} The array of issues or an empty array.
 */
export const loadData = () => {
    try {
        const data = localStorage.getItem(DATA_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        return [];
    }
};

/**
 * Saves the issue database to localStorage.
 * @param {Array} database The array of issues to save.
 */
export const saveData = (database) => {
    try {
        localStorage.setItem(DATA_KEY, JSON.stringify(database));
    } catch (error) {
        console.error("Failed to save data to localStorage", error);
    }
};
