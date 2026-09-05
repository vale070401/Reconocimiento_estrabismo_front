import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.background}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Bienvenido a</Text>
          <Text style={styles.appName}>DetectEye</Text>
          <Text style={styles.subtitle}>Sistema de Detección de Estrabismo</Text>

          <View style={styles.buttonContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity style={[styles.button, styles.loginButton]}>
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/register" asChild>
              <TouchableOpacity style={[styles.button, styles.registerButton]}>
                <Text style={[styles.buttonText, styles.registerText]}>Registrarse</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Text style={styles.description}>
            Es una herramienta profesional diseñada para la detección temprana del estrabismo en niños mediante el análisis de imágenes.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight: '300',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  registerText: {
    color: '#ffffff',
  },
  description: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});