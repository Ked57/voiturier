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
  countMessageId: string;
  infoMessageId: string;
  phoneNumber: string;
  count: {
    ongoing: number;
    total: number;
  };
  price?: number;
  rdvPlace?: string;
};

export type Index = {
  [group: string]: {
    [name: string]: number;
  };
};

export type Contact = {
  description: string;
  vehicleMessageId: string;
  vehicleRunnerMessageId: string;
};

export type DailyCount = {
  count: number;
  messageId: string;
};

export type State = {
  cars: Car[];
  dailyCount?: DailyCount;
  runners: Runner[];
  index: Index;
  prices: number[];
  rdvPlaces: string[];
  contact?: Contact;
};

export type Mutation = (...args: any) => void;

export const initStore = () => {
  const state: State = {
    cars: [],
    runners: [],
    index: {},
    prices: [350, 450, 500],
    rdvPlaces: ["Eglise", "Double file"],
  };
  const loadState = (loadedState: State) => {
    console.log("loading state ...", loadedState);
    Object.entries(loadedState).map(([key, value]) =>
      Object.assign(state, { [key]: value })
    );
  };
  const addCar = (car: Car) => {
    state.cars = [...state.cars, car];
  };
  const removeCar = (messageId: string) => {
    state.cars = [...state.cars.filter((car) => car.messageId !== messageId)];
  };
  const updateCarState = (
    messageId: string,
    carState: CarState,
    foundBy?: string
  ) => {
    const car = state.cars.find(
      (car) => car.messageId === messageId || car.runnerMessageId === messageId
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
  };
  const sellCar = (messageId: string) => {
    if (state.dailyCount) {
      state.dailyCount.count = state.dailyCount?.count + 1;
    }
    state.cars = [...state.cars.filter((car) => car.messageId !== messageId)];
  };
  const setContact = (contact?: Contact) => {
    state.contact = contact;
  };
  const upsertDailyCount = (dailyCount: DailyCount) => {
    state.dailyCount = dailyCount;
  };
  const upsertRunner = (runner: Runner) => {
    state.runners = [
      ...state.runners.filter((r) => r.infoMessageId !== runner.infoMessageId),
      runner,
    ];
    return runner;
  };
  const removeRunner = (runner: Runner) => {
    state.runners = state.runners.filter(
      (r) => r.infoMessageId !== runner.infoMessageId
    );
  };
  const removePrice = (price: number) => {
    state.prices = state.prices.filter((p) => p !== price);
  };
  const insertPrice = (price: number) => {
    state.prices = [...state.prices, price].sort((p, c) => p - c);
  };
  const removePlace = (place: string) => {
    state.rdvPlaces = state.rdvPlaces.filter((p) => p !== place);
  };
  const insertPlace = (place: string) => {
    state.rdvPlaces = [...state.rdvPlaces, place];
  };
  return {
    state,
    mutations: {
      loadState,
      addCar,
      removeCar,
      updateCarState,
      sellCar,
      setContact,
      upsertDailyCount,
      upsertRunner,
      removeRunner,
      removePrice,
      insertPrice,
      removePlace,
      insertPlace,
    },
  };
};
