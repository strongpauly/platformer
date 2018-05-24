import {configure, mount, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import { Provider } from 'react-redux';
import changeLevel from '../state/actions/changeLevel';
import collectGun from '../state/actions/collectGun';
import { createPlatformerStore } from '../state/store';
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

let store = createPlatformerStore();

const create = () => {
  const next = jest.fn()
  const invoke = (action:any) => thunk(store)(next)(action)
​
  return {store, next, invoke}
};

let mock = create();

describe('<Game>', () => {

  beforeEach( () => {
    store = createPlatformerStore();
    mock = create();
  })

  function startJump() {
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "ArrowUp"
    }));
    document.dispatchEvent(new KeyboardEvent("keyup", {
      key: "ArrowUp"
    }));
  }

  function startStepRight() {
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "ArrowRight"
    }));
  }

  function stopStepRight() {
    document.dispatchEvent(new KeyboardEvent("keyup", {
      key: "ArrowRight"
    }));
  }

  function fireGun() {
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: " ",
      repeat: false,
    }));
  }

  it('can be rendered', () => {
    const wrapper = shallow(<Provider store={mock.store}>
      <Game />
  </Provider>);
    expect(wrapper).toMatchSnapshot();
    wrapper.unmount();
  });

  it('can change level', () => {
    const wrapper = shallow(<Provider store={mock.store}>
      <Game />
  </Provider>);
    mock.store.dispatch(changeLevel('2'));
    const state = mock.store.getState();
    expect(state.level.name).toEqual("2");
    wrapper.unmount();
  });

  it('can step', () => {
    jest.useFakeTimers();
    const wrapper = mount(<Provider store={mock.store}>
        <Game />
    </Provider>);
    let state = mock.store.getState();
    const x = state.player.x;
    startStepRight();
    // wrapper.simulate("keydown");
    jest.advanceTimersByTime(Constants.STEP_SPEED);
    stopStepRight();
    state = mock.store.getState();
    expect(state.player.x).toEqual(x + Constants.STEP_WIDTH);

    wrapper.unmount();
});

  it('can collect gun', () => {
      jest.useFakeTimers();
      const wrapper = mount(<Provider store={mock.store}>
          <Game />
      </Provider>);
      mock.store.dispatch(changeLevel('gunTest'));
      let state = mock.store.getState();
      expect(state.level.name).toEqual("gunTest");
      expect(state.player.hasGun).toBeFalsy();
      const x = state.player.x;
      startStepRight();
      jest.advanceTimersByTime(Constants.STEP_SPEED);
      stopStepRight();
      state = mock.store.getState();
      expect(state.player.x).toEqual(x + Constants.STEP_WIDTH);
      expect(state.player.hasGun).toBeTruthy();

      wrapper.unmount();
  });

  it('cannot fire gun without one', () => {
      jest.useFakeTimers();
      let wrapper = mount(<Provider store={mock.store}>
          <Game />
      </Provider>);
      mock.store.dispatch(changeLevel('gunTest'));
      const state = mock.store.getState();
      expect(state.level.name).toEqual("gunTest");
      expect(state.player.hasGun).toBeFalsy();
      fireGun();
      jest.advanceTimersByTime(Constants.ANIMATION_FREQUENCY);
      wrapper = wrapper.update();
      expect(wrapper.find('Bullet').length).toEqual(0);

      wrapper.unmount();
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
      startStepRight();
      jest.advanceTimersByTime(Constants.STEP_SPEED);
      stopStepRight();
      state = mock.store.getState();
      expect(state.player.x).toEqual(x + Constants.STEP_WIDTH);
      expect(state.player.hasGun).toBeTruthy();
      fireGun();
      jest.advanceTimersByTime(Constants.ANIMATION_FREQUENCY);
      wrapper = wrapper.update();
      expect(wrapper.find(Bullet)).toHaveLength(1);
      wrapper.unmount();
  });
  
  it('can jump', () => {
      jest.useFakeTimers();
      const wrapper = mount(<Provider store={mock.store}>
          <Game />
      </Provider>);
      mock.store.dispatch(changeLevel('gunTest'));
      let state = mock.store.getState();
      expect(state.level.name).toEqual("gunTest");
      expect(state.player.y).toEqual(0);
      startJump();
      jest.advanceTimersByTime(Constants.JUMP_TIME / 2);
      state = mock.store.getState();
      expect(state.player.y).toBeGreaterThan(0);
      expect(state.player.y).toBeLessThanOrEqual(Constants.JUMP_HEIGHT);
      // Ensure jump has finished.
      jest.advanceTimersByTime((Constants.JUMP_TIME / 2) + Constants.ANIMATION_FREQUENCY);
      state = mock.store.getState();
      expect(state.player.y).toEqual(0);
      wrapper.unmount();
  });

  it('can jump onto platform', () => {
      jest.useFakeTimers();
      const wrapper = mount(<Provider store={mock.store}>
          <Game />
      </Provider>);
      mock.store.dispatch(changeLevel('platformTest'));
      let state = mock.store.getState();
      expect(state.level.name).toEqual("platformTest");
      expect(state.player.y).toEqual(0);
      startJump();
      jest.advanceTimersByTime(Constants.JUMP_TIME / 2);
      state = mock.store.getState();
      expect(state.player.y).toBeGreaterThan(0);
      expect(state.player.y).toBeLessThanOrEqual(Constants.JUMP_HEIGHT);
      // Ensure jump has finished.
      jest.advanceTimersByTime((Constants.JUMP_TIME / 2) + Constants.ANIMATION_FREQUENCY);
      state = mock.store.getState();
      expect(state.player.y).toEqual(70);
      wrapper.unmount();
  });

  it('can fall off platform', () => {
    jest.useFakeTimers();
    const wrapper = mount(<Provider store={mock.store}>
        <Game />
    </Provider>);
    mock.store.dispatch(changeLevel('platformTest'));
    let state = mock.store.getState();
    expect(state.level.name).toEqual("platformTest");
    expect(state.player.y).toEqual(0);
    startJump();
    jest.advanceTimersByTime(Constants.JUMP_TIME / 2);
    state = mock.store.getState();
    expect(state.player.y).toBeGreaterThan(0);
    expect(state.player.y).toBeLessThanOrEqual(Constants.JUMP_HEIGHT);
    // Ensure jump has finished.
    jest.advanceTimersByTime((Constants.JUMP_TIME / 2) + Constants.ANIMATION_FREQUENCY);
    state = mock.store.getState();
    expect(state.player.y).toEqual(70);
    startStepRight();
    jest.advanceTimersByTime(Constants.STEP_TIME * 2);
    state = mock.store.getState();
    expect(state.player.falling).toBeTruthy();
    // Give time to fall
    stopStepRight();
    jest.advanceTimersByTime(200);
    state = mock.store.getState();
    expect(state.player.y).toEqual(0);
    wrapper.unmount();
});

  it('can shoot enemies', () => {
    jest.useFakeTimers();
    const wrapper = mount(<Provider store={mock.store}>
        <Game />
    </Provider>);
    mock.store.dispatch(changeLevel('enemyTest'));
    let state = mock.store.getState();
    expect(state.level.name).toEqual("enemyTest");
    expect(state.level.enemies).toHaveLength(1);
    expect(state.level.enemies[0].hp).toEqual(2);
    expect(state.player.hasGun).toBeFalsy();
    mock.store.dispatch(collectGun({x:0, y:0, width:1, height:1}));
    state = mock.store.getState();
    expect(state.player.hasGun).toBeTruthy();
    fireGun();
    jest.advanceTimersByTime(1000);
    state = mock.store.getState();
    expect(state.level.enemies).toHaveLength(1);
    expect(state.level.enemies[0].hp).toEqual(1);
    wrapper.unmount();
  });

  it('can kill enemies', () => {
    jest.useFakeTimers();
    let wrapper = mount(<Provider store={mock.store}>
        <Game />
    </Provider>);
    mock.store.dispatch(changeLevel('enemyTest'));
    let state = mock.store.getState();
    expect(state.level.name).toEqual("enemyTest");
    expect(state.level.enemies).toHaveLength(1);
    expect(state.level.enemies[0].hp).toEqual(2);
    expect(state.player.hasGun).toBeFalsy();
    mock.store.dispatch(collectGun({x:0, y:0, width:1, height:1}));
    state = mock.store.getState();
    expect(state.player.hasGun).toBeTruthy();
    fireGun();
    wrapper = wrapper.update();
    expect(wrapper.find(Bullet)).toHaveLength(1);
    jest.advanceTimersByTime(1000);
    state = mock.store.getState();
    expect(state.level.enemies).toHaveLength(1);
    expect(state.level.enemies[0].hp).toEqual(1);
    fireGun();
    jest.advanceTimersByTime(1000);
    state = mock.store.getState();
    expect(state.level.enemies).toHaveLength(0);
    wrapper.unmount();
  });
});

