import React, { Component } from 'react';
import { DeviceEventEmitter, Text, View, TouchableHighlight } from 'react-native';
import { SensorManager } from 'NativeModules';
import { Stopwatch } from 'react-native-stopwatch-timer';

class AccelPlotter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false
    };
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.data = []
    DeviceEventEmitter.addListener('Accelerometer', function (data) {
        this.data.push(this.getMagnitude(data));
    });
  }

  getMagnitude(data) {
    x = data.x;
    y = data.y;
    z = data.z;
    return Math.sqrt(x*x + y*y + z*z);
  }

  start() {
    if (!this.state.running) {
        SensorManager.startAccelerometer(100);
        this.setState({running: true});
    }
  }

  stop() {
    if (this.state.running) {
        SensorManager.stopAccelerometer();
    }
  }
 
  render() {
    return (
      <View>
        <View style={styles.stopwatch}>
          <Stopwatch msecs start={this.state.start}
            reset={this.state.stop}
            options={options}
            getTime={this.getFormattedTime} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.buttonChoice} onPress={this.toggleStopwatch}>
            <Text style={styles.button}>{!this.state.start ? "Start" : "Stop"}</Text>
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

export default AccelPlotter;