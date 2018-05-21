export default function jumpMove(y: number, jumping: boolean) {
    return {
        payload: {
            jumping,
            y,
        },
        type: 'JUMP_MOVE'
    };
  }
  