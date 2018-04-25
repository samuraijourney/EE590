import React, { Component } from 'react';
import { DeviceEventEmitter, ScrollView, Text, View, TouchableHighlight } from 'react-native';
import { SensorManager } from 'NativeModules';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer';
import ShowcaseCard from './decorators/showcase-container'
import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { LineChart, YAxis, Grid } from 'react-native-svg-charts'

class GestureSampler extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calibrationDuration: 1000,
            calibrationReset: false,
            calibrationRunning: false,
            data: [],
            gestureCount: 0,
            lastAccelData: [0, 0, 0],
            lastGyroData: [0, 0, 0],
            reset: false,
            running: false,
            smoothData: []
        };

        this.calibrationComplete = this.calibrationComplete.bind(this);
        this.processNewCalibrationData = this.processNewCalibrationData.bind(this);
        this.processNewAccelData = this.processNewAccelData.bind(this);
        this.processNewGyroData = this.processNewGyroData.bind(this);
        this.resetCollection = this.resetCollection.bind(this);
        this.runCalibration = this.runCalibration.bind(this);
        this.toggleCollection = this.toggleCollection.bind(this);

        this.accelSampleCount = 0;
        this.accels = [];
        this.data = [];
        this.deltaData = [];
        this.frequency = 20.0;
        this.gyros = [];
        this.gyroSampleCount = 0;
        this.lastGestureIndex = 0;
        this.sampleCallback = props.onSample;
        this.silenceThreshold = 0;
        this.startCallback = props.onStart;

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

        minThresholdEnergy = 4;
        maxThresholdEnergy = 20;

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
        this.setState({lastAccelData: [newData.x, newData.y, newData.z]});
        this.data.push(this.getMagnitude(newData));
    }
  
    processNewAccelData(newData) {
        if (this.accelSampleCount > this.gyroSampleCount) {
            return;
        }

        this.setState({lastAccelData: [newData.x, newData.y, newData.z]});
        this.accels[this.accelSampleCount] = newData;
        this.data[this.accelSampleCount] = this.getMagnitude(newData);
        this.deltaData[this.accelSampleCount] = this.updateData(Math.abs(this.data[this.accelSampleCount] - this.silenceThreshold));
        var startIndex = Math.max(this.lastGestureIndex + 1, this.deltaData.length - 1.5 * this.frequency);
        var indices = this.findGestureSample(this.deltaData.slice(startIndex, this.deltaData.length));
        if (indices[1] != -1) {
            this.lastGestureIndex = startIndex + indices[1];
            var accels = this.accels.slice(startIndex + indices[0], startIndex + indices[1] + 1);
            var gyros = this.gyros.slice(startIndex + indices[0], startIndex + indices[1] + 1);
            this.setState({gestureCount: this.state.gestureCount + 1});
            console.log("gesture detected");
            if (this.sampleCallback) {
                this.sampleCallback(accels, gyros);
            }
        }

        this.accelSampleCount++;
    }

    processNewGyroData(newData) {
        if (this.gyroSampleCount > this.accelSampleCount) {
            return;
        }

        this.setState({lastGyroData: [newData.x, newData.y, newData.z]});
        this.gyros[this.gyroSampleCount] = newData;
        this.gyroSampleCount++;
    }

    resetCollection() {
        SensorManager.stopAccelerometer();
        this.data = [];
        this.deltaData = [];
        this.lastGestureIndex = 0;
        this.accelSampleCount = 0;
        this.setState({data: [], lastAccelData: [0, 0, 0], lastGyroData: [0, 0, 0], reset: true, running: false, smoothData: []});
    }

    runCalibration() {
        this.resetCollection();
        DeviceEventEmitter.addListener('Accelerometer', this.processNewCalibrationData);
        SensorManager.startAccelerometer(1000.0 / this.frequency);
        this.setState({calibrationReset: false, calibrationRunning: true, data: []});
    }

    toggleCollection() {
        if (!this.state.running) {
            DeviceEventEmitter.addListener('Accelerometer', this.processNewAccelData);
            DeviceEventEmitter.addListener('Gyroscope', this.processNewGyroData);
            SensorManager.startAccelerometer(1000.0 / this.frequency);
            SensorManager.startGyroscope(1000.0 / this.frequency);
            this.setState({data: [], reset: false, smoothData: []});
            if (this.startCallback) {
                this.startCallback();
            }

        } else {
            SensorManager.stopAccelerometer();
            SensorManager.stopGyroscope();
            DeviceEventEmitter.removeListener('Accelerometer', this.processNewAccelData);
            DeviceEventEmitter.removeListener('Gyroscope', this.processNewGyroData);
            this.setState({data: this.data, smoothData: this.deltaData});
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

        var x = this.state.lastAccelData[0].toFixed(2);
        var y = this.state.lastAccelData[1].toFixed(2);
        var z = this.state.lastAccelData[2].toFixed(2);
        var wx = this.state.lastGyroData[0].toFixed(2);
        var wy = this.state.lastGyroData[1].toFixed(2);
        var wz = this.state.lastGyroData[2].toFixed(2);

        return (
            <ScrollView 
                horizontal={false}
                decelerationRate={0}
                showsHorizontalScrollIndicator={false}
                style={{ flexDirection: 'column', flex: 1}}>
                <ScrollView 
                    horizontal={true}
                    snapToInterval={348} 
                    decelerationRate={0} 
                    snapToAlignment={"center"}
                    showsHorizontalScrollIndicator={false}
                    style={{ flex: 1, backgroundColor: '#8BC34A' }}>
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
                <View style={{ flex: 1, backgroundColor: '#e3aa1a'}}>
                    <View style={{ flexDirection: 'row', flex: 1}}>
                        <View style={{ flex: 0.73, backgroundColor: '#e4456a'}}>
                            <ShowcaseCard>
                                <Text style={styles.text}>x: {x} y: {y} z: {z}</Text>
                                <Text style={styles.text}>a: {wx} b: {wy} g: {wz}</Text>
                            </ShowcaseCard>
                        </View>
                        <View style={{ flex: 0.27, backgroundColor: '#ffff00' }}>
                            <ShowcaseCard>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={styles.gestureText}>{this.state.gestureCount}</Text>
                                </View>
                            </ShowcaseCard>
                        </View>
                    </View>
                </View>
                <ScrollView 
                    horizontal={true}
                    snapToInterval={348} 
                    decelerationRate={0} 
                    snapToAlignment={"center"}
                    showsHorizontalScrollIndicator={false}
                    style={{ flex: 1, backgroundColor: '#2196F3' }}>
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
        fontSize: 25,
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
        fontSize: 25,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 40,
        textAlign: 'center'
    },
    gestureText: {
        fontSize: 35,
        color: '#000',
        textAlign: 'center',
        height: 73,
        paddingTop: 11,
        width: 40
    },
    text: {
        fontSize: 20,
        color: '#000',
        margin: 5,
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
        fontSize: 40,
        color: '#000',
        marginLeft: 7,
        textAlign: 'center'
    }
};

export default GestureSampler;