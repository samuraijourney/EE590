import React, { Component } from 'react';
import ShowcaseCard from './decorators/showcase-container'
import { Dimensions } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import GestureSampler from './gesture-sampler';
import SampleViewer from './sample-viewer';

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
  };

class Trainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            routes: [
              { key: 'sampler', title: 'Gesture Sampler' },
              { key: 'viewer', title: 'Sample Viewer' },
            ],
            accelsX: [],
            accelsY: [],
            accelsZ: [],
            gyrosX: [],
            gyrosY: [],
            gyrosZ: []
        };

        this.accelsX = [];
        this.accelsY = [];
        this.accelsZ = [];
        this.gyrosX = [];
        this.gyrosY = [];
        this.gyrosZ = [];

        this.handleIndexChange = this.handleIndexChange.bind(this);
        this.renderScene = this.renderScene.bind(this);
        this.updateSample = this.updateSample.bind(this);
    }

    handleIndexChange(index) {
        this.setState({ index: index });
    }

    renderHeader(props) {
        return (
            <TabBar {...props} />
        );
    }

    renderScene(props) {
        console.log(props.route.key)
        console.log(this.state.index)
        const scenes = {
            'sampler':  <GestureSampler 
                            onSample={this.updateSample}/>,

            'viewer':   <SampleViewer 
                            accelsX={this.state.accelsX}
                            accelsY={this.state.accelsY}
                            accelsZ={this.state.accelsZ}
                            gyrosX={this.state.gyrosX}
                            gyrosY={this.state.gyrosY}
                            gyrosZ={this.state.gyrosZ}/>
        };

        return scenes[props.route.key];
    }

    updateSample(accels, gyros) {
        this.accelsX = [];
        this.accelsY = [];
        this.accelsZ = [];
        this.gyrosX = [];
        this.gyrosY = [];
        this.gyrosZ = [];
        length = Math.min(accels.length, gyros.length);
        for(var i = 0; i < length; i++) {
            this.accelsX[i] = accels[i].x;
            this.accelsY[i] = accels[i].y;
            this.accelsZ[i] = accels[i].z;
            this.gyrosX[i] = gyros[i].x;
            this.gyrosY[i] = gyros[i].y;
            this.gyrosZ[i] = gyros[i].z;
        }

        this.setState({ 
            accelsX: this.accelsX,
            accelsY: this.accelsY,
            accelsZ: this.accelsZ,
            gyrosX: this.gyrosX,
            gyrosY: this.gyrosY,
            gyrosZ: this.gyrosZ 
        });
    }

    render() {
        return (
            <TabViewAnimated
                navigationState={this.state}
                renderScene={this.renderScene}
                renderHeader={this.renderHeader}
                onIndexChange={this.handleIndexChange}
                initialLayout={initialLayout}
            />
        );
    }
}

export default Trainer;