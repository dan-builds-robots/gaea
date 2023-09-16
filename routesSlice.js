import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const initialState = {
  // value: await AsyncStorage.getItem("routes"),/
  routes: [],
  status: "idle",
  userRegion: {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  },
  userRegionStatus: "idle",
  bookmarkedLocations: {},
};

export const fetchRoutes = createAsyncThunk("users/fetchRoutes", async () => {
  return JSON.parse(await AsyncStorage.getItem("routes"));
});

export const fetchBookmarks = createAsyncThunk(
  "users/fetchBookmarks",
  async () => {
    return JSON.parse(await AsyncStorage.getItem("bookmarks"));
  }
);

export const fetchUserRegion = createAsyncThunk(
  "users/fetchUserRegion",
  async () => {
    let location = await Location.getLastKnownPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };
  }
);

const saveRoutes = (routes) => {
  AsyncStorage.setItem("routes", JSON.stringify(routes));
};

const saveBookmarks = (bookmarks) => {
  AsyncStorage.setItem("bookmarks", JSON.stringify(bookmarks));
};

export const routesSlice = createSlice({
  name: "routes",
  initialState,
  reducers: {
    addRoute: (state) => {
      newRoute = {
        name: "",
        locations: [
          {
            name: "dummyLocation",
            dummyLocation: true,
            coords: { latitude: 0, longitude: 0 },
            // key: -1,
          },
        ],
        midpointLatitude: 0,
        midpointLongitude: 0,
      };
      state.routes = [newRoute].concat(state.routes);
      saveRoutes(state.routes);
      // console.log("added new route:" + JSON.stringify(state.routes));
    },

    bookmarkLocation: (state, { payload: { placeId, locationData }, type }) => {
      state.bookmarkedLocations[placeId] = locationData;
      saveBookmarks(state.bookmarkedLocations);
    },

    unbookmarkLocation: (state, { payload: { placeId }, type }) => {
      delete state.bookmarkedLocations[placeId];
      saveBookmarks(state.bookmarkedLocations);
    },

    changeRouteName: (state, { payload: { index, newRouteName }, type }) => {
      // console.log("index: " + index + "; newRouteName: " + newRouteName);
      // console.log("state.routes: " + JSON.stringify(state.routes));
      state.routes[index].name = newRouteName;
      "Just updated route name: " + newRouteName;
      saveRoutes(state.routes);
    },

    setRoutes: (state, { payload, type }) => {
      state.routes = payload;
      saveRoutes(state.routes);
    },

    deleteRoute: (state, { payload: { index }, type }) => {
      state.routes.splice(index, 1);
      saveRoutes(state.routes);
    },

    addRouteLocation: (state, { payload: { index, newLocation }, type }) => {
      state.routes[index].locations.push(newLocation);

      let midpointLatitude = 0;
      let midpointLongitude = 0;

      state.routes[index].locations.forEach(
        ({ coords: { latitude, longitude }, location_i }) => {
          midpointLatitude += latitude;
          midpointLongitude += longitude;
        }
      );
      state.routes[index].midpointLatitude =
        midpointLatitude / (state.routes[index].locations.length - 1);
      state.routes[index].midpointLongitude =
        midpointLongitude / (state.routes[index].locations.length - 1);

      saveRoutes(state.routes);
    },

    updateRouteLocations: (
      state,
      { payload: { index, newLocations }, type }
    ) => {
      state.routes[index].locations = newLocations;

      if (state.routes[index].locations.length <= 1) {
        state.routes[index].midpointLatitude = 0;
        state.routes[index].midpointLongitude = 0;
      } else {
        let midpointLatitude = 0;
        let midpointLongitude = 0;

        state.routes[index].locations.forEach(
          ({ coords: { latitude, longitude }, location_i }) => {
            midpointLatitude += latitude;
            midpointLongitude += longitude;
          }
        );
        state.routes[index].midpointLatitude =
          midpointLatitude / (state.routes[index].locations.length - 1);
        state.routes[index].midpointLongitude =
          midpointLongitude / (state.routes[index].locations.length - 1);
      }

      saveRoutes(state.routes);
    },

    deleteRouteLocation: (
      state,
      { payload: { routeIndex, locationIndex }, type }
    ) => {
      state.routes[routeIndex].locations.splice(locationIndex, 1);

      if (state.routes[routeIndex].locations.length <= 1) {
        state.routes[routeIndex].midpointLatitude = 0;
        state.routes[routeIndex].midpointLongitude = 0;
      } else {
        let midpointLatitude = 0;
        let midpointLongitude = 0;

        state.routes[routeIndex].locations.forEach(
          ({ coords: { latitude, longitude }, location_i }) => {
            midpointLatitude += latitude;
            midpointLongitude += longitude;
          }
        );
        state.routes[routeIndex].midpointLatitude =
          midpointLatitude / (state.routes[routeIndex].locations.length - 1);
        state.routes[routeIndex].midpointLongitude =
          midpointLongitude / (state.routes[routeIndex].locations.length - 1);
      }
      saveRoutes(state.routes);
    },

    removeEmptyRoutes: (state, payload) => {
      state.routes = state.routes.filter(
        (route) => !(route.name == "" && route.locations.length == 1)
      );

      saveRoutes(state.routes);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRoutes.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Add any fetched routes to the array
        const routes = action.payload ? action.payload : [];
        state.routes = routes;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchUserRegion.pending, (state, action) => {
        state.userRegionStatus = "loading";
      })
      .addCase(fetchUserRegion.fulfilled, (state, action) => {
        state.userRegionStatus = "succeeded";
        // Add any fetched routes to the array
        const userRegion = action.payload ? action.payload : [];
        state.userRegion = userRegion;
      })
      .addCase(fetchUserRegion.rejected, (state, action) => {
        state.userRegionStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchBookmarks.pending, (state, action) => {
        state.bookmarksStatus = "loading";
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.bookmarksStatus = "succeeded";
        state.bookmarkedLocations = action.payload ? action.payload : {};
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.bookmarksStatus = "failed";
      });
  },
});

// Action creators are generated for each case reducer function
export const {
  addRoute,
  changeRouteName,
  setRoutes,
  deleteRoute,
  addRouteLocation,
  updateRouteLocations,
  deleteRouteLocation,
  removeEmptyRoutes,
  bookmarkLocation,
  unbookmarkLocation,
} = routesSlice.actions;

export default routesSlice.reducer;
