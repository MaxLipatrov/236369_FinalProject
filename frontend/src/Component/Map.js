import React, {Component} from "react";
import {Map, TileLayer, Popup, Marker, withLeaflet} from "react-leaflet";
import ReactLeafletSearchComponent from 'react-leaflet-search'
import L from 'leaflet'

import green_png from '../markers/green.png'
import red_png from '../markers/red.png'


const MyMarker = props => {

    const initMarker = ref => {
        if (ref) {
            ref.leafletElement.openPopup()
        }
    };

    return <Marker ref={initMarker} {...props}/>
};


const followedMarker = new L.icon({
    iconUrl: green_png,
    iconSize: new L.Point(25, 35),
});

const otherMarker = new L.icon({
    iconUrl: red_png,
    iconSize: new L.Point(25, 35),
});


class MapExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPos: props.center,
            markerOnStart: props.markerOnStart,
            useMyMarker: props.useMyMarker,
            followers_posts: props.posts,
            other_posts: props.other_posts
        };
        this.handleClick = this.handleClick.bind(this);
        this.renderFollowersMarkers = this.renderFollowersMarkers.bind(this);
        this.renderOthersMarkers = this.renderOthersMarkers.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            currentPos: nextProps.center,
            markerOnStart: nextProps.markerOnStart,
            useMyMarker: nextProps.useMyMarker,
            followers_posts: nextProps.posts,
            other_posts: nextProps.other_posts
        });
    }

    handleClick(e) {
        if (this.props.mutable && this.props.useMyMarker) {
            this.setState({currentPos: e.latlng, markerOnStart: true});

            let lat_input = document.getElementById("latitude-input");
            lat_input.value = e.latlng.lat;

            let long_input = document.getElementById("longitude-input");
            long_input.value = e.latlng.lng;
        }
    }

    renderMarkerPopup(post) {
        return (
            <Popup
                tipSize={5}
                anchor="bottom-right"
                longitude={post.longitude}
                latitude={post.latitude}
            >
                <p>
                    <strong>{post.user_name}</strong>
                    <br/>
                    is travelling to:
                    <br/>
                    latitude: {post.latitude}
                    <br/>
                    longitude: {post.longitude}
                    <br/>
                    on: {new Date(post.start_date).toDateString().split('T')[0]}{" - "}{new Date(post.end_date).toDateString().split('T')[0]}
                    <br/>
                </p>
            </Popup>
        );
    }

    renderFollowersMarkers() {
        return (
            this.state.followers_posts.map((post) => {
                    let pos = [post.latitude, post.longitude];
                    return (
                        <Marker position={pos}
                                icon={followedMarker}>
                            {this.renderMarkerPopup(post)}
                        </Marker>
                    );
                }
            )
        )
    }

    renderOthersMarkers() {
        return (
            this.state.other_posts.map((post) => {
                    let pos = [post.latitude, post.longitude];
                    return (
                        <Marker position={pos} icon={otherMarker}>
                            {this.renderMarkerPopup(post)}
                        </Marker>
                    );
                }
            )
        )
    }


    render() {
        return (
            <div>
                <Map center={this.props.center} zoom={this.props.zoom}
                     onClick={this.handleClick}
                >
                    <TileLayer
                        url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                    {this.state.useMyMarker &&
                    this.state.currentPos &&
                    this.state.markerOnStart &&
                    <MyMarker position={this.state.currentPos}/>}

                    {(this.state.useMyMarker === false) && this.renderFollowersMarkers()}
                    {(this.state.useMyMarker === false) && this.renderOthersMarkers()}

                    <ReactLeafletSearchComponent
                        provider="OpenStreetMap"
                        position="topleft"
                        inputPlaceholder="Where do want to go?"
                        showMarker={true}
                        zoom={5}
                        showPopup={true}
                        mapStateModifier={(latlng) => {
                            let lat_input = document.getElementById("latitude-input");
                            lat_input.value = latlng.lat;

                            let long_input = document.getElementById("longitude-input");
                            long_input.value = latlng.lng;
                        }}
                        closeResultsOnClick={true}
                        openSearchOnLoad={false}
                    />
                </Map>
            </div>
        )
    }
}

export default MapExample;
