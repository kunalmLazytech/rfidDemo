// src/styles/styles.ts

import { StyleSheet } from 'react-native';
import globalStyles from '@styles/globalStyles'; // Assuming this is the correct import path

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    paddingTop: 0,
    backgroundColor: 'white',
  },
  header: {
    ...globalStyles.header,
  },
  backButton: {
    ...globalStyles.backButton,
  },
  headerLabel: {
    ...globalStyles.headerLabel,
  },
  scrollContainer: {
    ...globalStyles.scrollContainer,
  },
  rowCenter: {
    ...globalStyles.rowCenter,
    gap: 20,
  },
  toggleText: {
    ...globalStyles.toggleText,
  },
  selectedText: {
    ...globalStyles.selectedText,
  },
  labelSmLeft: {
    ...globalStyles.labelSmLeft,
  },
  dropDownContainer: {
    ...globalStyles.dropDownContainer,
  },
  inputContainer: {
    ...globalStyles.inputContainer,
  },
  input: {
    ...globalStyles.input,
  },
  addMore: {
    ...globalStyles.addMore,
  },
  buttonText: {
    ...globalStyles.buttonText,
  },
  closeButton: {
    ...globalStyles.closeButton,
  },
  btnText: {
    ...globalStyles.btnText,
  },
  addButtonText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  addMoreButton: {
    flex: 1,
    backgroundColor: '#4cc38a',
    borderRadius: 10,
    borderWidth: 0,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  clearText: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  formContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
});

export default styles;
