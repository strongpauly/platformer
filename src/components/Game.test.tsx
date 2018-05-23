import {configure, mount, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import { Provider } from 'react-redux';
import changeLevel from '../state/actions/changeLevel';
import store from '../state/store';
import { Bullet } from './Bullet';
import * as Constants from './Constants';
import Game from './Game';

configure({ adapter: new Adapter() });

const thunk = ({ dispatch, getState }: any) => (next: any) => (action: any) => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action)
}

const create = () => {
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

  it('can change level', () => {
    shallow(<Provider store={mock.store}>
      <Game />
  </Provider>);
    mock.store.dispatch(changeLevel('2'));
    const state = mock.store.getState();
    expect(state.level.name).toEqual("2");
  });

  it('can step', () => {
    jest.useFakeTimers();
    mount(<Provider store={mock.store}>
        <Game />
    </Provider>);
    let state = mock.store.getState();
    const x = state.player.x;
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "ArrowRight"
    }));
    // wrapper.simulate("keydown");
    jest.advanceTimersByTime(Constants.STEP_SPEED);
    document.dispatchEvent(new KeyboardEvent("keyup", {
      key: "ArrowRight"
    }));
    state = mock.store.getState();
    expect(state.player.x).toEqual(x + Constants.STEP_WIDTH);
});

  it('can collect gun', () => {
      jest.useFakeTimers();
      mount(<Provider store={mock.store}>
          <Game />
      </Provider>);
      mock.store.dispatch(changeLevel('gunTest'));
      let state = mock.store.getState();
      expect(state.level.name).toEqual("gunTest");
      expect(state.player.hasGun).toBeFalsy();
      const x = state.player.x;
      document.dispatchEvent(new KeyboardEvent("keydown", {
        key: "ArrowRight"
      }));
      jest.advanceTimersByTime(Constants.STEP_SPEED);
      document.dispatchEvent(new KeyboardEvent("keyup", {
        key: "ArrowRight"
      }));
      state = mock.store.getState();
      expect(state.player.x).toEqual(x + Constants.STEP_WIDTH);
      expect(state.player.hasGun).toBeTruthy();
  });

  it('cannot fire gun without one', () => {
      jest.useFakeTimers();
      const wrapper = mount(<Provider store={mock.store}>
          <Game />
      </Provider>);
      mock.store.dispatch(changeLevel('gunTest'));
      const state = mock.store.getState();
      expect(state.level.name).toEqual("gunTest");
      expect(state.player.hasGun).toBeFalsy();
      document.dispatchEvent(new KeyboardEvent("keydown", {
        key: " "
      }));
      document.dispatchEvent(new KeyboardEvent("keyup", {
        key: " "
      }));
      expect(wrapper.find('Bullet').length).toEqual(0);
  });

  it('can fire gun with one', () => {
      jest.useFakeTimers();
      let wrapper = mount(<Provider store={mock.store}>
          <Game />
      </Provider>);
      mock.store.dispatch(changeLevel('gunTest'));
      let state = mock.store.getState();
      expect(state.level.name).toEqual("gunTest");
      expect(state.player.hasGun).toBeFalsy();
      const x = state.player.x;
      document.dispatchEvent(new KeyboardEvent("keydown", {
        key: "ArrowRight"
      }));
      jest.advanceTimersByTime(Constants.STEP_SPEED);
      document.dispatchEvent(new KeyboardEvent("keyup", {
        key: "ArrowRight"
      }));
      state = mock.store.getState();
      expect(state.player.x).toEqual(x + Constants.STEP_WIDTH);
      expect(state.player.hasGun).toBeTruthy();
      document.dispatchEvent(new KeyboardEvent("keydown", {
        key: " "
      }));
      document.dispatchEvent(new KeyboardEvent("keyup", {
        key: " "
      }));
      jest.advanceTimersByTime(Constants.ANIMATION_FREQUENCY);
      wrapper = wrapper.update();
      expect(wrapper.find(Bullet)).toHaveLength(1);
  });

  it('can jump', () => {
    jest.useFakeTimers();
    mount(<Provider store={mock.store}>
        <Game />
    </Provider>);
    mock.store.dispatch(changeLevel('gunTest'));
    let state = mock.store.getState();
    expect(state.level.name).toEqual("gunTest");
    expect(state.player.y).toEqual(0);
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "ArrowUp"
    }));
    document.dispatchEvent(new KeyboardEvent("keyup", {
      key: "ArrowUp"
    }));
    jest.advanceTimersByTime(Constants.JUMP_TIME / 2);
    state = mock.store.getState();
    expect(state.player.y).toBeGreaterThan(0);
    expect(state.player.y).toBeLessThanOrEqual(Constants.JUMP_HEIGHT);
    // Ensure jump has finished.
    jest.advanceTimersByTime((Constants.JUMP_TIME / 2) + Constants.ANIMATION_FREQUENCY);
    state = mock.store.getState();
    expect(state.player.y).toEqual(0);

});
});

