import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadData from '../Logics/LoadData';
import { useAuth } from '../Context/AuthContext';

const tasks = [
  { key: 'fetchEmployees', label: 'Loading employees...' },
  { key: 'fetchProjects', label: 'Loading projects...' },
  { key: 'fetchLeaveType', label: 'Loading Leave Type...' },
  { key: 'fetchCategory', label: 'Loading Leave Category...' },
  { key: 'fetchManpowerSuppliers', label: 'Loading manpower suppliers...' },
  { key: 'fetchDeskArea', label: 'Loading desk area...' },
  { key: 'fetchCuttingLine', label: 'Loading cuttingline...' },
];


const DataLoadingScreen = ({ navigation }) => {
  const { userData } = useAuth();

  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    const runTasks = async () => {
      for (let task of tasks) {
        await LoadData(task.key, userData.clientURL);
        setCompletedTasks((prev) => [...prev, task.key]);
      }

      navigation.replace('Home');
    };

    runTasks();
  }, []);

  const isTaskDone = (taskKey) => completedTasks.includes(taskKey);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loading Necessary Data...</Text>
      {tasks.map((task) => (
        <View key={task.key} style={styles.taskRow}>
          {isTaskDone(task.key) ? (
            <Ionicons name="checkmark-circle" size={24} color="green" />
          ) : (
            <ActivityIndicator size="small" color="gray" />
          )}
          <Text style={styles.taskText}>{task.label}</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  taskText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
