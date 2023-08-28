const routes = [
  {
    // id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    name: "Thrifting Expedition",
    locations: [
      {
        name: "The Garment District",
        coords: {
          latitude: 42.36593387531303,
          longitude: -71.09285084953996,
        },
        key: 1,
      },
      {
        name: "Boomerang",
        coords: {
          latitude: 42.364818061477045,
          longitude: -71.102128186727,
        },
        key: 2,
      },
      {
        name: "Goodwills",
        coords: {
          latitude: 42.364061726087144,
          longitude: -71.10206403808195,
        },
        key: 3,
      },
    ],
    midpointLatitude: 0,
    midpointLongitude: 0,
  },

  {
    // id: "2ac68afc-c605-48d3-a4f8-fbd91aa97f62",
    name: "Thrifting Expedition: Across The Bridge",
    locations: [
      {
        name: "Urban Outfitter's",
        coords: {
          latitude: 42.34846901180063,
          longitude: -71.08790698161025,
        },
        key: 4,
      },
    ],
    midpointLatitude: 0,
    midpointLongitude: 0,
  },
];

routes.forEach(
  ({ locations, midpointLatitude, midpointLongitude }, route_i) => {
    locations.forEach(({ coords: { latitude, longitude }, location_i }) => {
      routes[route_i].midpointLatitude += latitude;
      routes[route_i].midpointLongitude += longitude;
    });
    routes[route_i].midpointLatitude /= locations.length;
    routes[route_i].midpointLongitude /= locations.length;
    routes[route_i].locations.push({
      dummyLocation: true,
      coords: { latitude: 0, longitude: 0 },
      key: -1,
    });
  }
);
export default routes;
