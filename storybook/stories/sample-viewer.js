import React, { Component } from 'react';
import { ScrollView, Text, View } from 'react-native';
import ShowcaseCard from './decorators/showcase-container'
import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { LineChart, YAxis, Grid } from 'react-native-svg-charts'

class SampleViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accelsX: this.props.accelsX,
            accelsY: this.props.accelsY,
            accelsZ: this.props.accelsZ,
            gyrosX: this.props.gyrosX,
            gyrosY: this.props.gyrosY,
            gyrosZ: this.props.gyrosZ
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            accelsX: nextProps.accelsX,
            accelsY: nextProps.accelsY,
            accelsZ: nextProps.accelsZ,
            gyrosX: nextProps.gyrosX,
            gyrosY: nextProps.gyrosY,
            gyrosZ: nextProps.gyrosZ 
        };
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

        return (
            <ScrollView 
                horizontal={false}
                decelerationRate={0}
                showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'column', flex: 1}}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.titleText}>Accelerometer X</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ShowcaseCard>
                            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
                            <YAxis
                                data={ this.state.accelsX }
                                contentInset={ contentInset }
                                svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                }}
                                numberOfTicks={ 10 }/>
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={ this.state.accelsX }
                                contentInset={ contentInset }
                                svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
                                <Gradient/>
                                <Grid/>
                            </LineChart>
                            </View>
                        </ShowcaseCard>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.titleText}>Accelerometer Y</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ShowcaseCard>
                            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
                            <YAxis
                                data={ this.state.accelsY }
                                contentInset={ contentInset }
                                svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                }}
                                numberOfTicks={ 10 }/>
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={ this.state.accelsY }
                                contentInset={ contentInset }
                                svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
                                <Gradient/>
                                <Grid/>
                            </LineChart>
                            </View>
                        </ShowcaseCard>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.titleText}>Accelerometer Z</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ShowcaseCard>
                            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
                            <YAxis
                                data={ this.state.accelsZ }
                                contentInset={ contentInset }
                                svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                }}
                                numberOfTicks={ 10 }/>
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={ this.state.accelsZ }
                                contentInset={ contentInset }
                                svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
                                <Gradient/>
                                <Grid/>
                            </LineChart>
                            </View>
                        </ShowcaseCard>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.titleText}>Magnetometer X</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ShowcaseCard>
                            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
                            <YAxis
                                data={ this.state.gyrosX }
                                contentInset={ contentInset }
                                svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                }}
                                numberOfTicks={ 10 }/>
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={ this.state.gyrosX }
                                contentInset={ contentInset }
                                svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
                                <Gradient/>
                                <Grid/>
                            </LineChart>
                            </View>
                        </ShowcaseCard>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.titleText}>Magnetometer Y</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ShowcaseCard>
                            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
                            <YAxis
                                data={ this.state.gyrosY }
                                contentInset={ contentInset }
                                svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                }}
                                numberOfTicks={ 10 }/>
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={ this.state.gyrosY }
                                contentInset={ contentInset }
                                svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
                                <Gradient/>
                                <Grid/>
                            </LineChart>
                            </View>
                        </ShowcaseCard>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.titleText}>Magnetometer Z</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ShowcaseCard>
                            <View style={{ height: 200, width: 348, flexDirection: 'row' }}>
                            <YAxis
                                data={ this.state.gyrosZ }
                                contentInset={ contentInset }
                                svg={{
                                    fill: 'grey',
                                    fontSize: 10,
                                }}
                                numberOfTicks={ 10 }/>
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={ this.state.gyrosZ }
                                contentInset={ contentInset }
                                svg={{strokeWidth: 2, stroke: 'url(#gradient)'}}>
                                <Gradient/>
                                <Grid/>
                            </LineChart>
                            </View>
                        </ShowcaseCard>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const styles = {
    titleText: {
        fontSize: 30,
        color: '#000',
        margin: 5,
        textAlign: 'center'
    }
}

export default SampleViewer;