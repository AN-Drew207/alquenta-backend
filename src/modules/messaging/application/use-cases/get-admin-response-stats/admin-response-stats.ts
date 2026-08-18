/**
 * responseRate: fraction (0..1) of the admin's conversations that got at
 * least one reply from them. averageResponseMinutes: mean time from the
 * client's first message to the admin's first reply, across conversations
 * that got a reply — null when there isn't a single one yet.
 */
export class AdminResponseStats {
  constructor(
    readonly responseRate: number,
    readonly averageResponseMinutes: number | null,
    readonly sampleSize: number,
  ) {}
}
