import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View, Text } from "react-native";
import UserRoutes from "./screens/UserRoutes";
import RouteMap from "./screens/RouteMap";
import Events from "./screens/Events";
import Map from "./screens/Map";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import SearchLocation from "./screens/SearchLocation";
import { Provider, connect } from "react-redux";
import { addRoute } from "./routesSlice";
import { store } from "./store.js";
import "react-native-gesture-handler";

export default function App() {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();

  const HeaderBtn = connect((state) => ({ routes_: state.routes }))(
    ({ routes_, dispatch, navigation }) => {
      return (
        <TouchableOpacity
          style={{ marginRight: 13 }}
          onPress={() => {
            // add route to storage
            dispatch(addRoute());
            navigation.navigate("RouteMap", {
              route_: {
                name: "",
                locations: [
                  {
                    dummyLocation: true,
                    coords: { latitude: 0, longitude: 0 },
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

  const HomeTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          animation: "none",
          headerShown: false,
          // headerMode: "screen",
          tabBarStyle: { backgroundColor: "white" },
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "gray",
          // tabBarStyle: [],
        }}
      >
        {/* viewing map */}
        <Tab.Screen
          name="Map"
          component={Map}
          options={{
            headerShown: false,
            animation: "none",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 20,
                  height: 25,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    width: 4,
                    height: 15,
                    backgroundColor: focused ? "black" : "gray",
                  }}
                />
                <View
                  style={{
                    width: 4,
                    height: 15,
                    marginBottom: 4,
                    backgroundColor: focused ? "black" : "gray",
                  }}
                />
                <View
                  style={{
                    width: 4,
                    height: 15,
                    marginBottom: -4,
                    backgroundColor: focused ? "black" : "gray",
                  }}
                />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Explore"
          component={Events}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 20,
                  height: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  borderRadius: "100%",
                  borderWidth: 1,
                  borderColor: focused ? "black" : "gray",
                }}
              >
                <View style={{ transform: [{ rotate: "45deg" }] }}>
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 3,
                      borderRightWidth: 3,
                      borderBottomWidth: 7,
                      borderColor: "transparent",
                      borderBottomColor: focused ? "black" : "gray",
                    }}
                  />
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 3,
                      borderRightWidth: 3,
                      borderTopWidth: 7,
                      borderColor: "transparent",
                      borderTopColor: focused ? "black" : "gray",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      width: 2,
                      height: 2,
                      backgroundColor: "white",
                      top: "50%",
                      left: "50%",
                      borderRadius: "100%",
                      transform: [{ translateX: -0.8 }, { translateY: -3 }],
                    }}
                  />
                </View>
              </View>
            ),
          }}
        />

        {/* routes screen */}
        <Tab.Screen
          name="Routes"
          component={UserRoutes}
          options={({ navigation }) => ({
            headerShown: true,
            animation: "none",
            headerRight: () => <HeaderBtn navigation={navigation} />,
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="bookmark"
                size={18}
                color={focused ? "black" : "gray"}
              />
              // <View
              //   style={{
              //     width: 20,
              //     height: 20,
              //     borderColor: focused ? "black" : "gray",
              //     // borderRadius: "100%",
              //     borderWidth: 1,
              //   }}
              // />
            ),
          })}
        />
      </Tab.Navigator>
    );
  };

  return (
    <Provider store={store}>
      <NavigationContainer onReady={() => {}}>
        <Stack.Navigator
          screenOptions={{
            animation: "none",
            // headerMode: "screen",
            animationEnabled: false,
          }}
        >
          {/* routes screen */}
          <Stack.Screen
            name="RoutesNavigation"
            component={HomeTabs}
            options={({ navigation, route }) =>
              getFocusedRouteNameFromRoute(route) == "Routes"
                ? {
                    title: "Routes",
                    headerShown: false,
                    headerRight: () => <HeaderBtn navigation={navigation} />,
                    animation: "none",
                  }
                : {
                    headerShown: false,
                    animation: "none",
                  }
            }
          />

          {/* viewing route on map */}
          <Stack.Screen
            name="RouteMap"
            component={RouteMap}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Search Locations"
            component={SearchLocation}
            options={{ title: "", headerBackTitle: "" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
