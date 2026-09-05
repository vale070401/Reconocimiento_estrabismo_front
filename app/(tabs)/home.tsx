import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/authContext';

interface Paciente {
  id: number;
  nombres: string;
  apellidos: string;
  documentoIdentidad: string;
  // Agrega más campos según la respuesta de tu API
}

export default function HomeScreen() {
  const { userData } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      fetchPacientes();
    }
  }, [userData]);

  const fetchPacientes = async () => {
    if (!userData?.id) {
      console.error('No user ID available');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token from storage:', token);
      
      const url = `https://reconocimiento-estrabismo.onrender.com/api/pacientes/responsable/${userData.id}`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pacientes data:', data);
      setPacientes(data);
    } catch (error) {
      console.error('Error fetching pacientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes. Por favor verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
  };

  const handleTakePhoto = async () => {
    if (!selectedPaciente) {
      Alert.alert('Error', 'Por favor selecciona un paciente primero');
      return;
    }

    try {
      console.log('Solicitando permisos de cámara...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Estado de permisos de cámara:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesitan permisos de cámara para continuar');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      alert('Hubo un error al tomar la foto. Por favor intente nuevamente.');
    }
  };

  const handleSelectPhoto = async () => {
    try {
      console.log('Solicitando permisos de galería...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Estado de permisos de galería:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesitan permisos de galería para continuar');
        return;
      }

      console.log('Abriendo selector de imágenes...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      console.log('Resultado de la selección:', result);

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Error al seleccionar la foto:', error);
      alert('Hubo un error al seleccionar la foto. Por favor intente nuevamente.');
    }
  };

  const uploadImage = async (imageUri: string) => {
    if (!selectedPaciente) {
      Alert.alert('Error', 'Por favor selecciona un paciente primero');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      console.log('Enviando imagen al API...');
      const response = await fetch(`https://fastapi-tppn.onrender.com/predict/${selectedPaciente.documentoIdentidad}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      console.log('Respuesta del API:', data);
      
      if (data.tieneEstrabismo) {
        Alert.alert('Estrabismo detectado', `Confianza: ${(data.confianza * 100).toFixed(2)}%`);
      } else {
        Alert.alert('No se detectó estrabismo', `Confianza: ${(data.confianza * 100).toFixed(2)}%`);
      }
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
      Alert.alert('Error', 'No se pudo enviar la imagen');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando pacientes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Selecciona un paciente</Text>
      
      {!selectedPaciente ? (
        <View style={styles.pacientesContainer}>
          {pacientes.length > 0 ? (
            pacientes.map((paciente) => (
              <TouchableOpacity
                key={paciente.id}
                style={styles.pacienteButton}
                onPress={() => handleSelectPaciente(paciente)}
              >
                <Text style={styles.pacienteText}>
                  {paciente.nombres} {paciente.apellidos}
                </Text>
                <Text style={styles.documentoText}>
                  {paciente.documentoIdentidad}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noPacientes}>No hay pacientes registrados</Text>
          )}
        </View>
      ) : (
        <View style={styles.pacienteSeleccionado}>
          <Text style={styles.subtitle}>Paciente seleccionado:</Text>
          <Text style={styles.pacienteNombre}>
            {selectedPaciente.nombres} {selectedPaciente.apellidos}
          </Text>
          <Text style={styles.pacienteDoc}>
            Documento: {selectedPaciente.documentoIdentidad}
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, uploading && styles.buttonDisabled]} 
            onPress={handleTakePhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tomar foto</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => setSelectedPaciente(null)}
            disabled={uploading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Cambiar paciente
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleSelectPhoto}
            disabled={uploading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Subir foto
            </Text>
          </TouchableOpacity>
          
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  pacientesContainer: {
    marginBottom: 20,
  },
  pacienteButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pacienteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  documentoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pacienteSeleccionado: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  pacienteNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pacienteDoc: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
  },
  secondaryButtonText: {
    color: 'white',
  },
  noPacientes: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
})