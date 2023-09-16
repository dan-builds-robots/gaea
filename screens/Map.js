import { useState, useEffect, createRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import MapView, {
  Callout,
  CalloutSubview,
  PROVIDER_GOOGLE,
  Marker,
} from "react-native-maps";
import SearchBar from "../SearchBar";
import * as Location from "expo-location";
import { useSelector, useDispatch } from "react-redux";
import { Entypo, Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  fetchUserRegion,
  bookmarkLocation,
  unbookmarkLocation,
  fetchBookmarks,
} from "../routesSlice";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Linking } from "react-native";
import SlidingUpPanel from "rn-sliding-up-panel";

const Map = ({ route, navigation }) => {
  [clickedLocation, setClickedLocation] = useState(false);
  [searchPhrase, setSearchPhrase] = useState(false);
  const [region, setRegion] = useState({});
  const [actualRegion, setActualRegion] = useState({});
  const [animating, setAnimating] = useState(false);
  const [coordOfClick, setCoordOfClick] = useState(false);
  const [locationData, setLocationData] = useState(false);
  const [canCallNumber, setCanCallNumber] = useState(false);
  let _mapView = createRef();
  let textInput;
  const GOOGLE_API_KEY = "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU";
  const dispatch = useDispatch();
  const bookmarkedLocations = useSelector(
    (state) => state.routes.bookmarkedLocations
  );
  const fetchedBookmarks = useSelector((state) => state.routes.bookmarksStatus);

  const fetchedUserRegion = useSelector(
    (state) => state.routes.userRegionStatus
  );
  const userRegion = useSelector((state) => state.routes.userRegion);
  let panel;

  useEffect(() => {
    (async () => {
      let { status: locationGranted } =
        await Location.requestForegroundPermissionsAsync();
      if (locationGranted !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      if (fetchedUserRegion == "idle") {
        dispatch(fetchUserRegion());
      } else if (fetchedUserRegion == "succeeded" && _mapView) {
        goToRouteLocation(_mapView);
      }
    })();
  }, []);

  useEffect(() => {
    if (fetchedBookmarks == "idle") {
      dispatch(fetchBookmarks);
    }
  }, fetchedBookmarks);

  // just loaded user location, go there
  useEffect(() => {
    if (fetchedUserRegion == "succeeded") {
      goToRouteLocation(_mapView);
    }
  }, [fetchedUserRegion]);

  const goToRouteLocation = async (mapView) => {
    setAnimating(true);
    mapView.animateToRegion(userRegion, 1000);
    setActualRegion(userRegion);
    setTimeout(() => setAnimating(false), 1000);
  };

  const regionsDiffer = (region1, region2) => {
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

  function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;

    var dLat = degreesToRadians(lat2 - lat1);
    var dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  return (
    <>
      <MapView
        ref={(mapView) => {
          if (mapView !== null) {
            _mapView = mapView;
          }
        }}
        style={styles.map}
        region={region}
        onRegionChange={(region) => {
          setActualRegion(region);
        }}
        showsUserLocation={true}
        onPress={(e) => {
          const clickedCoords = e.nativeEvent.coordinate;
          setCoordOfClick(clickedCoords);
          _mapView.animateToRegion(
            {
              latitude: clickedCoords.latitude,
              longitude: clickedCoords.longitude,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            },
            800
          );

          // goToRouteLocation(_mapView);

          setTimeout(() => {
            const { latitude: lat, longitude: lng } = clickedCoords;

            // get the place id
            fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&result_type=political|premise|subpremise|natural_feature|airport|park|point_of_interest&location_type=ROOFTOP`
            )
              .then((response) => response.json())
              .then((json) => {
                setClickedLocation(json);

                // alert(JSON.stringify(json.results[0].place_id));
                // alert(JSON.stringify(json.results[0].formatted_address));

                // get the corresponding location data
                fetch(
                  // `https://maps.googleapis.com/maps/api/place/details/json?fields=name%2Cformatted_address%2Cformatted_phone_number&place_id=${json.results[0].place_id}&key=${GOOGLE_API_KEY}`

                  `https://maps.googleapis.com/maps/api/place/details/json?placeid=${json.results[0].place_id}&key=${GOOGLE_API_KEY}`
                )
                  .then((response) => response.json())
                  .then((json) => {
                    // alert(Object.keys(json.result));
                    // alert(JSON.stringify(json.result.photos));
                    // console.log(JSON.stringify(json.result.photos));
                    Linking.canOpenURL(
                      `tel:${json.result.formatted_phone_number}`
                    ).then((canCall) => {
                      setCanCallNumber(canCall);
                      setLocationData(json.result);
                      if (panel !== null && panel !== undefined) {
                        panel.show();
                      }
                    });
                  });
              });
          }, 100);
        }}
        showsCompass={true}
        showsBuildings={true}
        showsTraffic={true}
        // provider={PROVIDER_GOOGLE}
      >
        {coordOfClick && clickedLocation && (
          <Marker coordinate={coordOfClick} />
        )}
      </MapView>

      {/* location search bar */}
      <View
        style={[
          {
            position: "absolute",
            top: 50,
            left: 20,
            right: 20,
          },
          styles.searchShadow,
        ]}
      >
        <GooglePlacesAutocomplete
          ref={(input) => {
            textInput = input;
          }}
          placeholder="Search"
          onPress={(data, details) => {
            placeId = data.place_id;
            // current_opening_hours, photos, opening_hours, reviews
            fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${GOOGLE_API_KEY}`
            )
              .then((response) => response.json())
              .then((json) => {
                // alert(JSON.stringify(json));
                // console.log(JSON.stringify(json));
                const { lat, lng } = json.result.geometry.location;
                const clickedCoords = { latitude: lat, longitude: lng };
                setCoordOfClick(clickedCoords);
                setClickedLocation(json);
                setLocationData(json.result);
                Linking.canOpenURL(
                  `tel:${json.result.formatted_phone_number}`
                ).then((canCall) => {
                  setCanCallNumber(canCall);
                  setLocationData(json.result);
                  if (panel !== null && panel !== undefined) {
                    panel.show();
                  }
                });
                _mapView.animateToRegion(
                  {
                    latitude: clickedCoords.latitude,
                    longitude: clickedCoords.longitude,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                  },
                  800
                );
              });
            textInput.clear();
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: "en",
          }}
          textInputProps={
            {
              // autoFocus: true,
              // InputComp: Input,
              // leftIcon: { type: 'font-awesome', name: 'chevron-left' },
              // errorStyle: { color: 'red' },
            }
          }
          enablePoweredByContainer={false}
        />
      </View>

      {/* display location info/data panel */}
      {coordOfClick && clickedLocation && locationData && (
        <KeyboardAvoidingView
          behavior="position"
          style={{
            backgroundColor: "red",
            position: "absolute",
            bottom: 0,
            // height: "auto",
            width: "100%",
          }}
        >
          <SlidingUpPanel
            ref={(c) => {
              if (c !== null) {
                panel = c;
              }
            }}
            draggableRange={{ top: 320, bottom: 80 }}
            snappingPoints={[80, 320]}
            allowDragging={true}
            minimumVelocityThreshold={300}
            minimumDistanceThreshold={50}
          >
            <View style={[styles.routeView, styles.searchShadow]}>
              {/* gray slider */}
              <TouchableOpacity>
                <View
                  style={{
                    alignSelf: "center",
                    width: 50,
                    height: 5,
                    marginTop: 2,
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
                  marginBottom: 4,
                  // width: "100%",
                  // backgroundColor: "blue",
                  flexDirection: "row",
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 16,
                      marginRight: 10,
                      flexGrow: 1,
                    }}
                    numberOfLines={2}
                  >
                    {locationData.name}
                    {/* {JSON.stringify(
                clickedLocation.results[0].formatted_address.split(",")[0]
              )} */}
                    {/* {clickedLocation.results[0]
                ? clickedLocation.results[0].formatted_address.split(",")[0]
                : "asdf"} */}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const params = {
                        placeId: locationData.placeId,
                        locationData: locationData,
                      };
                      if (locationData.placeId in bookmarkedLocations) {
                        dispatch(unbookmarkLocation(params));
                      } else {
                        dispatch(bookmarkLocation(params));
                      }
                    }}
                  >
                    <FontAwesome
                      name={
                        locationData.placeId in bookmarkedLocations
                          ? "bookmark"
                          : "bookmark-o"
                      }
                      size={18}
                      color="gray"
                      style={{ marginLeft: -4 }}
                    />
                  </TouchableOpacity>
                </View>
                <Entypo
                  name="cross"
                  size={20}
                  color="gray"
                  style={{ padding: 1 }}
                  onPress={() => {
                    setCoordOfClick(false);
                    setClickedLocation(false);
                    setLocationData(false);
                    panel.hide();
                  }}
                />
              </View>

              <ScrollView style={{ marginTop: 15 }}>
                {locationData.formatted_address && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Ionicons
                      name="location-sharp"
                      size={19}
                      color="gray"
                      style={{ marginLeft: -3, marginRight: 1 }}
                    />
                    <Text style={{ fontSize: 13 }}>
                      {locationData.formatted_address}
                    </Text>
                  </View>
                )}
                {locationData.formatted_phone_number && (
                  <TouchableOpacity
                    disabled={!canCallNumber}
                    onPress={() =>
                      Linking.openURL(
                        `tel:${locationData.formatted_phone_number}`
                      )
                    }
                    style={{ marginBottom: 6 }}
                  >
                    <Text style={{ fontSize: 13 }}>
                      {locationData.formatted_phone_number}
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={{ marginBottom: 6, fontSize: 13 }}>
                  {distanceInKmBetweenEarthCoordinates(
                    userRegion.latitude,
                    userRegion.longitude,
                    coordOfClick.latitude,
                    coordOfClick.longitude
                  ).toFixed(2)}{" "}
                  km
                </Text>
                {locationData && locationData.photos ? (
                  <ScrollView horizontal={true}>
                    {locationData.photos.map((photo) => (
                      <Image
                        style={{ width: 100, height: 100, marginRight: 10 }}
                        src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View></View>
                )}
                {/* <Text>{JSON.stringify(clickedLocation)}</Text> */}
                {/* <View>{locationData.photos}</View> */}
              </ScrollView>
            </View>
          </SlidingUpPanel>
        </KeyboardAvoidingView>
      )}

      {/* go back to user location */}
      {!animating &&
        regionsDiffer(
          actualRegion,
          coordOfClick ? coordOfClick : userRegion
        ) && (
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 18,
              top: 120,
              borderRadius: 1000,
            }}
            onPress={
              coordOfClick
                ? () =>
                    _mapView.animateToRegion({
                      ...coordOfClick,
                      latitudeDelta: 0.002,
                      longitudeDelta: 0.002,
                    })
                : () => goToRouteLocation(_mapView)
            }
          >
            <Image
              src={
                "https://www.freepnglogos.com/uploads/pin-png/flat-design-map-pin-transparent-png-stickpng-18.png"
              }
              style={{ height: 36, width: 27 }}
            />
          </TouchableOpacity>
        )}
    </>
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
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  routeView: {
    bottom: 0,
    width: "100%",
    height: 320,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 18,
  },
  routeName: {
    fontSize: 20,
    fontWeight: "600",
  },
});

export default Map;
