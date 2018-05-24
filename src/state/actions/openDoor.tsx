export default function openDoor(door: any) {
    return {
        payload: door,
        type: 'OPEN_DOOR',
    };
  }
  