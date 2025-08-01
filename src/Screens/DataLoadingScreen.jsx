import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadData from '../Logics/LoadData';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

const tasks = [
  { key: 'fetchEmployees', label: 'Loading employees...' },
  { key: 'fetchProjects', label: 'Loading projects...' },
  { key: 'fetchLeaveType', label: 'Loading Leave Type...' },
  { key: 'fetchCategory', label: 'Loading Leave Category...' },
  { key: 'fetchManpowerSuppliers', label: 'Loading manpower suppliers...' },
  { key: 'fetchDesignationMaster', label: 'Loading designation master...' },
  { key: 'fetchDeskArea', label: 'Loading desk area...' },
  { key: 'fetchCuttingLine', label: 'Loading cuttingline...' },
];


const DataLoadingScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    const runTasks = async () => {
      for (let task of tasks) {
        await LoadData(task.key, userData.clientURL);
        setCompletedTasks((prev) => [...prev, task.key]);
      }

      navigation.replace('Home1');
    };

    runTasks();
  }, []);

  const isTaskDone = (taskKey) => completedTasks.includes(taskKey);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[globalStyles.title, globalStyles.txt_center, { marginBottom: 30 }]}>Loading Necessary Data...</Text>
      {tasks.map((task) => (
        <View key={task.key} style={[globalStyles.twoInputContainer, { justifyContent: 'flex-start', marginBottom: 20}]}>
          {isTaskDone(task.key) ? (
            <Ionicons name="checkmark-circle" size={24} color="green" />
          ) : (
            <ActivityIndicator size="small" color="gray" />
          )}
          <Text style={[globalStyles.subtitle_2, globalStyles.mx_5]}>{task.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default DataLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 30,
  },
});
