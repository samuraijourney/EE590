import React, { Component } from 'react';
import { AppRegistry, StyleSheet,Text,View, TouchableHighlight } from 'react-native';
import { Stopwatch } from 'react-native-stopwatch-timer';

class StopwatchExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stopwatchStart: false,
      stopwatchReset: false,
    };
    this.toggleStopwatch = this.toggleStopwatch.bind(this);
    this.resetStopwatch = this.resetStopwatch.bind(this);
  }
 
  toggleStopwatch() {
    this.setState({stopwatchStart: !this.state.stopwatchStart, stopwatchReset: false});
  }
 
  resetStopwatch() {
    this.setState({stopwatchStart: false, stopwatchReset: true});
  }
 
  render() {
    return (
      <View>
        <View style={styles.stopwatch}>
          <Stopwatch msecs start={this.state.stopwatchStart}
            reset={this.state.stopwatchReset}
            options={options}
            getTime={this.getFormattedTime} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.buttonChoice} onPress={this.toggleStopwatch}>
            <Text style={styles.button}>{!this.state.stopwatchStart ? "Start" : "Stop"}</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.buttonChoice} onPress={this.resetStopwatch}>
            <Text style={styles.button}>Reset</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = {
  stopwatch: {
    alignItems: 'center',
    marginTop: 20
  },
  buttonChoice: {
    borderRadius: 40
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#ddd',
    fontSize: 30,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 40,
    textAlign: 'center',
    width: 150
  }
}

const options = {
  container: {
    backgroundColor: '#000',
    padding: 15,
    width: 330
  },
  text: {
    fontSize: 50,
    color: '#FFF',
    marginLeft: 7,
  }
};

export default StopwatchExample;