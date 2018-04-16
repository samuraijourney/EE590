import React, { Component } from 'react';
import { DeviceEventEmitter, Text, View, TouchableHighlight } from 'react-native';
import { SensorManager } from 'NativeModules';
import { Stopwatch } from 'react-native-stopwatch-timer';
import ShowcaseCard from './decorators/showcase-container'

class AccelPlotter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      reset: false,
      running: false
    };
    this.processNewData = this.processNewData.bind(this);
    this.reset = this.reset.bind(this);
    this.toggle = this.toggle.bind(this);
    this.data = []
    DeviceEventEmitter.addListener('Accelerometer', this.processNewData);
  }

  getMagnitude(data) {
    x = data.x;
    y = data.y;
    z = data.z;
    return Math.sqrt(x*x + y*y + z*z);
  }

  processNewData(newData) {
    this.data.push(this.getMagnitude(newData))
    this.setState({data: this.data});
  }

  reset() {
    SensorManager.stopAccelerometer();
    this.data = []
    this.setState({reset: true, running: false});
  }

  toggle() {
    if (!this.state.running) {
      SensorManager.startAccelerometer(100);
      this.setState({reset: false});

    } else {
      SensorManager.stopAccelerometer();
    }

    this.setState({running: !this.state.running});
  }

  render() {
    return (
      <View>
        <ShowcaseCard>
          <View style={styles.stopwatch}>
            <Stopwatch msecs 
              start={this.state.running}
              reset={this.state.reset}
              options={options} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableHighlight style={styles.buttonChoice} onPress={this.toggle}>
              <Text style={styles.button}>{!this.state.running ? "Start" : "Stop"}</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.buttonChoice} onPress={this.reset}>
              <Text style={styles.button}>Reset</Text>
            </TouchableHighlight>
          </View>
        </ShowcaseCard>
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
    backgroundColor: '#ddd',
    padding: 15,
    borderRadius: 50,
    width: 330
  },
  text: {
    fontSize: 50,
    color: '#000',
    marginLeft: 7,
  }
};

export default AccelPlotter;