/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import AccelPlotter from './storybook/stories/accel-plotter.js'

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <AccelPlotter/>
    );
  }
}