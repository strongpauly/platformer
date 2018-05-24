export default function jumpMove(y: number, jumpPercent: number, jumping: boolean) {
    return {
        payload: {
            jumpPercent,
            jumping,
            y,
        },
        type: 'JUMP_MOVE'
    };
  }
  