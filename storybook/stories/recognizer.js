import React, { Component } from 'react';
import { Text, View } from 'react-native';

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
            accelX: 0,
            accelY: 0,
            accelZ: 0,
            gyroX: 0,
            gyroY: 0,
            gyroZ: 0
        };

        this.recognize = this.recognize.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            accelX: nextProps.accelX,
            accelY: nextProps.accelY,
            accelZ: nextProps.accelZ,
            gyroX: nextProps.gyroX,
            gyroY: nextProps.gyroY,
            gyroZ: nextProps.gyroZ
        };
    }

    recognize() {
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