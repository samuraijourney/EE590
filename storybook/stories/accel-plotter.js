import React, { Component } from 'react';
import { DeviceEventEmitter, ScrollView, Text, View, TouchableHighlight } from 'react-native';
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
      smoothData: [],
      lastData: [0, 0, 0],
      steps: 0,
      reset: false,
      running: false
    };

    this.processNewData = this.processNewData.bind(this);
    this.reset = this.reset.bind(this);
    this.toggle = this.toggle.bind(this);

    this.data = [];
    this.frequency = 20.0
    this.lastMinMax = 0;
    this.rollingAvgSum = 0;
    this.sampleCount = 0;
    this.smoothData = [];
    
    DeviceEventEmitter.addListener('Accelerometer', this.processNewData);

    this.gain = 3.414213562;
    this.xv = [0, 0, 0];
    this.yv = [0, 0, 0];
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
    this.xv[0] = this.xv[1]; 
    this.xv[1] = this.xv[2]; 
    this.xv[2] = this.data[this.sampleCount] / this.gain;
    this.yv[0] = this.yv[1]; 
    this.yv[1] = this.yv[2]; 
    this.yv[2] = (this.xv[0] + this.xv[2]) + 2 * this.xv[1] + ( -0.6413515381 * this.yv[0]) + (  1.5610180758 * this.yv[1]);
    this.smoothData[this.sampleCount] = this.yv[2];

    if (this.sampleCount > 0) {
      newDerivative = this.smoothData[this.sampleCount] - this.smoothData[this.sampleCount - 1];
      if (newDerivative < 0.01) {
        newLastMinMax = this.sampleCount;
        if (this.lastMinMax > 0) {
          if ((this.smoothData[newLastMinMax] - this.smoothData[this.lastMinMax]) > 5) {
            this.setState({steps: this.state.steps + 1});
          }
        }
        
        this.lastMinMax = newLastMinMax;
      }
    }

    this.sampleCount++;
  }

  reset() {
    SensorManager.stopAccelerometer();
    this.data = [];
    this.smoothData = [];
    this.firstDerivatives = [];
    this.secondDerivatives = [];
    this.sampleCount = 0;
    this.rollingAvgSum = 0;
    this.setState({data: [], lastData: [0, 0, 0], reset: true, running: false, smoothData: [], steps: 0});
  }

  toggle() {
    if (!this.state.running) {
      SensorManager.startAccelerometer(1000.0 / this.frequency);
      this.setState({data: [], smoothData: [], reset: false});

    } else {
      SensorManager.stopAccelerometer();
      this.setState({data: this.data, smoothData: this.smoothData});
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
        <ScrollView 
          horizontal={true}
          snapToInterval={348} 
          decelerationRate={0} 
          snapToAlignment={"center"}
          showsHorizontalScrollIndicator={false}>
          <ShowcaseCard>
            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
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
          <ShowcaseCard>
            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
              <YAxis
                data={ this.state.smoothData }
                contentInset={ contentInset }
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                }}
                numberOfTicks={ 10 }/>
              <LineChart
                style={{ flex: 1, marginLeft: 16 }}
                data={ this.state.smoothData }
                contentInset={ contentInset }
                svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
                <Gradient/>
                <Grid/>
              </LineChart>
            </View>
          </ShowcaseCard>
        </ScrollView>
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