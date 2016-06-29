import React from 'react';
import './touch-slider.less';

export default React.createClass({
    getDefaultProps: function () {
        return {
            actionDistance: 30,// 触发切换动作需要滑动的距离
        };
    },
    getInitialState() {
        return {
            currentIndex: 0,
            transition: 1,// 是否需要缓动
            action: 0,
            x0: 0,// x轴滑动偏移量
        };
    },

    valiIndex(index){
        var { imgs } = this.props;

        // 处理循环
        var firstIndex = 0;
        var lastIndex = imgs.length - 1;
        if(index < firstIndex) index = lastIndex;
        else if(index > lastIndex) index = firstIndex;

        return index;
    },
    step(action){
        var nextState = {
            transition: 1,
        };
        if(action) nextState.action = action;
        else nextState.x0 = 0;

        this.setState(nextState);
    },

    touchStart(e) {
        this.stopAutoPlay();
        if(this.state.x0) this.transitionEnd();// reset

        // 设置起始触点用于跟踪拖拽
        if(e.touches.length == 1) {
            this._initialTouch = {
                clientX: e.touches[0].clientX,
            };

            this.setState({
                transition: 0
            });
        }
    },
    touchMove(e) {
        var x0 = e.touches[0].clientX - this._initialTouch.clientX;

        if(Math.abs(x0) > 10) {// 响应滚动
            e.preventDefault();// 减弱滑动时的点击
            this.setState({ x0 });
        }
    },
    touchEnd(e) {
        var action = 0;
        var actionDistance = 30;// 触发切换动作需要拖拽的距离
        var { x0 } = this.state;

        // 判断拖拽动作
        if(Math.abs(x0) > this.props.actionDistance) action = x0 > 0 ? -1 : 1;

        this.step(action);
    },
    transitionEnd(){
        var { currentIndex, action } = this.state;

        this.setState({
            transition: 0,
            x0: 0,
            action: 0,
            currentIndex: this.valiIndex(currentIndex + action)
        });
        this.startAutoPlay();
    },

    componentDidMount(){
        if(this.props.autoPlayInterval) this.startAutoPlay();
    },
    startAutoPlay(){
        var { autoPlayInterval } = this.props;
        var { _autoPlayIntervalId } = this;
        if(!autoPlayInterval || _autoPlayIntervalId) return;

        // start auto play
        this._autoPlayIntervalId = setInterval(function() {
            this.step(1);
        }.bind(this), autoPlayInterval);
    },
    stopAutoPlay(){
        var { autoPlayInterval } = this.props;
        if(!autoPlayInterval) return;

        clearInterval(this._autoPlayIntervalId);
        this._autoPlayIntervalId = 0;
    },

    render(){
        var { imgs } = this.props;
        var { currentIndex, action, x0, transition } = this.state;
        var { valiIndex, touchStart, touchMove, touchEnd, transitionEnd } = this;

        // 一次性加载全部图片，防止切换时重新加载，待优化
        var items = imgs.slice(-1).concat(imgs).concat(imgs[0]).map(function(img, i) {
            var d = i - currentIndex;
            var visible = d >= 0 && d <= 2;

            return (
                <div key={i} className={visible ? 'tslider-item' : 'tslider-none'}>
                    <img src={img}/>
                </div>
            );
        });

        var dots = imgs.map(function(img, i) {
            return <i key={i} className={currentIndex == i ? 'on' : ''}/>;
        });

        var transitionX = action ? (-action * 33.333 + '%') : (x0 + 'px');

        return (
            <div className="tslider"
                onTouchStart={touchStart}
                onTouchMove={touchMove}
                onTouchEnd={touchEnd}>

                <div style={{WebkitTransform: `translate3d(${transitionX},0,0)`}}
                    onTransitionEnd={transitionEnd}
                    className={'tslider-items ' + (transition ? 'transition': '')}>
                    {items}
                </div>
                <div className="tslider-dots">{dots}</div>
            </div>
        );
    }
});
