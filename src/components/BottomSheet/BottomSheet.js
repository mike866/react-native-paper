/* @flow */

import React, {
  PropTypes,
  PureComponent,
} from 'react';
import {
  Animated,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  PanResponder,
} from 'react-native';
import Paper from '../Paper';
import Portal from '../Portal';
import BottomSheetList from './BottomSheetList';
import BottomSheetListItem from './BottomSheetListItem';

const AnimatedPaper = Animated.createAnimatedComponent(Paper);

type Props = {
  visible?: boolean;
  type?: 'modal' | 'persistent';
  onRequestClose: Function;
  children?: any;
}

type State = {
  opacity: Animated.Value;
  position: Animated.Value;
}

/**
 * Bottom sheets slide up from the bottom of the screen to reveal more content
 */
export default class BottomSheet extends PureComponent<void, Props, State> {

  static List = BottomSheetList;
  static ListItem = BottomSheetListItem;

  constructor(props: Props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(props.visible ? 1 : 0),
      position: new Animated.Value(64),
    };
  }

  state: State;

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this._canMove,
      onMoveShouldSetPanResponderCapture: this._canMove,
      onPanResponderGrant: this._startGesture,
      onPanResponderMove: this._respondToGesture,
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: this._releaseGesture,
      onPanResponderTerminate: this._releaseGesture,
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.visible !== nextProps.visible) {
      if (nextProps.visible) {
        this._showSheet();
      } else {
        this._hideSheet();
      }
    }
  }

  _height: 0;
  _panResponder: any;
  _pendingAnimationFrame;

  _animateSheet = (opacity: number, position: number, cb?: Function) => {
    this.state.position.stopAnimation(value => {
      this.state.position.flattenOffset();
      this.state.position.setValue(value);
      Animated.parallel([
        Animated.timing(this.state.opacity, {
          toValue: opacity,
          duration: 250,
        }),
        Animated.timing(this.state.position, {
          toValue: position,
          duration: 200,
        }),
      ]).start(cb);
    });
  };

  _showSheet = () => {
    this._animateSheet(1, 0);
  };

  _hideSheet = () => {
    this._animateSheet(0, 64, () => {
      this.props.onRequestClose();
      this._pendingAnimationFrame = global.requestAnimationFrame(() => {
        if (this.props.visible) {
          this._showSheet();
        }
      });
    });
  };

  _canMove = (evt, gestureState) => {
    return (
      Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
      Math.abs(gestureState.vy) > Math.abs(gestureState.vx)
    );
  };

  _startGesture = () => {
    this.state.position.stopAnimation((value: number) => {
      this.state.position.setOffset(value);
      this.state.position.setValue(0);
    });
  };

  _respondToGesture = (evt, gestureState) => {
    if (gestureState.dy >= 0) {
      this.state.position.setValue(gestureState.dy);
    }
  };

  _releaseGesture = (evt, gestureState) => {
    if (gestureState.dy > (this._height - 64)) {
      this._hideSheet();
    } else {
      this._showSheet();
    }
  };

  _handleLayout = (e) => {
    this._height = e.nativeEvent.layout.height;
  };

  render() {
    const pointerEvents = this.props.visible ? 'auto' : 'none';
    const { opacity } = this.state;
    return (
      <Portal>
        <View style={StyleSheet.absoluteFill} pointerEvents={pointerEvents}>
          <TouchableWithoutFeedback style={styles.container} onPress={this._hideSheet}>
            <Animated.View style={[ styles.container, styles.overlay, { opacity } ]} />
          </TouchableWithoutFeedback>
            <AnimatedPaper
              {...this._panResponder.panHandlers}
              onLayout={this._handleLayout}
              elevation={12}
              style={[ styles.sheet, { opacity, transform: [ { translateY: this.state.position } ] } ]}
            >
              {this.props.children}
            </AnimatedPaper>
        </View>
      </Portal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, .2)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

