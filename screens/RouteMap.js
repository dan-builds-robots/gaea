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
import {
  changeRouteName,
  updateRouteLocations,
  deleteRouteLocation,
} from "../routesSlice";
import { useSelector, useDispatch } from "react-redux";

const RouteMap = ({
  route: {
    params: { route_, index },
  },
  navigation,
}) => {
  const routes = useSelector((state) => state.routes);
  const dispatch = useDispatch();
  [searchPhrase, setSearchPhrase] = useState(false);
  const [userRegion, setUserRegion] = useState({});
  const [actualRegion, setActualRegion] = useState({});
  const [animating, setAnimating] = useState(false);
  let _mapView;
  const GOOGLE_API_KEY = "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU";

  useEffect(() => {
    console.log("Going to route location")
    goToRouteLocation(_mapView);

    // const unsubscribe = navigation.addListener("focus", () => {
    //   console.log("Does this get called?");
    //   goToRouteLocation(_mapView);
    // });
    // return unsubscribe;
  }, [
    routes["routes"][index].midpointLatitude,
    routes["routes"][index].midpointLongitude,
  ]);

  const getInitialRegion = () => {
    if (
      routes["routes"][index].midpointLatitude == 0 &&
      routes["routes"][index].midpointLongitude == 0
    ) {
      return userRegion;
    } else {
      return {
        latitude: routes["routes"][index].midpointLatitude,
        longitude: routes["routes"][index].midpointLongitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
  };

  const goToRouteLocation = async (mapView) => {
    setAnimating(true);
    if (
      routes["routes"][index].midpointLatitude == 0 &&
      routes["routes"][index].midpointLongitude == 0
    ) {
      mapView.animateToRegion(userRegion, 1000);
      setActualRegion(userRegion);
    } else {
      const region = {
        latitude: routes["routes"][index].midpointLatitude,
        longitude: routes["routes"][index].midpointLongitude,
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
    // JSON.stringify(actualRegion) !== JSON.stringify(getInitialRegion());
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
          <View style={{ flexDirection: "row", alignItems: "stretch" }}>
            <TouchableOpacity
              onLongPress={drag}
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
                style={{ justifyContent: "center", width: "100%" }}
              >
                <Text
                  placeholder="Add Destination"
                  style={{
                    width: "100%",
                    color: "gray",
                    alignSelf: "center",
                  }}
                >
                  Add Destination
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ alignSelf: "center" }}>{name}</Text>
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
                  'Are you sure you want to remove "' +
                    name +
                    " at index " +
                    getIndex() +
                    '" from this route?',
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
  useFocusEffect(
    useCallback(() => {
      // set state to initial value
      Location.getCurrentPositionAsync({}).then((location) =>
        setUserRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        })
      );
    }, [])
  );

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
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
        {routes["routes"][index].locations.map(
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
        {routes["routes"][index].locations
          .slice(
            0,
            routes["routes"][index].locations[
              routes["routes"][index].locations.length - 1
            ].dummyLocation
              ? routes["routes"][index].locations.length - 2
              : routes["routes"][index].locations.length - 1
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
                    !routes["routes"][index].locations[locationIndex + 1]
                      .dummyLocation
                      ? routes["routes"][index].locations[locationIndex + 1]
                          .coords
                      : routes["routes"][index].locations[locationIndex + 2]
                          .coords
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
            //   backgroundColor: "red",
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

      <KeyboardAvoidingView behavior="position">
        <View style={[styles.routeView, styles.searchShadow]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <TextInput
              style={[styles.routeName, { flexGrow: 1 }]}
              placeholder="Enter Route Name"
              onChangeText={(newRouteName) => {
                console.log(
                  "changing route name. index: " +
                    index +
                    "; routes:" +
                    JSON.stringify(routes)
                );
                dispatch(
                  changeRouteName({ index: index, newRouteName: newRouteName })
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
              style={{ marginBottom: 10, maxHeight: 185 }}
              data={routes["routes"][index].locations}
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
              // ListFooterComponent={() => {
              //   return (
              //     <View style={{ backgroundColor: "red", padding: 10 }}></View>
              //   );
              // }}
            ></DraggableFlatList>
          </GestureHandlerRootView>
        </View>
      </KeyboardAvoidingView>
    </DismissKeyboardView>
  );
};
const styles = StyleSheet.create({
  map: {
    flex: 1,
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
    height: 270,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    padding: 24,
  },
  routeName: {
    fontSize: 16,
    fontWeight: "700",
    paddingRight: 10,
  },
});

export default RouteMap;
