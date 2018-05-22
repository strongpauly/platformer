export default function changeLevel(level:string) {
    return {
        payload: level,
        type: 'LEVEL_CHANGE',
    };
  }
  