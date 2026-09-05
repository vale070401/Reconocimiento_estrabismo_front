import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://reconocimiento-estrabismo.onrender.com";

// Definimos el tipo de userData para Responsable
export interface UpdateResponsableData {
    nombres?: string;
    apellidos?: string;
    numeroTele?: string;
    parentesco?: string;
    ocupacion?: string;
    ciudadResidencia?: string;
}

export interface UpdateProfileResponse {
    token?: string;
    error?: string;
}

export const updateResponsableProfile = async (userData: UpdateResponsableData): Promise<UpdateProfileResponse> => {
    try {
        const token = await AsyncStorage.getItem("userToken");
        
        if (!token) {
            return { error: "No hay sesión activa" };
        }

        const response = await fetch(`${API_BASE_URL}/api/responsables/Update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || "Error al actualizar el perfil" };
        }

        // Retorna el nuevo token con los datos actualizados
        return { token: data.token };
    } catch (error) {
        console.error("Error en updateProfileService:", error);
        return { error: "Error al conectar con el servidor" };
    }
};
