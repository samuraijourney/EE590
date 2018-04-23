import React, { Component } from 'react';
import { DeviceEventEmitter, ScrollView, Text, View, TouchableHighlight } from 'react-native';
import { SensorManager } from 'NativeModules';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer';
import ShowcaseCard from './decorators/showcase-container'
import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { LineChart, YAxis, Grid } from 'react-native-svg-charts'

class RandomForestTrainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calibrationDuration: 1000,
            calibrationReset: false,
            calibrationRunning: false,
            data: [],
            lastData: [0, 0, 0],
            reset: false,
            running: false,
            smoothData: []
        };

        this.calibrationComplete = this.calibrationComplete.bind(this);
        this.processNewCalibrationData = this.processNewCalibrationData.bind(this);
        this.processNewData = this.processNewData.bind(this);
        this.resetCollection = this.resetCollection.bind(this);
        this.runCalibration = this.runCalibration.bind(this);
        this.toggleCollection = this.toggleCollection.bind(this);

        this.data = [];
        this.deltaData = [];
        this.frequency = 20.0
        this.gestureData = [];
        this.lastGestureIndex = 0;
        this.sampleCount = 0;
        this.silenceThreshold = 0;

        this.gain = 3.414213562;
        this.xv = [0, 0, 0];
        this.yv = [0, 0, 0];
    }

    calibrationComplete() {
        SensorManager.stopAccelerometer();
        DeviceEventEmitter.removeListener('Accelerometer', this.processNewCalibrationData);
        var sum = 0;
        for(var i = 0; i < this.data.length; i++) {
            sum += this.data[i];
        }

        this.silenceThreshold = sum / this.data.length;
        this.setState({calibrationReset: true, calibrationRunning: false});
        this.resetCollection();
    }

    findGestureSample(data) {
        minEnergy = Math.min.apply(Math, data);
        maxEnergy = Math.max.apply(Math, data);

        minThresholdEnergy = 4;//Math.abs(Math.min(0.03 * (maxEnergy - minEnergy) + minEnergy, 4 * minEnergy));
        maxThresholdEnergy = 20;//5 * minThresholdEnergy;

        var n1 = -1;
        var n2 = -1;
        var index = data.length - 1;
        if (index < 0) {
            return [-1, -1];
        }

        while (index >= 0) {
            // Find where we dip below the ITL from the end
            for (; index >= 0; index--) {
                if (data[index] < minThresholdEnergy) {
                    break;
                }
            }

            if (index < 0) {
                return [-1, -1];
            }
            
            // Find where we go above ITL from the end      
            for (; index >= 0; index--) {
                if (data[index] > minThresholdEnergy) {
                    break;
                }
            }

            if (index < 0) {
                return [-1, -1];
            }

            if (n2 == -1) {
                n2 = index + 1;
            }
            
            // Find where we exceed ITU
            for (; index >= 0; index--) {
                // Dipped under the min threshold before exceeding max
                if (data[index] < minThresholdEnergy) {
                    break;
                }

                if (data[index] > maxThresholdEnergy) {
                    break;
                }
            }

            
            if (data[index] > maxThresholdEnergy) {
                break;
            }
            
        }
        
        if (index < 0) {
            return [-1, -1];
        }
        
        // Find where we dip below ITL
        for (; index >= 0; index--) {
            // Dipped under the min threshold
            if (data[index] < minThresholdEnergy) {
                break
            }
        }
        
        if (index < 0) {
            return [-1, -1];

        }
        
        n1 = index;

        return [n1, n2];
    }

    getMagnitude(data) {
        x = data.x;
        y = data.y;
        z = data.z;
        return Math.sqrt(x*x + y*y + z*z);
    }

    processNewCalibrationData(newData) {
        this.setState({lastData: [newData.x, newData.y, newData.z]});
        this.data.push(this.getMagnitude(newData));
    }
  
    processNewData(newData) {
        this.setState({lastData: [newData.x, newData.y, newData.z]});
        this.data[this.sampleCount] = this.getMagnitude(newData);
        this.deltaData[this.sampleCount] = this.updateData(Math.abs(this.data[this.sampleCount] - this.silenceThreshold));
        var startIndex = Math.max(this.lastGestureIndex + 1, this.deltaData.length - 1.5 * this.frequency);
        var indices = this.findGestureSample(this.deltaData.slice(startIndex, this.deltaData.length));
        if (indices[1] != -1) {
            this.lastGestureIndex = startIndex + indices[1];
            this.gestureData = this.data.slice(startIndex + indices[0], startIndex + indices[1] + 1);
            this.setState({data: this.gestureData});
            console.log("gesture detected");
        }

        this.sampleCount++;
    }

    resetCollection() {
        SensorManager.stopAccelerometer();
        this.data = [];
        this.deltaData = [];
        this.gestureData = [];
        this.lastGestureIndex = 0;
        this.sampleCount = 0;
        this.setState({data: [], lastData: [0, 0, 0], reset: true, running: false, smoothData: []});
    }

    runCalibration() {
        this.resetCollection();
        DeviceEventEmitter.addListener('Accelerometer', this.processNewCalibrationData);
        SensorManager.startAccelerometer(1000.0 / this.frequency);
        this.setState({calibrationReset: false, calibrationRunning: true, data: []});
    }

    toggleCollection() {
        if (!this.state.running) {
            DeviceEventEmitter.addListener('Accelerometer', this.processNewData);
            SensorManager.startAccelerometer(1000.0 / this.frequency);
            this.setState({data: [], reset: false, smoothData: []});

        } else {
            SensorManager.stopAccelerometer();
            DeviceEventEmitter.removeListener('Accelerometer', this.processNewData);
            this.setState({data: this.gestureData, smoothData: this.deltaData});
        }

        this.setState({running: !this.state.running});
    }

    updateData(newData) {
        this.xv[0] = this.xv[1]; 
        this.xv[1] = this.xv[2]; 
        this.xv[2] = newData / this.gain;
        this.yv[0] = this.yv[1]; 
        this.yv[1] = this.yv[2]; 
        this.yv[2] = (this.xv[0] + this.xv[2]) + 2 * this.xv[1] + (-0.6413515381 * this.yv[0]) + (1.5610180758 * this.yv[1]);
        return this.yv[2];
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

        var x = this.state.lastData[0].toFixed(5);
        var y = this.state.lastData[1].toFixed(5);
        var z = this.state.lastData[2].toFixed(5);

        var stepCount = this.state.steps;

        return (
            <ScrollView 
                horizontal={false}
                decelerationRate={0}
                showsHorizontalScrollIndicator={false}>
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
                    <ShowcaseCard>
                        <Text style={styles.text}>x: {x}</Text>
                        <Text style={styles.text}>y: {y}</Text>
                        <Text style={styles.text}>z: {z}</Text>
                    </ShowcaseCard>
                    <ScrollView 
                        horizontal={true}
                        snapToInterval={348} 
                        decelerationRate={0} 
                        snapToAlignment={"center"}
                        showsHorizontalScrollIndicator={false}>
                        <ShowcaseCard>
                            <View style={styles.stopwatch}>
                                <Timer msecs 
                                    handleFinish={this.calibrationComplete}
                                    totalDuration={this.state.calibrationDuration} 
                                    start={this.state.calibrationRunning}
                                    reset={this.state.calibrationReset}
                                    options={options} />
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableHighlight style={styles.buttonChoice} onPress={this.runCalibration} disabled={this.state.running}>
                                    <Text style={styles.calibrateButton}>{!this.state.calibrationRunning ? "Calibrate" : "Stay still..."}</Text>
                                </TouchableHighlight>
                            </View>
                        </ShowcaseCard>
                        <ShowcaseCard>
                            <View style={styles.stopwatch}>
                                <Stopwatch msecs 
                                    start={this.state.running}
                                    reset={this.state.reset}
                                    options={options} />
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableHighlight style={styles.buttonChoice} onPress={this.toggleCollection} disabled={this.state.calibrationRunning}>
                                    <Text style={styles.button}>{!this.state.running ? "Start" : "Stop"}</Text>
                                </TouchableHighlight>
                                <TouchableHighlight style={styles.buttonChoice} onPress={this.resetCollection} disabled={this.state.calibrationRunning}>
                                    <Text style={styles.button}>Reset</Text>
                                </TouchableHighlight>
                            </View>
                        </ShowcaseCard>
                    </ScrollView>
                </View>
            </ScrollView>
        );
    }
}

const styles = {
    stopwatch: {
        alignItems: 'center',
        marginTop: 20,
        width: 348
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
    calibrateButton: {
        backgroundColor: '#ddd',
        color: '#000',
        fontSize: 30,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 40,
        textAlign: 'center'
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
        textAlign: 'center'
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

export default RandomForestTrainer;