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

class Samples extends Component {
    constructor(props) {
        super(props);
        this.state = {
            label: props.label,
            sampleCount: 0,
            update: false
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if ((nextProps.update == true) && (nextProps.label == prevState.label)) {
            return {
                sampleCount: prevState.sampleCount + 1
            }
        }
    }

    render() {
        return (
            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-start'}}>
                <View style={{ flex: 0.7 }}>
                    <ShowcaseCard1>
                        <Text style={styles.text}>{this.state.label}</Text>
                    </ShowcaseCard1>
                </View>
                <View style={{ flex: 0.3 }}>
                    <ShowcaseCard2>
                        <Text style={styles.text}>{this.state.sampleCount}</Text>
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

export default Samples;