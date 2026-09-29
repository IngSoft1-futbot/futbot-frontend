import type { PacssAttributes } from "./paccsModel";

export interface Player {
  id: number,
  name: string;
  shirt_number: number | null;
  pacss: PacssAttributes;
  team_id: number | null;
}