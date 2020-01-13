import React, {Component} from "react";
import {Map, TileLayer, Popup, Marker, withLeaflet} from "react-leaflet";


const MyMarker = props => {

    const initMarker = ref => {
        if (ref) {
            ref.leafletElement.openPopup()
        }
    };

    return <Marker ref={initMarker} {...props}/>
};

class MapExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPos: null
        };
        this.handleClick = this.handleClick.bind(this);
    }


    handleClick(e) {
        this.setState({currentPos: e.latlng});
        let lat_input = document.getElementById("latitude-input");
        lat_input.value = e.latlng.lat;
        lat_input.dispatchEvent(new Event('change', {bubbles: true}));

        let long_input = document.getElementById("longitude-input");
        long_input.value = e.latlng.lng;
        long_input.dispatchEvent(new Event('change', {bubbles: true}));


    }

    render() {
        return (
            <div>
                <Map center={this.props.center} zoom={this.props.zoom} onClick={this.handleClick}>
                    <TileLayer
                        url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                    {this.state.currentPos && <MyMarker position={this.state.currentPos}>
                    </MyMarker>}
                </Map>
            </div>
        )
    }
}

export default MapExample;
