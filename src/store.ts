export type CarState = "IDLE" | "FOUND";

export type Car = {
  model: string;
  state: CarState;
  messageId: string;
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

export const initStore = () => {
  const state: State = {
    cars: [],
    dailyCount: 0,
    runners: [],
    index: {},
    prices: [],
    rdvPlaces: [],
  };
  const mutations = {
    addCar: (value: Car) => (state.cars = [...state.cars, value]),
    removeCar: (value: Car) =>
      (state.cars = [
        ...state.cars.filter((car) => car.messageId !== value.messageId),
      ]),
    updateCarState: (value: Car) => {
      state.cars = [
        ...state.cars.filter((car) => car.messageId !== value.messageId),
        value,
      ];
    },
    sellCar: (value: Car) => {
      state.dailyCount = state.dailyCount + 1;
    },
  };
  return {
    state,
    mutations,
  };
};
