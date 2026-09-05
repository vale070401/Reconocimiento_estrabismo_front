import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PatientData, registerPatient } from '../../services/patientService';

export default function PatientRegistrationForm() {
  const onSuccess = () => {
    router.replace('/(tabs)');
  };
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<PatientData>({
    tipoDocumento: 'TI',
    documentoIdentidad: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: 'N',
    documentoIdentidadResponsable: '',
    parentesco: '',
    numeroTele: ''
  });

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await AsyncStorage.getItem('userToken');
        if (stored) setToken(stored);
      } catch (e) {
        // ignore
      }
    };
    loadToken();
  }, []);

  const handleChange = (name: keyof PatientData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Normaliza fechas como "2015/12/10" o "2015-12-10" a "2015-12-10".
  // También soporta "10/12/2015" o "10-12-2015" (DD/MM/YYYY) y las convierte a YYYY-MM-DD.
  const formatDateToISO = (input: string): string | null => {
    if (!input) return null;
    const s = input.trim();
    // YYYY[-/]MM[-/]DD
    let m = s.match(/^([0-9]{4})[-\/]([0-1][0-9])[-\/]([0-3][0-9])$/);
    if (m) {
      const yyyy = m[1];
      const mm = m[2];
      const dd = m[3];
      const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
      if (date.getUTCMonth() + 1 === Number(mm) && date.getUTCDate() === Number(dd)) {
        return `${yyyy}-${mm}-${dd}`;
      }
      return null;
    }
    // DD[-/]MM[-/]YYYY
    m = s.match(/^([0-3][0-9])[-\/]([0-1][0-9])[-\/]([0-9]{4})$/);
    if (m) {
      const dd = m[1];
      const mm = m[2];
      const yyyy = m[3];
      const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
      if (date.getUTCMonth() + 1 === Number(mm) && date.getUTCDate() === Number(dd)) {
        return `${yyyy}-${mm}-${dd}`;
      }
      return null;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!formData.documentoIdentidad || !formData.nombres || !formData.apellidos || 
        !formData.fechaNacimiento || !formData.parentesco) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setIsLoading(true);
      const fechaISO = formatDateToISO(formData.fechaNacimiento);
      if (!fechaISO) {
        setIsLoading(false);
        Alert.alert('Fecha inválida', 'Use el formato YYYY-MM-DD, por ejemplo 2015-12-10');
        return;
      }
      const payload = { ...formData, fechaNacimiento: fechaISO };
      const result = await registerPatient(payload, token);
      
      if (result.success) {
        Alert.alert('Éxito', 'Paciente registrado correctamente', [
          { text: 'OK', onPress: onSuccess }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Error al registrar el paciente');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registro de Paciente</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tipo de Documento *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.tipoDocumento}
            onValueChange={(value: string) => handleChange('tipoDocumento', value)}
            style={styles.picker}
          >
            <Picker.Item label="Tarjeta de Identidad" value="TI" />
            <Picker.Item label="Registro Civil" value="REGISTRO_CIVIL" />
            <Picker.Item label="NUIP" value="NUIP" />
            <Picker.Item label="Pasaporte" value="PASAPORTE" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Número de Documento *</Text>
        <TextInput
          style={styles.input}
          value={formData.documentoIdentidad}
          onChangeText={(text) => handleChange('documentoIdentidad', text)}
          placeholder="Número de documento"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombres *</Text>
        <TextInput
          style={styles.input}
          value={formData.nombres}
          onChangeText={(text) => handleChange('nombres', text)}
          placeholder="Nombres completos"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Apellidos *</Text>
        <TextInput
          style={styles.input}
          value={formData.apellidos}
          onChangeText={(text) => handleChange('apellidos', text)}
          placeholder="Apellidos completos"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha de Nacimiento *</Text>
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)}
          style={styles.dateInput}
        >
          <Text style={formData.fechaNacimiento ? styles.dateText : styles.placeholderText}>
            {formData.fechaNacimiento || 'Seleccione una fecha'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                handleChange('fechaNacimiento', formattedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Género</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.genero}
            onValueChange={(value: string) => handleChange('genero', value)}
            style={styles.picker}
          >
            <Picker.Item label="No especifica" value="N" />
            <Picker.Item label="Masculino" value="M" />
            <Picker.Item label="Femenino" value="F" />
            <Picker.Item label="Otro" value="O" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Documento del Responsable *</Text>
        <TextInput
          style={styles.input}
          value={formData.documentoIdentidadResponsable}
          onChangeText={(text) => handleChange('documentoIdentidadResponsable', text)}
          placeholder="Documento del responsable"
          keyboardType="numeric"
          editable
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Parentesco con el Responsable *</Text>
        <TextInput
          style={styles.input}
          value={formData.parentesco}
          onChangeText={(text) => handleChange('parentesco', text)}
          placeholder="Ej: Padre, Madre, Tío, etc."
        />
      </View>


      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={formData.numeroTele}
          onChangeText={(text) => handleChange('numeroTele', text)}
          placeholder="Número de teléfono"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Registrando...' : 'Registrar Paciente'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginTop: 5,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#888',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    width: '100%',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
});
