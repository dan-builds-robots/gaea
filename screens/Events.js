import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView from "react-native-maps";
import SearchBar from "../SearchBar";
import * as Location from "expo-location";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserRegion } from "../routesSlice";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const Events = ({ route, navigation }) => {
  [clicked, setClicked] = useState(false);
  [searchPhrase, setSearchPhrase] = useState(false);
  const [region, setRegion] = useState({});
  const [actualRegion, setActualRegion] = useState({});
  const [animating, setAnimating] = useState(false);
  var _mapView;
  const GOOGLE_API_KEY = "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU";
  const dispatch = useDispatch();

  const fetchedUserRegion = useSelector(
    (state) => state.routes.userRegionStatus
  );
  const userRegion = useSelector((state) => state.routes.userRegion);

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
      }
    })();
  }, []);

  // just loaded user location, go there
  useEffect(() => {
    if (fetchedUserRegion == "succeeded") {
    }
  }, [fetchedUserRegion]);

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
      <FlatList />
      {/* see routes button */}
      {/* <TouchableOpacity
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
      </TouchableOpacity> */}
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

export default Events;
