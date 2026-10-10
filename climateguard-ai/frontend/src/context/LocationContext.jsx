import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        const data = await api.getLocations();
        setLocations(data);
        if (data.length > 0) {
          // Default to Vijayawada or first city
          const vijayawada = data.find((l) => l.name.toLowerCase().includes('vijayawada'));
          setSelectedLocation(vijayawada || data[0]);
        }
      } catch (err) {
        setError('Failed to load supported locations registry. Please check backend status.');
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        locations,
        selectedLocation,
        setSelectedLocation,
        loading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
