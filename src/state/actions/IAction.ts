export interface IAction<P = any> {
  type: string;
  payload: P;
}
