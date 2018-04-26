import React, { Component } from 'react';
import { ListView, Text, View, TouchableHighlight } from 'react-native';
import ShowcaseCard from './decorators/showcase-container'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Akira, Sae, Makiko } from 'react-native-textinput-effects';
import Samples from './samples';
import Recognizer from './recognizer';

class Trainer extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state = {
            accelsX: [],
            accelsY: [],
            accelsZ: [],
            currentIndex: 0,
            dataLabels: [],
            gyrosX: [],
            gyrosY: [],
            gyrosZ: [],
            label: "",
            modelsDataSource: ds.cloneWithRows([]),
            newAccelX: 0,
            newAccelY: 0,
            newAccelZ: 0,
            newGyroX: 0,
            newGyroY: 0,
            newGyroZ: 0,
            reference: {text: ""},
            sampleCount: 0,
            samplesDataSource: ds.cloneWithRows([]),
            update: false
        };

        this.addGestureLabel = this.addGestureLabel.bind(this);
        this.reset = this.reset.bind(this);
        this.train = this.train.bind(this);
        this.sampleResetCallback = this.props.onSampleReset;
        
        this.labels = [];
    }

    addGestureLabel() {
        if (this.labels.includes(this.state.label)) {
            return;
        }

        this.labels.push(this.state.label);
        this.setState({
            samplesDataSource: this.state.samplesDataSource.cloneWithRows(this.labels),
            update: false
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        var update = false;
   
        if ((nextProps.currentIndex == prevState.currentIndex) && 
            (nextProps.accelsX.length > 0)) {

            prevState.accelsX.push(nextProps.accelsX);
            prevState.accelsY.push(nextProps.accelsY);
            prevState.accelsZ.push(nextProps.accelsZ);
            prevState.gyrosX.push(nextProps.gyrosX);
            prevState.gyrosY.push(nextProps.gyrosY);
            prevState.gyrosZ.push(nextProps.gyrosZ);
            prevState.dataLabels.push(this.state.label);
            update = true;

        } else {
            update = false;
        }

        return {
            accelsX: prevState.accelsX,
            accelsY: prevState.accelsY,
            accelsZ: prevState.accelsZ,
            currentIndex: nextProps.currentIndex,
            dataLabels: prevState.dataLabels,
            gyrosX: prevState.gyrosX,
            gyrosY: prevState.gyrosY,
            gyrosZ: prevState.gyrosZ,
            newAccelX: nextProps.accelsX,
            newAccelY: nextProps.accelsY,
            newAccelZ: nextProps.accelsZ,
            newGyroX: nextProps.gyrosX,
            newGyroY: nextProps.gyrosY,
            newGyroZ: nextProps.gyrosZ,
            sampleCount: nextProps.sampleCount,
            update: update
        };
    }

    reset() {
        this.setState({
            accelsX: [],
            accelsY: [],
            accelsZ: [],
            dataLabels: [],
            gyrosX: [],
            gyrosY: [],
            gyrosZ: [],
            modelsDataSource: this.state.modelsDataSource.cloneWithRows([]),
            sampleCount: 0,
            samplesDataSource: this.state.samplesDataSource.cloneWithRows([]),
            update: false
        });

        this.labels = [];

        if (this.sampleResetCallback) {
            this.sampleResetCallback();
        }
    }

    train() {
        // Known label from state labels: this.state.dataLabels
        // Known list of samples: this.state.accels*, this.state.gyros*
        // Time to process!!!
        var models = [];
        for (var i = 0; i < this.labels.length; i++) {
            models.push({
                label: this.labels[i]
            })
        }

        this.setState({
            modelsDataSource: this.state.modelsDataSource.cloneWithRows(models),
            update: false
        });
    }

    render() {
        return (
            <View style={{ flexDirection: 'column', flex: 1}}>
                <View style={{flex: 0.15}}>
                    <View style={{flexDirection: 'row', flex: 1, margin: 16}}>
                        <View style={{flex: 0.7}}>
                            <Sae
                                label={'Gesture Label'}
                                iconClass={FontAwesomeIcon}
                                iconName={'pencil'}
                                iconColor={'black'}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                onChangeText={(text) => { this.setState({label: text}) }}/>
                        </View>
                        <View style={{flex: 0.3, paddingLeft:20}}>
                            <TouchableHighlight 
                                style={styles.buttonChoice} 
                                onPress={this.addGestureLabel}
                                disabled={(this.state.label == "")}>
                                <Text style={styles.buttonAdd}>Add</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
                <View style={{flex: 0.35}}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                        <View style={{flex: 0.1}}>                        
                            <Text style={styles.titleText}>Samples</Text>
                        </View>
                        <View style={{flex: 0.9}}>    
                            <ListView
                                style={{marginTop: 10}}
                                dataSource={this.state.samplesDataSource}
                                renderRow={(label) => 
                                    <Samples label={this.state.label}
                                            update={this.state.update}/>}/>
                        </View>
                    </View>
                </View>
                <View style={{flex: 0.35}}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                        <View style={{flex: 0.1}}>                        
                            <Text style={styles.titleText}>Detections</Text>
                        </View>
                        <View style={{flex: 0.9}}>                        
                            <ListView
                                style={{marginTop: 10}}
                                dataSource={this.state.modelsDataSource}
                                renderRow={(model) => 
                                    <Recognizer model={model}
                                                accelX={this.state.newAccelX}
                                                accelY={this.state.newAccelY}
                                                accelZ={this.state.newAccelZ}
                                                gyroX={this.state.newGyroX}
                                                gyroY={this.state.newGyroY}
                                                gyroZ={this.state.newGyroZ}/>}/>
                        </View>
                    </View>
                </View>
                <View style={{flex: 0.17}}>
                    <ShowcaseCard>
                        <View style={styles.buttonContainer}>
                            <TouchableHighlight style={styles.buttonChoice} 
                                onPress={this.train} 
                                disabled={(this.state.label == "")}>
                                <Text style={styles.button}>Train</Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={styles.buttonChoice} onPress={this.reset}>
                                <Text style={styles.button}>Reset</Text>
                            </TouchableHighlight>
                        </View>
                    </ShowcaseCard>
                </View>
            </View>
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
        marginBottom: 10,
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
    buttonAdd: {
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
    sampleText: {
        fontSize: 70,
        color: '#000',
        margin: 5,
        textAlign: 'center'
    },
    titleText: {
        fontSize: 30,
        color: '#000',
        marginTop: 85,
        marginLeft: -54,
        width: 150,
        transform: [{ rotate: '270deg'}],
        textAlign: 'center'
    }
}

export default Trainer;