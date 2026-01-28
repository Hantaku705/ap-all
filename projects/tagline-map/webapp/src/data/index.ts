export { shampooData } from "./shampoo"
export { skincareData } from "./skincare"
export { lipData } from "./lip"
export type { TaglineData } from "./types"

import { shampooData } from "./shampoo"
import { skincareData } from "./skincare"
import { lipData } from "./lip"
import type { TaglineData } from "./types"

export const categoryData: Record<string, TaglineData[]> = {
  shampoo: shampooData,
  skincare: skincareData,
  lip: lipData,
}
