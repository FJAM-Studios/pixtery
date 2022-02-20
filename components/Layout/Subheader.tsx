import { Ionicons } from "@expo/vector-icons";
import { Header, HeaderBackButton } from "@react-navigation/elements";
import { ParamListBase } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button } from "react-native-paper";
import { useSelector } from "react-redux";

import { RootState, LibraryContainerParamsList } from "../../types";
import { goToScreen } from "../../util";

export default function Subheader({
  navigation,
  title,
  enableBack,
  specificDestination,
}: {
  navigation: NativeStackNavigationProp<ParamListBase, string>;
  title: string;
  enableBack: boolean;
  specificDestination?: keyof LibraryContainerParamsList;
}): JSX.Element {
  const theme = useSelector((state: RootState) => state.theme);
  const onPress = () => {
    if (specificDestination) goToScreen(navigation, specificDestination);
    else navigation.goBack();
  };
  return (
    <Header
      title={title}
      headerLeft={() =>
        enableBack ? (
          <HeaderBackButton
            onPress={onPress}
            backImage={() => <Ionicons size={30} name="chevron-back" />}
          />
        ) : null
      }
      headerTitle={() => (
        <Button
          mode="contained"
          style={{
            shadowColor: theme.colors.primary,
            width: 200,
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          {title}
        </Button>
      )}
      headerStyle={{ height: 40, backgroundColor: theme.colors.primary }}
    />
  );
}
