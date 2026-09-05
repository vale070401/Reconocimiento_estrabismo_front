import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../services/authContext";
import { updateResponsableProfile } from "../services/updateProfileService";

export default function UpdateProfileScreen() {
  const { userData, updateToken } = useAuth();
  
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroTele, setNumeroTele] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [ciudadResidencia, setCiudadResidencia] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del JWT al montar el componente
  useEffect(() => {
    if (userData) {
      setNombres(userData.nombres || "");
      setApellidos(userData.apellidos || "");
      setNumeroTele(userData.numeroTele || "");
      setParentesco(userData.parentesco || "");
      setOcupacion(userData.ocupacion || "");
      setCiudadResidencia(userData.ciudadResidencia || "");
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    try {
      // Validar campos obligatorios
      if (!nombres || !apellidos) {
        Alert.alert("Error", "Nombres y apellidos son obligatorios");
        return;
      }

      // Validar formato de número de teléfono (10 dígitos) si se proporciona
      if (numeroTele && !/^\d{10}$/.test(numeroTele)) {
        Alert.alert("Error", "Por favor ingrese un número de teléfono válido (10 dígitos)");
        return;
      }

      setIsLoading(true);

      const updateData = {
        nombres,
        apellidos,
        numeroTele,
        parentesco,
        ocupacion,
        ciudadResidencia
      };

      const response = await updateResponsableProfile(updateData);

      if (response.error) {
        Alert.alert("Error", response.error);
      } else if (response.token) {
        // Actualizar el token en el contexto para reflejar los cambios
        await updateToken(response.token);
        Alert.alert("Éxito", "Tus datos han sido actualizados correctamente");
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert("Error", "Ocurrió un error al actualizar tus datos");
    } finally {
      setIsLoading(false);
    }
  };
  return (
      <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Actualizar Datos</Text>

            {/* Correo (solo lectura) */}
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={userData?.correo || ""}
                editable={false}
            />

            {/* Documento (solo lectura) */}
            <Text style={styles.label}>Documento de identidad</Text>
            <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={userData?.documentoIdentidad?.toString() || ""}
                editable={false}
            />

            <Text style={styles.label}>Nombres</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombres"
                placeholderTextColor="#666"
                value={nombres}
                onChangeText={setNombres}
            />

            <Text style={styles.label}>Apellidos</Text>
            <TextInput
                style={styles.input}
                placeholder="Apellidos"
                placeholderTextColor="#666"
                value={apellidos}
                onChangeText={setApellidos}
            />

            <Text style={styles.label}>Número de teléfono</Text>
            <TextInput
                style={styles.input}
                placeholder="Número de teléfono (10 dígitos)"
                placeholderTextColor="#666"
                value={numeroTele}
                onChangeText={setNumeroTele}
                keyboardType="phone-pad"
                maxLength={10}
            />

            <Text style={styles.label}>Parentesco</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej: Padre, Madre, Tutor..."
                placeholderTextColor="#666"
                value={parentesco}
                onChangeText={setParentesco}
            />

            <Text style={styles.label}>Ocupación</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej: Ingeniero, Médico, Docente..."
                placeholderTextColor="#666"
                value={ocupacion}
                onChangeText={setOcupacion}
            />

            <Text style={styles.label}>Ciudad de residencia</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej: Bogotá, Medellín..."
                placeholderTextColor="#666"
                value={ciudadResidencia}
                onChangeText={setCiudadResidencia}
            />

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#4c669f" />
              ) : (
                <Text style={styles.buttonText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#ffffff",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  label: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
  },
  inputDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    color: "#666",
  },
  button: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  buttonText: {
    color: "#4c669f",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
