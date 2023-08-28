import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import Map from "./screens/Map";
import UserRoutes from "./screens/UserRoutes";
import RouteMap from "./screens/RouteMap";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchLocation from "./screens/SearchLocation";
import { Provider, connect } from "react-redux";
import { addRoute } from "./routesSlice";
import { store } from "./store.js";

export default function App() {
  const Stack = createNativeStackNavigator();

  const ButtonContainer = connect((state) => ({ routes_: state.routes }))(
    ({ routes_, dispatch, navigation }) => {
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
  return (
    <Provider store={store}>
      <NavigationContainer
        onReady={() => {
          console.log("Navigation container is ready");
          AsyncStorage.getItem("routes").then((routes) => {
            console.log("Just opened app; routes:" + routes);
          });
        }}
      >
        <Stack.Navigator screenOptions={{ animation: "none" }}>
          {/* home screen */}
          <Stack.Screen
            name="Map"
            component={Map}
            options={{ headerShown: false }}
          />

          {/* routes screen */}
          <Stack.Screen
            name="Routes"
            component={UserRoutes}
            options={({ navigation }) => ({
              headerRight: () => <ButtonContainer navigation={navigation} />,
            })}
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
            options={{ title: "" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

// export function App() {
//   const Stack = createNativeStackNavigator();
//   const [routes, setRoutes] = useState(-1);
//   const [test, setTest] = useState();
//   const [changed, setChanged] = useState(false);

//   const routes2 = useSelector((state) => state.routes);
//   const dispatch = useDispatch();

//   const setRoutes_ = async (routes_) => {
//     console.log("setting routes: " + JSON.stringify(routes_));
//     AsyncStorage.setItem("routes", JSON.stringify(routes_)).then(() => {
//       // setRoutes([...routes_]);
//       // setTest(routes_);
//       console.log("just set routes: " + JSON.stringify(routes));
//       setChanged(!changed);
//     });
//   };

//   useEffect(() => {
//     if (routes !== -1) {
//     } else {
//       AsyncStorage.getItem("routes").then((routes_) => {
//         if (routes_ !== null) {
//           // setRoutes(JSON.parse(routes_));
//           console.log("This shouldn't really get run.");
//           console.log(routes_);
//         } else {
//           console.log(routes_);
//           AsyncStorage.setItem("routes", JSON.stringify([])).then(() => {
//             // setRoutes([]);
//             console.log("This should get run once.");
//           });
//         }
//       });

//       DeviceEventEmitter.addListener("setRoutes", (routes) => {
//         console.log("This is what you just passed: " + JSON.stringify(routes));
//         setRoutes_(routes);
//       });
//     }
//     console.log("asd");
//   }, []);

//   return (
//     <NavigationContainer
//       onReady={() => {
//         console.log("Navigation container is ready");
//         AsyncStorage.getItem("routes").then((routes) => {
//           console.log("Just opened app; routes:" + routes);
//         });
//         AsyncStorage.clear();
//       }}
//     >
//       <Stack.Navigator screenOptions={{ animation: "none" }}>
//         {/* home screen */}
//         <Stack.Screen
//           name="Map"
//           component={Map}
//           options={{ headerShown: false }}
//         />

//         {/* routes screen */}
//         <Stack.Screen
//           name="Routes"
//           component={UserRoutes}
//           initialParams={{ changed: changed, routes: routes }}
//           options={({ navigation }) => ({
//             headerRight: () => (
//               <TouchableOpacity
//                 onPress={() => {
//                   newRoute = {
//                     name: "",
//                     locations: [
//                       {
//                         dummyLocation: true,
//                         coords: { latitude: 0, longitude: 0 },
//                         key: -1,
//                       },
//                     ],
//                     midpointLatitude: 0,
//                     midpointLongitude: 0,
//                   };
//                   // add route to storage

//                   setRoutes_([newRoute].concat(routes));
//                   console.log(
//                     "Just added a new route to list. New route: " +
//                       JSON.stringify(newRoute) +
//                       "; list: " +
//                       JSON.stringify(routes)
//                   );
//                   navigation.navigate("RouteMap", {
//                     route_: newRoute,
//                     index: 0,
//                   });
//                 }}
//               >
//                 <FontAwesome name="pencil-square-o" size={22} color="blue" />
//               </TouchableOpacity>
//             ),
//           })}
//         />

//         {/* viewing route on map */}
//         <Stack.Screen
//           name="RouteMap"
//           component={RouteMap}
//           initialParams={{ changed: changed, routes: routes }}
//           options={{ headerShown: false }}
//         />

//         <Stack.Screen
//           name="Search Locations"
//           component={SearchLocation}
//           options={{ title: "" }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
