import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import SwipeableItem, {
  useSwipeableItemParams,
} from "react-native-swipeable-item";
import {useCallback} from "react";
import {Feather} from "@expo/vector-icons";
import {useSelector, useDispatch} from "react-redux";
import {deleteRoute, removeEmptyRoutes} from "../routesSlice";
import {useFocusEffect} from "@react-navigation/native";

const Route = ({item: {name, locations}, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[{backgroundColor: "white", padding: 20}]}
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

    <View style={{flexDirection: "row", flex: 1}}>
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
        // ➝
      </Text>

      {locations.length == 1 && (
        <>
          <Text style={{color: "gray", fontSize: 14, flexWrap: "wrap"}}>
            No Added Locations
          </Text>
        </>
      )}
    </View>
  </TouchableOpacity>
);

const UserRoutes = ({route, navigation}) => {
  const dispatch = useDispatch();
  const routes = useSelector((state) => state.routes)["routes"];

  useFocusEffect(
    useCallback(() => {
      // set state to initial value
      dispatch(removeEmptyRoutes());
    }, [])
  );

  const renderItem = useCallback(({item: route, index}) => {
    return (
      <View key={route.name + JSON.stringify(route.locations)}>
        <SwipeableItem
          key={route.name + JSON.stringify(route.locations)}
          item={route}
          renderUnderlayLeft={() => <UnderlayLeft index={index} />}
          snapPointsLeft={[60]}
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

  const UnderlayLeft = ({index}) => {
    const {close} = useSwipeableItemParams();
    return (
      <View style={[styles.row, styles.underlayLeft]}>
        <TouchableOpacity
          onPress={() => {
            dispatch(deleteRoute({index: index}));
            close();
          }}
        >
          <Feather name="trash" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 32,
  },
  underlayLeft: {
    flex: 1,
    backgroundColor: "tomato",
    justifyContent: "flex-end",
  },
});

export default UserRoutes;
