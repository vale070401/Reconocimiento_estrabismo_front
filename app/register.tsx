import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { registerUser } from "../services/userService";

export default function RegisterScreen() {
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [documentoIdentidad, setDocumentoIdentidad] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [numeroTele, setNumeroTele] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const calcularEdad = (fechaNac: string) => {
    const hoy = new Date();
    const fechaNacDate = new Date(fechaNac);
    let edad = hoy.getFullYear() - fechaNacDate.getFullYear();
    const mes = hoy.getMonth() - fechaNacDate.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacDate.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!hasUpperCase) {
      return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
    }
    if (!hasLowerCase) {
      return { valid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
    }
    if (!hasNumbers) {
      return { valid: false, message: 'La contraseña debe contener al menos un número' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'La contraseña debe contener al menos un carácter especial (ej: !@#$%^&*)' };
    }
    
    return { valid: true, message: '' };
  };

  const handleRegister = async () => {
    try {
      // Validar todos los campos
      if (!tipoDocumento || !documentoIdentidad || !nombres || !apellidos || !fechaNacimiento || !correo || !password || !numeroTele) {
        Alert.alert("Error", "Por favor complete todos los campos");
        return;
      }

      // Validar contraseña
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        Alert.alert("Error en la contraseña", passwordValidation.message);
        return;
      }

      if (!aceptaTerminos) {
        Alert.alert("Error", "Debe aceptar los términos y condiciones para continuar");
        return;
      }

      // Validar que la fecha de nacimiento sea válida y la edad sea mayor a 18
      const edadUsuario = calcularEdad(fechaNacimiento);
      if (edadUsuario < 18) {
        Alert.alert("Error", "Debes ser mayor de 18 años para registrarte");
        return;
      }

      // Validar formato de documento (solo números)
      const docRegex = /^\d+$/;
      if (!docRegex.test(documentoIdentidad)) {
        Alert.alert("Error", "El número de documento solo puede contener números");
        return;
      }

      // Validar formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        Alert.alert("Error", "Por favor ingrese un correo electrónico válido");
        return;
      }

      // Validar formato de número de teléfono (10 dígitos)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(numeroTele)) {
        Alert.alert("Error", "Por favor ingrese un número de teléfono válido (10 dígitos)");
        return;
      }

      const userData = {
        tipoDocumento,
        documentoIdentidad,
        nombres,
        apellidos,
        fechaNacimiento,
        correo,
        password,
        numeroTele
      };

      const response = await registerUser(userData);
      console.log("Respuesta del servidor:", response);

      if (response.error) {
        Alert.alert("Error", response.error);
        return;
      }

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta ha sido creada correctamente, te hemos enviado un correo a tu cuenta para confirmar.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Error en registro:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error durante el registro. Por favor intente nuevamente."
      );
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Registro</Text>
          <Text style={styles.reminderText}>
            Recuerda que debes ser mayor de 18 años para registrarte.
          </Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Tipo de documento</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={tipoDocumento}
                onValueChange={(itemValue) => setTipoDocumento(itemValue)}
                style={styles.picker}
                dropdownIconColor="#666"
              >
                <Picker.Item label="Seleccione un tipo" value="" />
                <Picker.Item label="Cédula de Ciudadanía" value="CC" />
                <Picker.Item label="Cédula de Extranjería" value="CE" />
                <Picker.Item label="Pasaporte" value="PA" />
                <Picker.Item label="Tarjeta de Identidad" value="TI" />
              </Picker>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Número de documento"
            placeholderTextColor="#666"
            value={documentoIdentidad}
            onChangeText={setDocumentoIdentidad}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Nombres"
            placeholderTextColor="#666"
            value={nombres}
            onChangeText={setNombres}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            placeholderTextColor="#666"
            value={apellidos}
            onChangeText={setApellidos}
            autoCapitalize="words"
          />

          <TouchableOpacity 
            style={styles.input}
            onPress={() => setMostrarDatePicker(true)}
          >
            <Text style={fechaNacimiento ? styles.inputText : styles.placeholderText}>
              {fechaNacimiento || 'Fecha de nacimiento'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={mostrarDatePicker}
            mode="date"
            onConfirm={(date) => {
              setMostrarDatePicker(false);
              const fechaFormateada = date.toISOString().split('T')[0];
              const edad = calcularEdad(fechaFormateada);
              
              if (edad < 18) {
                Alert.alert("Error", "Debes ser mayor de 18 años para registrarte");
                setFechaNacimiento("");
              } else {
                setFechaNacimiento(fechaFormateada);
              }
            }}
            onCancel={() => setMostrarDatePicker(false)}
            maximumDate={new Date()}
            locale="es_ES"
            confirmTextIOS="Confirmar"
            cancelTextIOS="Cancelar"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#666"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Contraseña"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.showButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showButtonText}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
          {password.length > 0 && (
            <Text style={styles.passwordHint}>
              {password.length < 8 ? 'Mínimo 8 caracteres' : 
              !/[A-Z]/.test(password) ? 'Incluye una mayúscula' :
              !/[a-z]/.test(password) ? 'Incluye una minúscula' :
              !/\d/.test(password) ? 'Incluye un número' :
              !/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'Incluye un carácter especial' :
              'Contraseña segura'}
            </Text>
          )}
        </View>

          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            placeholderTextColor="#666"
            value={numeroTele}
            onChangeText={setNumeroTele}
            keyboardType="phone-pad"
          />

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAceptaTerminos(!aceptaTerminos)}
            >
              <View style={[
                styles.checkboxInner,
                aceptaTerminos && styles.checkboxChecked
              ]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMostrarTerminos(true)}>
              <Text style={styles.termsText}>
                Acepto los términos y condiciones
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
          
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={mostrarTerminos}
        onRequestClose={() => setMostrarTerminos(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
            <Text style={styles.modalText}>
              De acuerdo con la Ley 1581 de 2012 de Protección de Datos Personales, autorizo expresamente a la aplicación 
              para la recolección, almacenamiento y uso de mis datos personales con la finalidad de:

              1. Realizar el proceso de registro y autenticación en la aplicación.
              2. Almacenar y procesar información clínica relacionada con la detección de estrabismo.
              3. Contactarme para propósitos relacionados con el servicio a través del correo electrónico o número telefónico proporcionado.

              Entiendo que tengo derecho a:
              - Conocer, actualizar y rectificar mis datos personales
              - Solicitar prueba de esta autorización
              - Ser informado sobre el uso que se ha dado a mis datos personales
              - Presentar quejas ante la Superintendencia de Industria y Comercio
              - Revocar esta autorización
              - Acceder gratuitamente a mis datos personales

              La aplicación se compromete a mantener la confidencialidad de los datos y a implementar medidas de seguridad 
              apropiadas para proteger la información personal.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setMostrarTerminos(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reminderText: {
    color: '#ffeb3b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: '#fff',
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#4c669f',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#ffffff",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#000',
  },
  inputText: {
    color: '#000',
  },
  placeholderText: {
    color: '#666',
  },
  pickerContainer: {
    marginBottom: 15,
    width: '100%',
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#000',
  },
  label: {
    color: '#fff',
    marginBottom: 5,
    marginLeft: 5,
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
  buttonText: {
    color: "#4c669f",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
  },
  passwordContainer: {
  width: '100%',
  marginBottom: 15,
  position: 'relative',
},
passwordInput: {
  paddingRight: 80, // Espacio para el botón de mostrar/ocultar
},
showButton: {
  position: 'absolute',
  right: 15,
  top: 15,
  padding: 5,
  zIndex: 10,
},
showButtonText: {
  color: '#4c669f',
  fontWeight: 'bold',
  fontSize: 14,
},
passwordHint: {
  color: '#ffeb3b',
  fontSize: 12,
  marginTop: 4,
  marginLeft: 10,
},
});