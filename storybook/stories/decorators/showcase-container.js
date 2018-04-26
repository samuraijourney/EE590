import React from 'react'
import { View } from 'react-native'

const ShowcaseContainer = ({ children }) => (
    <View style={{
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 16,
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

export default ShowcaseContainer
