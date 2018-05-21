export default function stepStart(inverted: boolean) {
    return {
        payload: inverted,
        type: 'STEP_START'
    };
  }
  