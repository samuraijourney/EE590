import React, { Component } from 'react';
import { DeviceEventEmitter, Text, View, TouchableHighlight } from 'react-native';
import { SensorManager } from 'NativeModules';
import { Stopwatch } from 'react-native-stopwatch-timer';
import ShowcaseCard from './decorators/showcase-container'
import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { LineChart, YAxis, Grid } from 'react-native-svg-charts'

class AccelPlotter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      lastData: [0, 0, 0],
      steps: 0,
      reset: false,
      running: false
    };
    this.frequency = 20.0
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
    this.data.push(this.getMagnitude(newData));
    this.setState({lastData: [newData.x, newData.y, newData.z]});
  }

  reset() {
    SensorManager.stopAccelerometer();
    this.data = []
    this.setState({data: [], lastData: [0, 0, 0], reset: true, running: false, steps: 0});
  }

  toggle() {
    if (!this.state.running) {
      SensorManager.startAccelerometer(1000.0 / this.frequency);
      this.setState({data: [], reset: false});

    } else {
      SensorManager.stopAccelerometer();
      this.setState({data: this.data});
    }

    this.setState({running: !this.state.running});
  }

  render() {
    const Gradient = () => (
      <Defs key={ 'gradient' }>
          <LinearGradient id={ 'gradient' } x1={ '0' } y={ '0%' } x2={ '100%' } y2={ '0%' }>
              <Stop offset={ '0%' } stopColor={ 'rgb(134, 65, 244)' }/>
              <Stop offset={ '100%' } stopColor={ 'rgb(66, 194, 244)' }/>
          </LinearGradient>
      </Defs>
    )
    
    const contentInset = { top: 20, bottom: 20 }

    var x = this.state.lastData[0].toFixed(3);
    var y = this.state.lastData[1].toFixed(3);
    var z = this.state.lastData[2].toFixed(3);

    var stepCount = this.state.steps;

    return (
      <View>
        <ShowcaseCard>
          <View style={{ height: 200, flexDirection: 'row' }}>
            <YAxis
              data={ this.state.data }
              contentInset={ contentInset }
              svg={{
                  fill: 'grey',
                  fontSize: 10,
              }}
              numberOfTicks={ 10 }/>
            <LineChart
              style={{ flex: 1, marginLeft: 16 }}
              data={ this.state.data }
              contentInset={ contentInset }
              svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
              <Gradient/>
              <Grid/>
            </LineChart>
          </View>
        </ShowcaseCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <ShowcaseCard style={{ flex: 1 }}>
            <Text style={styles.text}>x: {x}</Text>
            <Text style={styles.text}>y: {y}</Text>
            <Text style={styles.text}>z: {z}</Text>
          </ShowcaseCard>
          <ShowcaseCard style={{ flex: 1 }}>
            <Text style={styles.stepText}>{stepCount}</Text>
          </ShowcaseCard>
        </View>
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
    color: '#000',
    fontSize: 30,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 40,
    textAlign: 'center',
    width: 150
  },
  stepText: {
    fontSize: 100,
    color: '#000',
    textAlign: 'center',
    marginTop: 13,
    width: 120
  },
  text: {
    fontSize: 40,
    color: '#000',
    textAlign: 'center',
    width: 165
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