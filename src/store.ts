import { saveToDB } from "./db";

export type CarState = "IDLE" | "FOUND";

export type Car = {
  model: string;
  state: CarState;
  for: string;
  foundBy?: string;
  messageId: string;
  runnerMessageId: string;
};

export type Runner = {
  name: string;
  userId?: string;
  messageId: string;
  phoneNumber?: string;
  count: {
    ongoing: number;
    total: number;
  };
  price: number;
  rdvPlace: string;
};

export type Index = {
  [group: string]: {
    [name: string]: number;
  };
};

export type State = {
  cars: Car[];
  dailyCount: number;
  runners: Runner[];
  index: Index;
  prices: number[];
  rdvPlaces: string[];
};

export type Mutation = (...args: any) => void;

const mutationify =
  (mutation: Mutation) =>
  (...args: any) => {
    mutation(args);
    saveToDB();
  };

export const initStore = () => {
  let state: State = {
    cars: [],
    dailyCount: 0,
    runners: [],
    index: {},
    prices: [],
    rdvPlaces: [],
  };
  const loadState = mutationify((loadedState: State) => (state = loadedState));
  const addCar = mutationify(
    (value: Car) => (state.cars = [...state.cars, value])
  );
  const removeCar = mutationify(
    (messageId: string) =>
      (state.cars = [
        ...state.cars.filter((car) => car.messageId !== messageId),
      ])
  );
  const updateCarState = mutationify(
    (messageId: string, carState: CarState, foundBy?: string) => {
      const car = state.cars.find(
        (car) =>
          car.messageId === messageId || car.runnerMessageId === messageId
      );
      if (!car) {
        console.error(
          "ERROR: Updating car state -> couldn't find car with messageId or runnerMessageId",
          messageId
        );
        return;
      }
      state.cars = [
        ...state.cars.filter((car) => car.messageId !== messageId),
        { ...car, state: carState, foundBy },
      ];
    }
  );
  const sellCar = mutationify((messageId: string) => {
    state.dailyCount = state.dailyCount + 1;
    state.cars = [...state.cars.filter((car) => car.messageId !== messageId)];
  });
  return {
    state,
    mutations: {
      loadState,
      addCar,
      removeCar,
      updateCarState,
      sellCar,
    },
  };
};
