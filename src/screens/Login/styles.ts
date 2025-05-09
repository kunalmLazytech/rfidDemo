import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  input: {
    fontSize: 14,
  },
  passwordExtras: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityIcon: {
    marginRight: 8,
  },
  forgotPassword: {
    color: '#108ee9',
    textAlign: 'right',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#108ee9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#333',
  },
  signUpLink: {
    fontSize: 14,
    color: '#108ee9',
  },
});

export default styles;
