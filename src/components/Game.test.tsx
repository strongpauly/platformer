import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import { Provider, Store } from 'react-redux';
import Game from './Game';

configure({ adapter: new Adapter() });

const thunk = ({ dispatch, getState }: any) => (next: any) => (action: any) => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
​
  return next(action)
}

const create = () => {
  const store: Store<any> = {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
    replaceReducer: jest.fn(),
    subscribe: jest.fn()
  };
  const next = jest.fn()
​
  const invoke = (action:any) => thunk(store)(next)(action)
​
  return {store, next, invoke}
};

const mock = create();
describe('<Game>', () => {
  it('can be rendered', () => {
    const wrapper = shallow(<Provider store={mock.store}>
      <Game />
  </Provider>);
    expect(wrapper).toMatchSnapshot();
  });

});

