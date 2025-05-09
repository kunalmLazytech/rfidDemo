import { StyleSheet } from 'react-native';
import COLORS from '@assets/Components/Colors';

export default StyleSheet.create({
    container: {
        paddingTop: 0,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: COLORS.primary,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#e0e0e0',
    },
    card: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    cardHeader: {
        paddingVertical: 8,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    rowItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginHorizontal: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        width: '30%',
        backgroundColor: COLORS.danger,
        borderColor: COLORS.danger,
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
