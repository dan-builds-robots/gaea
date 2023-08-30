import { useState, useEffect } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import MapView from "react-native-maps";
import SearchBar from "../SearchBar";
import * as Location from "expo-location";
import { useSelector, useDispatch } from "react-redux";
import { fetchRoutes } from "../routesSlice";

const Map = ({ route, navigation }) => {
  [clicked, setClicked] = useState(false);
  [searchPhrase, setSearchPhrase] = useState(false);
  const [userRegion, setUserRegion] = useState({});
  const [region, setRegion] = useState({});
  var _mapView;
  const GOOGLE_API_KEY = "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU";
  const dispatch = useDispatch();

  const fetchedRoutes = useSelector((state) => state.routes.status);

  useEffect(() => {
    console.log(`fetched routes: ${fetchedRoutes}`);
    if (fetchedRoutes == "idle") {
      dispatch(fetchRoutes());
    }
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    })();
  }, [fetchedRoutes]);

  const goToUserLocation = async (mapView) => {
    mapView.animateToRegion(userRegion, 1000);
    let location = await Location.getCurrentPositionAsync({});
    setUserRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    });
  };

  return (
    <>
      <MapView
        ref={(mapView) => {
          _mapView = mapView;
        }}
        style={styles.map}
        region={region}
        // onRegionChange={onRegionChange}
        showsUserLocation={true}
      ></MapView>

      {/* Searchbar */}
      <View
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          right: 20,
        }}
      >
        <SearchBar
          clicked={clicked}
          setClicked={setClicked}
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
        />
      </View>

      {/* see routes button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 30,
          bottom: 30,
          borderRadius: 1000,
        }}
        onPress={() => navigation.navigate("Routes")}
      >
        <Image
          // source={require("./assets/route.png")}
          src={"https://cdn-icons-png.flaticon.com/512/4974/4974651.png"}
          style={{ height: 40, width: 40 }}
        />
      </TouchableOpacity>

      {/* go back to user location */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 30,
          top: 120,
          //   backgroundColor: "red",
          borderRadius: 1000,
        }}
        onPress={() => goToUserLocation(_mapView)}
      >
        <Image
          src={
            "https://www.freepnglogos.com/uploads/pin-png/flat-design-map-pin-transparent-png-stickpng-18.png"
          }
          style={{ height: 40, width: 29 }}
        />
      </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: "600",
  },
});

export default Map;
