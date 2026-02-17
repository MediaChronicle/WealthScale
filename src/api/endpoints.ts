const BASE_URL = 'https://raw.githubusercontent.com/komed3/rtb-api/main/api'

export const endpoints = {
  /** Top billionaires list with rank, net worth, industry */
  list: `${BASE_URL}/list/rtb/latest`,

  /** Detailed profile info */
  profile: (uri: string) => `${BASE_URL}/profile/${uri}/info`,

  /** Biography text */
  bio: (uri: string) => `${BASE_URL}/profile/${uri}/bio`,

  /** Asset breakdown */
  assets: (uri: string) => `${BASE_URL}/profile/${uri}/assets`,

  /** Historical net worth (CSV) */
  history: (uri: string) => `${BASE_URL}/profile/${uri}/history`,

  /** Rank history */
  rankHistory: (uri: string) => `${BASE_URL}/profile/${uri}/rank`,

  /** Monthly top 10 with historical data */
  top10: `${BASE_URL}/stats/top10`,

  /** Biggest daily gainers */
  winners: `${BASE_URL}/movers/value/winner/latest`,

  /** Biggest daily losers */
  losers: `${BASE_URL}/movers/value/loser/latest`,

  /** Country distribution */
  map: `${BASE_URL}/stats/map`,

  /** Industry index */
  industries: `${BASE_URL}/filter/industry/_index`,
} as const
