const BASE_URL = 'https://raw.githubusercontent.com/komed3/rtb-api/main/api'
export const endpoints = {
  list: `${BASE_URL}/list/rtb/latest`,
  top10: `${BASE_URL}/stats/top10`,
} as const
