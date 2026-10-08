export const seatNumbers = ['R01', 'R02', 'R03', 'R04'] as const;

export type SeatNumber = (typeof seatNumbers)[number];
