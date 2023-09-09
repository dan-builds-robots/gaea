import { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  Vibration,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { useFocusEffect } from "@react-navigation/native";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DismissKeyboardView from "../DismissKeyboardView";
import SlidingUpPanel from "rn-sliding-up-panel";
import {
  changeRouteName,
  updateRouteLocations,
  deleteRouteLocation,
  fetchUserRegion,
} from "../routesSlice";
import { useSelector, useDispatch } from "react-redux";

const RouteMap = ({
  route: {
    params: { route_, index },
  },
  navigation,
}) => {
  const dispatch = useDispatch();
  const routes = useSelector((state) => state.routes.routes);
  const fetchedUserRegion = useSelector(
    (state) => state.routes.userRegionStatus
  );
  const userRegion = useSelector((state) => state.routes.userRegion);
  [searchPhrase, setSearchPhrase] = useState(false);
  const [actualRegion, setActualRegion] = useState({});
  const [animating, setAnimating] = useState(false);
  const [dragging, setDragging] = useState(false);
  let _mapView;
  let panel;
  const GOOGLE_API_KEY = "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU";

  // initial mount
  useEffect(() => {
    panel.show();
    (async () => {
      let { status: locationGranted } =
        await Location.requestForegroundPermissionsAsync();
      if (locationGranted !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      if (fetchedUserRegion == "idle") {
        dispatch(fetchUserRegion());
      }
    })();
  }, []);

  // route midpoint has changed
  useEffect(
    () => {
      // go to new route midpoint
      goToRouteLocation(_mapView);
    },
    routes.length > 0
      ? [routes[index].midpointLatitude, routes[index].midpointLongitude]
      : [0, 0]
  );

  // just fetched the user location; go if there are no
  // locations on the route
  useEffect(() => {
    if (fetchedUserRegion == "succeeded") {
      goToRouteLocation(_mapView);
    }
  }, [fetchedUserRegion]);

  const getInitialRegion = () => {
    if (
      routes[index].midpointLatitude == 0 &&
      routes[index].midpointLongitude == 0
    ) {
      return userRegion;
    } else {
      return {
        latitude: routes[index].midpointLatitude,
        longitude: routes[index].midpointLongitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
  };

  const goToRouteLocation = async (mapView) => {
    setAnimating(true);
    if (
      routes[index].midpointLatitude == 0 &&
      routes[index].midpointLongitude == 0
    ) {
      mapView.animateToRegion(userRegion, 1000);
      setActualRegion(userRegion);
    } else {
      const region = {
        latitude: routes[index].midpointLatitude,
        longitude: routes[index].midpointLongitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapView.animateToRegion(region, 1000);
      setActualRegion(region);
    }
    setTimeout(() => setAnimating(false), 1000);
  };

  const regionsDiffer = (region1, region2) => {
    // console.log(
    //   `Where you currently are: ${JSON.stringify(
    //     region1
    //   )}; where you need to be: ${JSON.stringify(region2)}`
    // );
    if (
      Math.abs(region1.latitudeDelta - region2.latitudeDelta) > 0.02 ||
      Math.abs(region1.longitudeDelta - region2.longitudeDelta) > 0.02
    ) {
      return true;
    }

    if (
      Math.abs(region1.latitude - region2.latitude) > 0.0001 ||
      Math.abs(region2.longitude - region2.longitude) > 0.0001
    ) {
      return true;
    }
    return false;
  };

  const renderItem = ({
    item: { name, coords, dummyLocation },
    drag,
    isActive,
    getIndex,
  }) => {
    return (
      <ScaleDecorator key={name + JSON.stringify(coords) + dummyLocation}>
        <View
          style={[
            {
              backgroundColor: "lightgray",
              paddingRight: 6,
              margin: 1,
              borderRadius: 3,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "stretch",
              height: 35,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "stretch",
            }}
          >
            <TouchableOpacity
              onLongPress={() => {
                // if (Platform.OS === "ios") {
                //   // this logic works in android too. you could omit the else statement
                //   const interval = setInterval(() => Vibration.vibrate(), 1000);
                //   // it will vibrate for 5 seconds
                //   setTimeout(() => clearInterval(interval), 2000);
                // } else {
                //   Vibration.vibrate(5000);
                // }
                drag();
                setDragging(true);
              }}
              onPressOut={() => setDragging(false)}
              delayLongPress={300}
              activeOpacity={1}
              style={{
                paddingHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name="bars" size={15} color="gray" />
            </TouchableOpacity>
            {dummyLocation ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Search Locations", { routeIndex: index })
                }
                style={{
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Text
                  placeholder="Add Destination"
                  style={{
                    color: "gray",
                  }}
                  numberOfLines={1}
                >
                  Add Destination
                </Text>
              </TouchableOpacity>
            ) : (
              <Text
                style={{
                  alignSelf: "center",
                }}
                numberOfLines={1}
              >
                {name}
              </Text>
            )}
          </View>
          {!dummyLocation && (
            <Entypo
              name="cross"
              size={20}
              color="gray"
              style={{
                alignSelf: "center",
              }}
              onPress={() => {
                Alert.alert(
                  "Remove From Route",
                  `Are you sure you want to remove ${name} from this route?`,
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Pressed"),
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        console.log("storing new routes: " + routes);
                        dispatch(
                          deleteRouteLocation({
                            routeIndex: index,
                            locationIndex: getIndex(),
                          })
                        );
                        // goToRouteLocation(_mapView);
                      },
                    },
                  ]
                );
              }}
            />
          )}
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <DismissKeyboardView style={{ flex: 1, backgroundColor: "blue" }}>
      <MapView
        ref={(mapView) => {
          _mapView = mapView;
        }}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        onRegionChange={(region) => {
          setActualRegion(region);
        }}
        // legalLabelInset={}
      >
        {/* put the markers on the map */}
        {routes[index].locations.map(
          ({ coords: { latitude, longitude }, dummyLocation }) =>
            !dummyLocation && (
              <Marker
                coordinate={{
                  latitude: latitude,
                  longitude: longitude,
                }}
              />
            )
        )}

        {/* draw the route lines between the markers */}
        {routes[index].locations
          .slice(
            0,
            routes[index].locations[routes[index].locations.length - 1]
              .dummyLocation
              ? routes[index].locations.length - 2
              : routes[index].locations.length - 1
          )
          .map(
            (
              { coords: { latitude, longitude }, dummyLocation },
              locationIndex
            ) =>
              !dummyLocation && (
                <MapViewDirections
                  // origin={coords}
                  origin={{ latitude: latitude, longitude: longitude }}
                  destination={
                    !routes[index].locations[locationIndex + 1].dummyLocation
                      ? routes[index].locations[locationIndex + 1].coords
                      : routes[index].locations[locationIndex + 2].coords
                  }
                  apikey={GOOGLE_API_KEY}
                  strokeWidth={4}
                  strokeColor="#00a2ff"
                />
              )
          )}
      </MapView>

      {/* go back to user location */}
      {!animating && regionsDiffer(actualRegion, getInitialRegion()) && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 30,
            top: 60,
            borderRadius: 1000,
          }}
          onPress={() => {
            goToRouteLocation(_mapView);
          }}
        >
          <Image
            src={
              "https://www.freepnglogos.com/uploads/pin-png/flat-design-map-pin-transparent-png-stickpng-18.png"
            }
            style={{ height: 40, width: 29 }}
          />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        behavior="position"
        style={{
          backgroundColor: "red",
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
      >
        <SlidingUpPanel
          ref={(c) => {
            panel = c;
          }}
          draggableRange={{ top: 280, bottom: 80 }}
          snappingPoints={[80, 280]}
          allowDragging={!dragging}
          minimumVelocityThreshold={300}
          minimumDistanceThreshold={50}
        >
          <View style={[styles.routeView, styles.searchShadow]}>
            {/* gray slider */}
            <TouchableOpacity>
              <View
                style={{
                  alignSelf: "center",
                  width: 60,
                  height: 5,
                  borderRadius: "100%",
                  backgroundColor: "lightgray",
                  marginBottom: 20,
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <TextInput
                style={[styles.routeName, { flexGrow: 1, flex: 1 }]}
                placeholder="Enter Route Name"
                onChangeText={(newRouteName) => {
                  console.log(
                    "changing route name. index: " +
                      index +
                      "; routes:" +
                      JSON.stringify(routes)
                  );
                  dispatch(
                    changeRouteName({
                      index: index,
                      newRouteName: newRouteName,
                    })
                  );
                }}
              >
                {route_.name}
              </TextInput>

              <Entypo
                name="cross"
                size={20}
                color="gray"
                style={{ padding: 1 }}
                onPress={() =>
                  navigation.navigate("Routes", {
                    routes: routes,
                  })
                }
              />
            </View>
            <GestureHandlerRootView>
              <DraggableFlatList
                style={{ marginBottom: 10, maxHeight: 170 }}
                data={routes[index].locations}
                renderItem={renderItem}
                overScrollMode="never"
                onDragEnd={({ data: routeLocations }) => {
                  dispatch(
                    updateRouteLocations({
                      index: index,
                      newLocations: routeLocations,
                    })
                  );
                  // goToRouteLocation(_mapView);
                }}
                bounces={false}
                keyExtractor={(item, index) => item.name}
                onMoveEnd={({ data }) => {
                  this.setState({ scrollEnabled: true, data });
                }}
              />
            </GestureHandlerRootView>
          </View>
        </SlidingUpPanel>
      </KeyboardAvoidingView>
    </DismissKeyboardView>
  );
};
const styles = StyleSheet.create({
  map: {
    // flex: 1,
    flexGrow: 1,
  },
  searchShadow: {
    shadowOffset: {
      width: 1,
      height: -1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  routeView: {
    bottom: 0,
    width: "100%",
    height: 280,
    // height: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // position: "absolute",
    padding: 24,
    paddingTop: 16,
  },
  routeName: {
    fontSize: 16,
    fontWeight: "700",
    paddingRight: 10,
  },
});

export default RouteMap;
