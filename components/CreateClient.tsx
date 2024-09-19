import React, { useState } from "react";
import { Modal, Text, Pressable, View, TextInput, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

function CreateClient() {
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState({
    phone: "",
    name: "",
    error: "",
  });

  return (
    <View>
      <Pressable onPress={() => setModalVisible(true)} style={styles.iconButton}>
        <MaterialCommunityIcons name="account-plus" size={24} color="gray" />
      </Pressable>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalBackground}>
          <Text style={styles.closeText} onPress={() => setModalVisible(false)}>
            Close
          </Text>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Create a New Client</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Name"
                  value={value.name}
                  style={styles.input}
                  onChangeText={(text) => setValue({ ...value, name: text })}
                />
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Phone"
                  value={value.phone}
                  style={styles.input}
                  onChangeText={(text) => setValue({ ...value, phone: text })}
                />
              </View>
            </View>
            <Pressable style={styles.button} onPress={() => {/* Add create client logic here */}}>
              <Text style={styles.buttonText}>Create Client</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeText: {
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: "#243b55",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  button: {
    backgroundColor: "#1e90ff",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  iconButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateClient;
