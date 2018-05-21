export default function stepMove(x: number, stepping: boolean) {
    return {
        payload: {
            stepping,
            x,
        },
        type: 'STEP_MOVE'
    };
  }
  