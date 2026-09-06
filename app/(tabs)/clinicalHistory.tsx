import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/authContext';


interface Paciente {
  id: number;
  documentoIdentidad: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
}

export default function ClinicalHistoryScreen() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(
        `https://reconocimiento-estrabismo-9hi3.onrender.com/api/pacientes/responsable/${userData?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar los pacientes');
      }
      
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  const descargarHistoriaClinica = async (documentoIdentidad: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const url = `https://reconocimiento-estrabismo-9hi3.onrender.com/api/pdf/historia-clinica/${documentoIdentidad}`;
      
      // Usar el directorio de caché de la aplicación
      const fileUri = `${FileSystemLegacy.cacheDirectory}historia-clinica-${documentoIdentidad}.pdf`;
      
      // Usar la API legada para la descarga
      const downloadResult = await FileSystemLegacy.downloadAsync(
        url,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (downloadResult.status === 200) {
        const { uri } = downloadResult;
        // Verificar si el archivo existe usando la API legada
        const fileInfo = await FileSystemLegacy.getInfoAsync(uri);
        if (fileInfo.exists) {
          // Compartir el archivo
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Historia Clínica',
            UTI: 'com.adobe.pdf'
          });
        } else {
          throw new Error('El archivo no se descargó correctamente');
        }
      } else {
        throw new Error(`Error en la descarga: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error al descargar la historia clínica:', error);
      Alert.alert('Error', 'No se pudo descargar la historia clínica. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && pacientes.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Descargar PDF de Evaluaciones</Text>
        
        {pacientes.length > 0 ? (
          pacientes.map((paciente) => (
            <TouchableOpacity
              key={paciente.id}
              style={styles.card}
              onPress={() => descargarHistoriaClinica(paciente.documentoIdentidad)}
            >
              <View style={styles.pacienteInfo}>
                <Text style={styles.pacienteNombre}>
                  {paciente.nombres} {paciente.apellidos}
                </Text>
                <Text style={styles.pacienteDocumento}>
                  Documento: {paciente.documentoIdentidad}
                </Text>
              </View>
              <FontAwesome name="file-pdf-o" size={24} color="#e74c3c" style={styles.pdfIcon} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noPacientesContainer}>
            <Text style={styles.noPacientesText}>No hay pacientes registrados</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  pacienteInfo: {
    flex: 1,
  },
  pacienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pacienteDocumento: {
    fontSize: 14,
    color: '#666',
  },
  pdfIcon: {
    marginLeft: 10,
  },
  noPacientesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPacientesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  fecha: {
    fontSize: 16,
    color: '#4c669f',
    fontWeight: 'bold',
  },
  resultado: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    gap: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});