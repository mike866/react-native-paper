/* @flow */

import React from 'react';
import {
  StyleSheet,
} from 'react-native';
import StyledText from './StyledText';

type Props = {
  style?: any;
}

const Subheading = (props: Props) => (
  <StyledText
    {...props}
    alpha={0.87}
    family='regular'
    style={[ styles.text, props.style ]}
  />
);

export default Subheading;

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 2,
  },
});
