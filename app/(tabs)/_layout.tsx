import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { useAuth } from "../../services/authContext";

export default function Layout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
    
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#4c669f',
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#b3c1e6',
        headerStyle: {
          backgroundColor: '#4c669f',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="updateProfile"
        options={{
          href: null, // Oculta esta pantalla de la barra de tabs
          title: "Actualizar Perfil",
        }}
      />
      <Tabs.Screen
        name="clinicalHistory"
        options={{
          href: null, // Oculta esta pantalla de la barra de tabs
          title: "Historial Clínico",
        }}
      />
      <Tabs.Screen
        name="PatientRegistrationForm"
        options={{
          href: null, // Oculta esta pantalla de la barra de tabs
          title: "Registro de Paciente",
        }}
      />
    </Tabs>
  );
}
