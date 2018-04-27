import React, { Component } from 'react';
import { Text, View } from 'react-native';

var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;

const ShowcaseCard1 = ({ children }) => (
    <View style={{
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 16,
        marginRight: 2,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        shadowOffset: {
            height: 2,
            width: 2,
        },
        elevation: 4,
        shadowColor: 'black',
        shadowOpacity: 0.5,
    }}>
        { children }
    </View>
)

const ShowcaseCard2 = ({ children }) => (
    <View style={{
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 2,
        marginRight: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        shadowOffset: {
            height: 2,
            width: 2,
        },
        elevation: 4,
        shadowColor: 'black',
        shadowOpacity: 0.5,
    }}>
        { children }
    </View>
)

class Recognizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: props.model,
            update: false
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.update == true) {
            Recognizer.recognize(nextProps, prevState.model);
        }
    }

    static recognize(props, model) {
        var x = new Array(6);

        nextPowerOf2 = Math.pow( 2, Math.ceil(Math.log(props.accelX.length) / Math.log(2)));
        while(props.accelX.length != nextPowerOf2) {
            props.accelX.push(0);
            props.accelY.push(0);
            props.accelZ.push(0);
            props.gyroX.push(0);
            props.gyroY.push(0);
            props.gyroZ.push(0);
        }

        var frequencies = [];
        var magnitudes = [];

        x[0] = fft(props.accelX);
        frequencies = fftUtil.fftFreq(x[0], 512);
        magnitudes = fftUtil.fftMag(x[0]); 
        x[0] = frequencies.map(function (f, ix) { return {frequency: f, magnitude: magnitudes[ix]}; });
        x[0].sort(function(first, second) {
            return second.magnitude - first.magnitude;
        });
        x[0] = [x[0][0].frequency, x[0][0].magnitude];

        x[1] = fft(props.accelY);
        frequencies = fftUtil.fftFreq(x[1], 512);
        magnitudes = fftUtil.fftMag(x[1]); 
        x[1] = frequencies.map(function (f, ix) { return {frequency: f, magnitude: magnitudes[ix]}; });
        x[1].sort(function(first, second) {
            return second.magnitude - first.magnitude;
        });
        x[1] = [x[1][0].frequency, x[1][0].magnitude];

        x[2] = fft(props.accelZ);
        frequencies = fftUtil.fftFreq(x[2], 512);
        magnitudes = fftUtil.fftMag(x[2]); 
        x[2] = frequencies.map(function (f, ix) { return {frequency: f, magnitude: magnitudes[ix]}; });
        x[2].sort(function(first, second) {
            return second.magnitude - first.magnitude;
        });
        x[2] = [x[2][0].frequency, x[2][0].magnitude];

        x[3] = fft(props.gyroX);
        frequencies = fftUtil.fftFreq(x[3], 512);
        magnitudes = fftUtil.fftMag(x[3]); 
        x[3] = frequencies.map(function (f, ix) { return {frequency: f, magnitude: magnitudes[ix]}; });
        x[3].sort(function(first, second) {
            return second.magnitude - first.magnitude;
        });
        x[3] = [x[3][0].frequency, x[3][0].magnitude];

        x[4] = fft(props.gyroY);
        frequencies = fftUtil.fftFreq(x[4], 512);
        magnitudes = fftUtil.fftMag(x[4]); 
        x[4] = frequencies.map(function (f, ix) { return {frequency: f, magnitude: magnitudes[ix]}; });
        x[4].sort(function(first, second) {
            return second.magnitude - first.magnitude;
        });
        x[4] = [x[4][0].frequency, x[4][0].magnitude];
        
        x[5] = fft(props.gyroZ);
        frequencies = fftUtil.fftFreq(x[5], 512);
        magnitudes = fftUtil.fftMag(x[5]); 
        x[5] = frequencies.map(function (f, ix) { return {frequency: f, magnitude: magnitudes[ix]}; });
        x[5].sort(function(first, second) {
            return second.magnitude - first.magnitude;
        });
        x[5] = [x[5][0].frequency, x[5][0].magnitude];
    
        x = x[0].concat(x[1]).concat(x[2]).concat(x[3]).concat(x[4]).concat(x[5]);

        result = model.forest.predictOne(x);
        console.log("Classification Result: " + result);
    }

    render() {
        return (
            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-start'}}>
                <View style={{ flex: 0.7 }}>
                    <ShowcaseCard1>
                        <Text style={styles.text}>{this.state.model.label}</Text>
                    </ShowcaseCard1>
                </View>
                <View style={{ flex: 0.3 }}>
                    <ShowcaseCard2>
                        <Text style={styles.text}>0</Text>
                    </ShowcaseCard2>
                </View>
            </View>
        );
    }
}

const styles = {
    text: {
        fontSize: 30,
        color: '#000',
        margin: 5,
        textAlign: 'center'
    }
}

export default Recognizer;