import React, { Component } from 'react';
import ShowcaseCard from './decorators/showcase-container'
import { Dimensions } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import GestureSampler from './gesture-sampler';
import SampleViewer from './sample-viewer';
import Trainer from './trainer';

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
  };

class TrainerFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            routes: [
              { key: 'sampler', title: 'Sampler' },
              { key: 'viewer', title: 'Viewer' },
              { key: 'trainer', title: 'Trainer' }
            ],
            accelsX: [],
            accelsY: [],
            accelsZ: [],
            gyrosX: [],
            gyrosY: [],
            gyrosZ: [],
            sampleCount: 0
        };

        this.handleIndexChange = this.handleIndexChange.bind(this);
        this.renderScene = this.renderScene.bind(this);
        this.resetSamples = this.resetSamples.bind(this);
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
        const scenes = {
            'sampler':  <GestureSampler 
                            onSample={this.updateSample}/>,

            'viewer':   <SampleViewer 
                            accelsX={this.state.accelsX}
                            accelsY={this.state.accelsY}
                            accelsZ={this.state.accelsZ}
                            gyrosX={this.state.gyrosX}
                            gyrosY={this.state.gyrosY}
                            gyrosZ={this.state.gyrosZ}/>,

            'trainer':  <Trainer 
                            accelsX={this.state.accelsX}
                            accelsY={this.state.accelsY}
                            accelsZ={this.state.accelsZ}
                            gyrosX={this.state.gyrosX}
                            gyrosY={this.state.gyrosY}
                            gyrosZ={this.state.gyrosZ}
                            sampleCount={this.state.sampleCount}
                            onSampleReset={this.resetSamples}/>
        };

        return scenes[props.route.key];
    }

    resetSamples() {
        this.setState({sampleCount: 0});
    }

    updateSample(accels, gyros) {
        var accelsX = [];
        var accelsY = [];
        var accelsZ = [];
        var gyrosX = [];
        var gyrosY = [];
        var gyrosZ = [];
        length = Math.min(accels.length, gyros.length);
        for(var i = 0; i < length; i++) {
            accelsX[i] = accels[i].x;
            accelsY[i] = accels[i].y;
            accelsZ[i] = accels[i].z;
            gyrosX[i] = gyros[i].x;
            gyrosY[i] = gyros[i].y;
            gyrosZ[i] = gyros[i].z;
        }

        this.setState({ 
            accelsX: accelsX,
            accelsY: accelsY,
            accelsZ: accelsZ,
            gyrosX: gyrosX,
            gyrosY: gyrosY,
            gyrosZ: gyrosZ,
            sampleCount: this.state.sampleCount + 1
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

export default TrainerFlow;