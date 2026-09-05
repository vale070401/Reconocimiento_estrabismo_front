import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthProvider, useAuth } from "../services/authContext";

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const maybeShowDisclaimer = async () => {
      if (!isAuthenticated) return;
      const accepted = await AsyncStorage.getItem('disclaimerAccepted');
      if (!accepted) setShowDisclaimer(true);
    };
    maybeShowDisclaimer();
  }, [isAuthenticated]);

  const onAcceptDisclaimer = async () => {
    if (dontShowAgain) {
      await AsyncStorage.setItem('disclaimerAccepted', 'true');
    }
    setShowDisclaimer(false);
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="login"
              options={{
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="register"
              options={{
                presentation: 'modal'
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
          </>
        )}
      </Stack>

      <Modal
        visible={isAuthenticated && showDisclaimer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Aviso importante</Text>
            <Text style={styles.body}>
              Los resultados generados por esta aplicación tienen carácter orientativo y no constituyen un diagnóstico clínico. 
              Deben interpretarse como una sugerencia para tamizaje y siempre deben ser corroborados por un profesional de salud visual.
            </Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}
                onPress={() => setDontShowAgain(prev => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: dontShowAgain }}
              />
              <Text style={styles.checkboxLabel}>No volver a mostrar</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onAcceptDisclaimer}>
              <Text style={styles.buttonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  card: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222'
  },
  body: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 8
  },
  checkboxChecked: {
    backgroundColor: '#4c669f',
    borderColor: '#4c669f'
  },
  checkboxLabel: {
    color: '#333'
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4c669f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
