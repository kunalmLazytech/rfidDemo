// style.ts
import { StyleSheet } from 'react-native';
import COLORS from '@assets/Components/Colors';

const styles = StyleSheet.create({
    container: {
        paddingTop: 0
    },
    cardContainer: {
        paddingHorizontal: 15,
        flex: 1,
    },
    contentContainer: {
        paddingVertical: 10,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    iconText: {
        marginHorizontal: 10,
        fontSize: 14,
    },
    addButton: {
        marginLeft: 10,
    },
});

export default styles;
