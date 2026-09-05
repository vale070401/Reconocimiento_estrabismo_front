import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../services/authContext';

export default function ProfileScreen() {
  const { logout } = useAuth();

  const handleUpdateProfile = () => {
    // Navegamos a la pantalla de actualización de perfil
    router.push("./updateProfile");
  };

  const handleViewHistory = () => {
    // Navegamos a la pantalla de historial clínico
    router.push("./clinicalHistory");
  };

  const handleRegisterPatient = () => {
    // Navegamos al formulario de registro de paciente
    router.push("./PatientRegistrationForm");
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, cerrar sesión", 
          onPress: async () => {
            await logout();
            router.replace("/");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#ffffff" />
        </View>
        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleUpdateProfile}
        >
          <Ionicons name="create-outline" size={24} color="#4c669f" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Actualizar Datos</Text>
            <Text style={styles.optionDescription}>
              Modifica tu información personal
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#4c669f" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleViewHistory}
        >
          <Ionicons name="document-text-outline" size={24} color="#4c669f" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Historial Clínico</Text>
            <Text style={styles.optionDescription}>
              Ver historial de detecciones de estrabismo
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#4c669f" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={handleRegisterPatient}
        >
          <Ionicons name="person-add-outline" size={24} color="#4c669f" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Registrar Paciente</Text>
            <Text style={styles.optionDescription}>
              Registra un nuevo paciente a tu cargo
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#4c669f" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: '#ff4444' }]}>
              Cerrar Sesión
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4c669f',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  optionsContainer: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 20,
  },
});