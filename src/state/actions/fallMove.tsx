export default function fallMove(y: number, falling: boolean) {
    return {
        payload: {
            falling,
            y,
        },
        type: 'FALL_MOVE'
    };
  }
  