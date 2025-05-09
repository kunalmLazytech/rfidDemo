import {Platform, StyleSheet} from 'react-native';
import COLORS from '@assets/Components/Colors';

const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    // backgroundColor: COLORS.white,
    // backgroundColor: COLORS.gray,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: COLORS.light,
    // marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  containerCenter: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDownContainer: {
    height: 47,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.muted,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 8,
  },

  // Headers
  header: {
    backgroundColor: COLORS.primary,
    // backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 35,
    paddingBottom: 10,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    marginRight: 8,
  },

  // Text Styles
  textLarge: {
    fontSize: 24,
    fontWeight: '600',
  },
  labelMarginLeft12: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  labelSm: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  labelMd: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  labelSmLeft: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
  },
  headerSubtitle: {
    color: COLORS.light,
    fontSize: 14,
    marginTop: 4,
  },
  headerLabel: {
    color: COLORS.white,
    fontSize: 16,
    paddingVertical: 4,
    paddingLeft: 6,
    borderRadius: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.transparent,
    color: COLORS.darkGray,
  },
  selectedText: {
    borderBottomColor: COLORS.themeInfo,
    color: COLORS.themeInfo,
  },
  sliderContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  slider: {
    height: 40,
    marginBottom: 10,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#006400',
    textAlign: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },

  //Card Button
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    margin: 16,
    borderRadius: 16,
    borderWidth: 0,
    borderColor: COLORS.gray,
    shadowColor: COLORS.dark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    // width: '100%',
  },
  cardHeader: {
    borderBottomWidth: 0,
    borderBottomColor: COLORS.light,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardBody: {
    alignItems: 'center',
    padding: 20,
  },
  buttonCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 0,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  disconnectButton: {
    width: '52%',
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignContent: 'center',
  },
  connectButton: {
    width: '52%',
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignContent: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: -20,
    backgroundColor: COLORS.danger,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    zIndex: 10,
  },
  btnComponent: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 0,
    marginTop: 5,
    marginBottom: 15,
    backgroundColor: COLORS.success,
  },

  // Progress Bar
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.gray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
  },

  // Lists / Rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12,
    borderBottomColor: COLORS.secondary,
    borderBottomWidth: 1,
  },
  rowItem: {
    flex: 1,
    alignItems: 'center',
    fontSize: 13,
    textAlign: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 4,
    padding: 12,
  },
  containerCard: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 10,
    // borderWidth: 0,
    // borderColor: COLORS.secondary,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMore: {
    alignSelf: 'flex-end',
    marginVertical: 10,
    marginEnd: 2,
    height: 40,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },

  // Input
  input: {
    fontSize: 14,
    marginLeft: -6,
    backgroundColor: COLORS.white,
  },

  // Icons & Logo
  iconWrapper: {
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: COLORS.success,
  },
  disconnected: {
    backgroundColor: COLORS.danger,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 150,
    height: 70,
    resizeMode: 'contain',
  },
  titleContainer: {
    paddingVertical: 13,
    // paddingLeft: 15,
    paddingHorizontal: 10,
    // paddingBottom: 0,
    backgroundColor: COLORS.white,
    // borderBottomWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.dark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  btn: {
    backgroundColor: COLORS.themeInfo,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: 'center',
  },
  btnText: {color: COLORS.white, fontWeight: '600', marginLeft: 5},

  table: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-evenly',
  },
  thead: {alignSelf: 'center', fontWeight: 'bold', color: COLORS.secondary},
  tbody: {flex: 1, backgroundColor: COLORS.white},

  absoluteBottom: {
    position: 'absolute',
    bottom: 15,
    left: 16,
    right: 16,
  },
});

export default globalStyles;
