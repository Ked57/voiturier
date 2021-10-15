import Redis from "ioredis";
import { config } from "./app";

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

export type Store = {
  getState: () => Promise<State>;
  mutations: { [key: string]: Mutation };
};

const baseState: State = {
  cars: [],
  runners: [],
  index: {},
  prices: [750, 950, 1200],
  rdvPlaces: ["Eglise", "Double file"],
};

export const initStore = () => {
  const redis = new Redis(Number(config.REDIS_PORT), config.REDIS_HOST, {
    password: config.REDIS_PASSWORD,
  });

  const getState = async (): Promise<State> => {
    const state = await redis.get(config.ENV);
    if (!state) {
      console.error(
        `Couldn't find state for env ${config.ENV}, creating a new one`
      );
    }
    return state ? (JSON.parse(state) as State) : baseState;
  };
  const saveState = async (state: State) => {
    await redis.set(config.ENV, JSON.stringify(state));
  };
  const addCar = async (car: Car) => {
    const state = await getState();
    state.cars = [...state.cars, car];
    await saveState(state);
  };
  const removeCar = async (messageId: string) => {
    const state = await getState();
    state.cars = [...state.cars.filter((car) => car.messageId !== messageId)];
    await saveState(state);
  };
  const updateCarState = async (
    messageId: string,
    carState: CarState,
    foundBy?: string
  ) => {
    const state = await getState();
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
    await saveState(state);
  };
  const sellCar = async (messageId: string) => {
    const state = await getState();
    if (state.dailyCount) {
      state.dailyCount.count = state.dailyCount?.count + 1;
    }
    state.cars = [...state.cars.filter((car) => car.messageId !== messageId)];
    await saveState(state);
  };
  const setContact = async (contact?: Contact) => {
    const state = await getState();
    state.contact = contact;
    await saveState(state);
  };
  const upsertDailyCount = async (dailyCount: DailyCount) => {
    const state = await getState();
    state.dailyCount = dailyCount;
    await saveState(state);
  };
  const upsertRunner = async (runner: Runner) => {
    const state = await getState();
    state.runners = [
      ...state.runners.filter((r) => r.infoMessageId !== runner.infoMessageId),
      runner,
    ];
    await saveState(state);
    return runner;
  };
  const removeRunner = async (runner: Runner) => {
    const state = await getState();
    state.runners = state.runners.filter(
      (r) => r.infoMessageId !== runner.infoMessageId
    );
    await saveState(state);
  };
  const removePrice = async (price: number) => {
    const state = await getState();
    state.prices = state.prices.filter((p) => p !== price);
    await saveState(state);
  };
  const insertPrice = async (price: number) => {
    const state = await getState();
    state.prices = [...state.prices, price].sort((p, c) => p - c);
    await saveState(state);
  };
  const removePlace = async (place: string) => {
    const state = await getState();
    state.rdvPlaces = state.rdvPlaces.filter((p) => p !== place);
    await saveState(state);
  };
  const insertPlace = async (place: string) => {
    const state = await getState();
    state.rdvPlaces = [...state.rdvPlaces, place];
    await saveState(state);
  };
  return {
    getState,
    mutations: {
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
