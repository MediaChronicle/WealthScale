import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  createBillionaireSlice,
  type BillionaireSlice,
} from './billionaireStore'
import { createSceneSlice, type SceneSlice } from './sceneStore'
import { createUserSlice, type UserSlice } from './userStore'

export type AppStore = BillionaireSlice & SceneSlice & UserSlice

export const useAppStore = create<AppStore>()(
  devtools((...args) => ({
    ...createBillionaireSlice(...args),
    ...createSceneSlice(...args),
    ...createUserSlice(...args),
  })),
)

export type {
  ComparisonResults,
  RaceStatus,
  WealthRaceState,
} from './userStore'
