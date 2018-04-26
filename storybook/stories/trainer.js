import React, { Component } from 'react';
import { ListView, Text, View, TouchableHighlight } from 'react-native';
import ShowcaseCard from './decorators/showcase-container'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Sae } from 'react-native-textinput-effects';
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
            dataSource: ds.cloneWithRows([]),
            gyrosX: [],
            gyrosY: [],
            gyrosZ: [],
            label: "",
            models: [],
            newAccelX: 0,
            newAccelY: 0,
            newAccelZ: 0,
            newGyroX: 0,
            newGyroY: 0,
            newGyroZ: 0,
            sampleCount: 0
        };

        this.reset = this.reset.bind(this);
        this.train = this.train.bind(this);
        this.sampleResetCallback = this.props.onSampleReset;
        
        this.models = [];
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.accelsX.length > 0) {
            prevState.accelsX.push(nextProps.accelsX);
            prevState.accelsY.push(nextProps.accelsY);
            prevState.accelsZ.push(nextProps.accelsZ);
            prevState.gyrosX.push(nextProps.gyrosX);
            prevState.gyrosY.push(nextProps.gyrosY);
            prevState.gyrosZ.push(nextProps.gyrosZ);
        }

        return {
            accelsX: prevState.accelsX,
            accelsY: prevState.accelsY,
            accelsZ: prevState.accelsZ,
            gyrosX: prevState.gyrosX,
            gyrosY: prevState.gyrosY,
            gyrosZ: prevState.gyrosZ,
            newAccelX: nextProps.accelsX,
            newAccelY: nextProps.accelsY,
            newAccelZ: nextProps.accelsZ,
            newGyroX: nextProps.gyrosX,
            newGyroY: nextProps.gyrosY,
            newGyroZ: nextProps.gyrosZ,
            sampleCount: nextProps.sampleCount
        };
    }

    reset() {
        this.setState({
            accelsX: [],
            accelsY: [],
            accelsZ: [],
            gyrosX: [],
            gyrosY: [],
            gyrosZ: [],
            sampleCount: 0
        });

        if (this.sampleResetCallback) {
            this.sampleResetCallback();
        }
    }

    train() {
        // Known label from state label
        // Known list of samples
        // Time to process!!!
        var model = {
            label: this.state.label
        }
        this.models.push(model);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.models),
            models: this.models
        });
        this.reset();
    }

    render() {
        return (
            <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'flex-start'}}>
                <View>
                    <Text style={styles.titleText}>Gesture Label</Text>
                </View>
                <View style={{margin: 16}}>
                    <Sae
                        style={{ backgroundColor: '#ddd', borderRadius: 40 }}
                        iconClass={FontAwesomeIcon}
                        iconName={'pencil'}
                        iconColor={'black'}
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        onChangeText={(text) => { this.setState({label: text}) }}/>
                </View>
                <View>
                    <Text style={styles.titleText}>Sample Count</Text>
                </View>
                <ShowcaseCard>
                    <Text style={styles.sampleText}>{this.state.sampleCount}</Text>
                </ShowcaseCard>
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
                <ListView
                    style={{marginTop: 10}}
                    dataSource={this.state.dataSource}
                    renderRow={(model) => 
                        <Recognizer model={model}
                                    accelX={this.state.newAccelX}
                                    accelY={this.state.newAccelY}
                                    accelZ={this.state.newAccelZ}
                                    gyroX={this.state.newGyroX}
                                    gyroY={this.state.newGyroY}
                                    gyroZ={this.state.newGyroZ}/>}/>
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
    sampleText: {
        fontSize: 70,
        color: '#000',
        margin: 5,
        textAlign: 'center'
    },
    titleText: {
        fontSize: 30,
        color: '#000',
        margin: 5,
        textAlign: 'center'
    }
}

export default Trainer;