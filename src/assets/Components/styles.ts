import { StyleSheet } from 'react-native';
import globalStyles from '@styles/globalStyles';
import COLORS from './Colors';

const styles = StyleSheet.create({
    container: {
        ...globalStyles.rowCenter,
        width: 120,
    },
    progress: {
        flex: 1,
    },
    bar: {
        backgroundColor: '#52c41a',
    },
    text: {
        ...globalStyles.labelMarginLeft12,
    },
    appVersionContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    appVersionText: {
        color: '#888',
    },
    suggestionBox: {
        position: 'absolute',
        top: 42,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        zIndex: 10000000,
        elevation: 5,
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    customInputContainer: {
        marginBottom: 20,
    },
    disabledView: {
        opacity: 0.6,
    },
    statusText: {
        marginLeft: 8,
    },
    connectedText: {
        color: '#52c41a',
    },
    disconnectedText: {
        color: '#ff4d4f',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    quantityContainer: {
        flex: 1,
        marginRight: 12,
    },
    inputContainerFlexReset: {
        flex: 0,
    },
    statusContainer: {
        flex: 1,
    },
    picker: {
        color: '#000',
    },
    cardTextContainer: {
        flex: 1,
    },
    titleText: {
        flexWrap: 'wrap',
        textAlign: 'left',
    },
    primaryText: {
        color: COLORS.primary,
    },
    secondaryText: {
        color: COLORS.secondary,
    },
    cardRowSpacing: {
        marginTop: 8,
    },
    subText: {
        color: '#999',
    },
    progressPercentText: {
    },
    progressBarFill: {
    },
});

export default styles;
