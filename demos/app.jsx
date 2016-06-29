import React from 'react';
import { render } from 'react-dom';
import './app.less';
import Slider from 'react-touch-slider';


var App = React.createClass({
    render: function(){
        var imgs = [
            'img/1.jpg',
            'img/2.jpg',
            'img/3.jpg',
            'img/4.jpg',
        ];

        return (
            <div>
                <Slider autoPlayInterval={2e3} imgs={imgs}/>
            </div>
        );
    }
});
render(<App/>, document.getElementById('app'));
