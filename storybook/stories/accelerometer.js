import React, { Component } from 'react';
import { DeviceEventEmitter, Text, View, TouchableHighlight } from 'react-native';
import { SensorManager } from 'NativeModules';

class AccelerometerExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      data: [0, 0, 0]
    };
    this.processNewData = this.processNewData.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    DeviceEventEmitter.addListener('Accelerometer', this.processNewData);
  }

  processNewData(data) {
    var newData = [data.x, data.y, data.z]
    this.setState({data: newData});
  }

  start() {
    if (!this.state.running) {
        SensorManager.startAccelerometer(20);
        this.setState({running: true});
    }
  }

  stop() {
    if (this.state.running) {
        SensorManager.stopAccelerometer();
    }
  }
 
  render() {
    var x = this.state.data[0].toFixed(6);
    var y = this.state.data[1].toFixed(6);
    var z = this.state.data[2].toFixed(6);

    return (
      <View>
        <Text style={styles.titleText}>Accel</Text>
        <Text style={styles.text}>x: {x}</Text>
        <Text style={styles.text}>y: {y}</Text>
        <Text style={styles.text}>z: {z}</Text>
        <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.buttonChoice} onPress={this.start}>
            <Text style={styles.button}>Start</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.buttonChoice} onPress={this.stop}>
            <Text style={styles.button}>Stop</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = {
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
  },
  titleText: {
    fontSize: 40,
    color: '#000',
    marginLeft: 7,
    textAlign: 'center',
  },
  text: {
    fontSize: 30,
    color: '#000',
    marginLeft: 7,
    textAlign: 'center'
  }
}

export default AccelerometerExample;