export interface ClubIdentity {
  primary: string;
  secondary: string;
  league: string;
  leagueCode: string;
}

export const CLUB_IDENTITY: Record<string, ClubIdentity> = {
  PSG:   { primary: "#004170", secondary: "#DA291C", league: "Ligue 1",       leagueCode: "L1"  },
  BAR:   { primary: "#A50044", secondary: "#004D98", league: "La Liga",        leagueCode: "LL"  },
  JUV:   { primary: "#1A1A1A", secondary: "#FFFFFF", league: "Serie A",        leagueCode: "SA"  },
  ACM:   { primary: "#FB090B", secondary: "#000000", league: "Serie A",        leagueCode: "SA"  },
  ATM:   { primary: "#CB3524", secondary: "#FFFFFF", league: "La Liga",        leagueCode: "LL"  },
  CITY:  { primary: "#6CABDD", secondary: "#1C2C5B", league: "Premier League", leagueCode: "PL"  },
  INTER: { primary: "#0047AB", secondary: "#000000", league: "Serie A",        leagueCode: "SA"  },
  GAL:   { primary: "#F7A600", secondary: "#D4192C", league: "Süper Lig",      leagueCode: "SL"  },
};

export function getClubIdentity(tokenId: string): ClubIdentity | undefined {
  return CLUB_IDENTITY[tokenId.toUpperCase()];
}
