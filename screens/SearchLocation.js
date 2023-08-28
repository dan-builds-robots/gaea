import { SafeAreaView } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { addRouteLocation } from "../routesSlice";
import { useSelector, useDispatch } from "react-redux";

const SearchLocation = ({
  route: {
    params: { routeIndex },
  },
  navigation,
}) => {
  const dispatch = useDispatch();

  const getCoordinates = (placeId) => {
    // fetch(
    //   "https://maps.googleapis.com/maps/api/place/details/",
    //   // "https://maps.googleapis.com/maps/api/place/details/json?placeid={placeid}&key={key}",
    //   {
    //     method: "GET",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       placeid: placeId,
    //       key: "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU",
    //     }),
    //   }
    // )
    key = "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU";
    fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${key}`
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(
          `Here are the coordinates request: ${JSON.stringify(json)}`
        );
        let result = json.result.geometry.location;
        console.log(`here's the location: ${JSON.stringify(result)}`);
        return result;
      });
  };
  return (
    <SafeAreaView style={{ flex: 1, margin: 24 }}>
      <GooglePlacesAutocomplete
        placeholder="Search"
        onPress={(data, details) => {
          // 'details' is provided when fetchDetails = true
          console.log("name: " + data.structured_formatting.main_text);
          console.log(
            "data: " +
              JSON.stringify(data) +
              ", details: " +
              JSON.stringify(details)
          );
          console.log(
            `here are the coordinates ${JSON.stringify(
              details?.geometry?.location
            )}`
          );
          //   alert("coordinates: " + JSON.stringify(data?.geometry?.location));
          const name = data.structured_formatting.main_text;
          // const location = getCoordinates(data.place_id);
          // const { lat, lng } = getCoordinates(data.place_id);
          // alert(`coordinates. lat: ${lat}; longitude: ${lng}`);

          placeId = data.place_id;
          key = "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU";
          fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${key}`
          )
            .then((response) => response.json())
            .then((json) => {
              console.log(
                `Here are the coordinates request: ${JSON.stringify(json)}`
              );
              let { lat, lng } = json.result.geometry.location;
              // console.log(`here's the location: ${JSON.stringify(result)}`);
              dispatch(
                addRouteLocation({
                  index: routeIndex,
                  newLocation: {
                    name: name,
                    coords: { latitude: lat, longitude: lng },
                    // key: 7,
                  },
                })
              );
              navigation.goBack();
            });
        }}
        query={{
          key: "AIzaSyBh1qntBtOC9rAx1gAXDvSnwYgVgiSc_rU",
          language: "en",
        }}
        textInputProps={{
          autoFocus: true,
          // InputComp: Input,
          // leftIcon: { type: 'font-awesome', name: 'chevron-left' },
          // errorStyle: { color: 'red' },
        }}
        enablePoweredByContainer={false}
      />
    </SafeAreaView>
  );
};

export default SearchLocation;
