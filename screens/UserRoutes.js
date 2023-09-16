import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeableItem, {
  useSwipeableItemParams,
} from "react-native-swipeable-item";
import { useCallback } from "react";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { deleteRoute, removeEmptyRoutes, fetchRoutes } from "../routesSlice";
import { useFocusEffect } from "@react-navigation/native";

const Route = ({ item: { name, locations }, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[{ backgroundColor: "white", padding: 20 }]}
    // prevent flicker when swiping
    delayPressIn={80}
  >
    <Text
      style={[
        styles.title,
        {
          color: name !== "" ? "black" : "gray",
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 4,
        },
      ]}
      numberOfLines={1}
    >
      {name !== "" ? name : "Untitled Route"}
    </Text>

    <View style={{ flexDirection: "row", flex: 1 }}>
      {locations.length > 1 && (
        <Text
          style={{
            color: "gray",
            fontSize: 14,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {locations
            .filter((location) => location.name != "dummyLocation")
            .map((location) => {
              return location.name;
            })
            .join(" → ")}
        </Text>
      )}
      {locations.length == 1 && (
        <>
          <Text style={{ color: "gray", fontSize: 14, flexWrap: "wrap" }}>
            No Added Locations
          </Text>
        </>
      )}
    </View>
  </TouchableOpacity>
);

const UserRoutes = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const routes = useSelector((state) => state.routes.routes);
  const fetchedRoutes = useSelector((state) => state.routes.status);
  const closeFunctions = new Array(routes.length);
  useEffect(() => {
    // console.log(
    //   `fetched routes: ${fetchedRoutes}; routes:${JSON.stringify(routes)}`
    // );
    if (fetchedRoutes == "idle") {
      dispatch(fetchRoutes());
    }
    // (async () => {
    //   let { status } = await Location.requestForegroundPermissionsAsync();
    //   if (status !== "granted") {
    //     alert("Permission to access location was denied");
    //     return;
    //   }
    //   let location = await Location.getCurrentPositionAsync({});
    //   setUserRegion({
    //     latitude: location.coords.latitude,
    //     longitude: location.coords.longitude,
    //     latitudeDelta: 0.008,
    //     longitudeDelta: 0.008,
    //   });
    // })();
  }, [fetchedRoutes]);

  useFocusEffect(
    useCallback(() => {
      if (fetchedRoutes == "succeeded") {
        // set state to initial value
        dispatch(removeEmptyRoutes());
      }
    }, [routes.length])
  );

  const renderItem = useCallback(({ item: route, index }) => {
    return (
      <View key={route.name + JSON.stringify(route.locations)}>
        <SwipeableItem
          ref={(ref) => (closeFunctions[index] = ref)}
          key={route.name + JSON.stringify(route.locations)}
          item={route}
          renderUnderlayLeft={() => <UnderlayLeft index={index} />}
          snapPointsLeft={[180]}
        >
          <Route
            item={route}
            onPress={() => {
              navigation.navigate("RouteMap", {
                route_: route,
                index: index,
              });
            }}
          />
        </SwipeableItem>
      </View>
    );
  });

  const UnderlayLeft = ({ index }) => {
    const { close } = useSwipeableItemParams();
    // console.log("again");
    // setCloseFunctions(closeFunctions.concat([close]));
    // useEffect(() => {
    //   setClose(close);
    //   // console.log("again");
    //   // setCloseFunctions(closeFunctions.concat([close]));
    // });
    return (
      <View style={[styles.row, styles.underlayLeft]}>
        <TouchableOpacity
          onPress={() => {
            // dispatch(deleteRoute({ index: index }));
            url = `https://www.google.com/maps/dir/`;
            routes[index].locations
              .filter((location) => location.name != "dummyLocation")
              .forEach((location) => {
                url = url + location.address + "/";
              });
            Linking.openURL(url);
            close();
          }}
          style={{
            width: 90,
            backgroundColor: "dodgerblue",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="google-maps" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            dispatch(deleteRoute({ index: index }));
            close();
          }}
          style={{
            width: 90,
            backgroundColor: "tomato",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather name="trash" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      style={{ flex: 1 }}
      // onPress={() => close()}
      accessible={false}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <GestureHandlerRootView>
          <FlatList
            data={routes}
            bounces={false}
            overScrollMode="never"
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item.name + JSON.stringify(item.locations)
            }
            ItemSeparatorComponent={
              <View
                style={{
                  // borderBottomColor: 'red',
                  height: 0.6,
                  backgroundColor: "gray",
                  marginVertical: -0.3,
                }}
                key={"asdf"}
              />
            }
            // contentContainerStyle={{backgroundColor: "gray"}}
            activationDistance={1}
          />
        </GestureHandlerRootView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  map: {
    flex: 1,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    // padding: 15,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 32,
  },
  underlayLeft: {
    flex: 1,
    backgroundColor: "dodgerblue",
    justifyContent: "flex-end",
  },
});

export default UserRoutes;
