import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const PUBLIC_SERVICE_URL = '';

const defaultUserData = {
  serviceUrl: PUBLIC_SERVICE_URL,
  clientURL: '',
  companyCode: null,
  branchCode: null,
  userEmail: '',
  userName: '',
  userEmployeeNo: '',
  userAvatar: '',
  companyName: '',
  companyAddress: '',
  companyLogo: '',
  companyCurrName: '',
  companyCurrDecimals: 0,
  companyCurrSymbol: null,
  companyCurrIsIndianStandard: false,
  androidID: '',
  userDomain: '',
};

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(defaultUserData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');

        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }

      } catch (e) {
        console.warn('Failed to load stored data:', e);
      }

      setLoading(false);
    };

    loadStoredData();
  }, []);

  const login = useCallback(async (data, rememberMe = false) => {
    const newUserData = { ...defaultUserData, ...data };
    setUserData(newUserData);

    try {
      if (rememberMe) {
        await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      } else {
        await AsyncStorage.setItem('tempUserData', JSON.stringify(newUserData));
        await AsyncStorage.removeItem('userData');
      }
    } catch (e) {
      console.warn('Login storage error:', e);
    }
  }, []);

  const logout = useCallback(async () => {
    setUserData(defaultUserData);
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('tempUserData');
    } catch (e) {
      console.warn('Logout storage error:', e);
    }
  }, []);

  if (loading) return null; // or show a loading screen/spinner

  return (
    <AuthContext.Provider value={{ login, logout, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
