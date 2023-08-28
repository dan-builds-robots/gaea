import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {TouchableOpacity} from "react-native";
import UserRoutes from "./screens/UserRoutes";
import RouteMap from "./screens/RouteMap";
import {FontAwesome} from "@expo/vector-icons";
import SearchLocation from "./screens/SearchLocation";
import {Provider, connect} from "react-redux";
import {addRoute} from "./routesSlice";
import {store} from "./store.js";

export default function App() {
  const Stack = createNativeStackNavigator();

  const HeaderBtn = connect((state) => ({routes_: state.routes}))(
    ({routes_, dispatch, navigation}) => {
      return (
        <TouchableOpacity
          onPress={() => {
            // add route to storage
            dispatch(addRoute());
            navigation.navigate("RouteMap", {
              route_: {
                name: "",
                locations: [
                  {
                    dummyLocation: true,
                    coords: {latitude: 0, longitude: 0},
                    // key: -1,
                  },
                ],
                midpointLatitude: 0,
                midpointLongitude: 0,
              },
              index: 0,
            });
          }}
        >
          <FontAwesome name="pencil-square-o" size={22} color="blue" />
        </TouchableOpacity>
      );
    }
  );

  return (
    <Provider store={store}>
      <NavigationContainer onReady={() => {}}>
        <Stack.Navigator screenOptions={{animation: "none"}}>
          {/* routes screen */}
          <Stack.Screen
            name="Routes"
            component={UserRoutes}
            options={({navigation}) => ({
              headerRight: () => <HeaderBtn navigation={navigation} />,
            })}
          />

          {/* viewing route on map */}
          <Stack.Screen
            name="RouteMap"
            component={RouteMap}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="Search Locations"
            component={SearchLocation}
            options={{title: ""}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
