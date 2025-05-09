import React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Text } from "@ant-design/react-native";
import globalStyles from "@styles/globalStyles";
import ConnectionControlsWithBtn2 from "@modules/ConnectionControlsWithBtn2";
import { useNavigation } from "@react-navigation/native";

interface HeaderComponentProps {
    title: string;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
    title,
}) => {
    const navigation = useNavigation();

    const handleBack = () => navigation.goBack();

    return (
        <>
            <View style={globalStyles.header}>
                <Icon
                    style={globalStyles.backButton}
                    onPress={handleBack}
                    name="chevron-left"
                    size={28}
                    color="#fff"
                />
                <Text style={globalStyles.headerLabel}>{title}</Text>
            </View>
        </>
    );
};

export default HeaderComponent;




// future use
// import React from "react";
// import { View, TouchableOpacity } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { Text } from "@ant-design/react-native";
// import globalStyles from "@styles/globalStyles";
// import ConnectionControlsWithBtn2 from "@modules/ConnectionControlsWithBtn2";
// import { useNavigation } from "@react-navigation/native";
// import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

// interface HeaderComponentProps {
//     title: string;
//     showConnectionControls?: boolean;
// }

// const HeaderComponent: React.FC<HeaderComponentProps> = ({
//     title,
//     showConnectionControls = true,
// }) => {
//     const navigation = useNavigation();

//     const handleBack = () => navigation.goBack();

//     return (
//         <>
//             <View style={[globalStyles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
//                 <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     <Icon
//                         style={globalStyles.backButton}
//                         onPress={handleBack}
//                         name="chevron-left"
//                         size={28}
//                         color="#fff"
//                     />
//                     <Text style={globalStyles.headerLabel}>{title}</Text>
//                 </View>

//                 <Menu>
//                     <MenuTrigger>
//                         <Icon name="more-vert" size={26} color="#fff" style={{ padding: 10 }} />
//                     </MenuTrigger>
//                     <MenuOptions>
//                         <MenuOption onSelect={() => alert("Option 1 clicked")} text="Option 1" />
//                         <MenuOption onSelect={() => alert("Option 2 clicked")} text="Option 2" />
//                     </MenuOptions>
//                 </Menu>
//             </View>

//             {showConnectionControls && (
//                 <View style={globalStyles.titleContainer}>
//                     <ConnectionControlsWithBtn2 />
//                 </View>
//             )}
//         </>
//     );
// };

// export default HeaderComponent;

