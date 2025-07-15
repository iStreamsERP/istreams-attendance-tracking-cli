// CheckinContext.js
import React, { createContext, useContext, useState } from 'react';

const CheckinContext = createContext();

export const CheckinProvider = ({ children }) => {
    const [checkins, setCheckins] = useState({});

    const recordCheckin = (empId) => {
        setCheckins(prev => ({
            ...prev,
            [empId]: Date.now()
        }));
    };

    const getLastCheckin = (empId) => {
        return checkins[empId] || null;
    };

    return (
        <CheckinContext.Provider value={{ checkins, recordCheckin, getLastCheckin }}>
            {children}
        </CheckinContext.Provider>
    );
};

export const useCheckin = () => useContext(CheckinContext);