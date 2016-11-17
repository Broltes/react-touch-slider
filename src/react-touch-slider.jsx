import React from 'react';
import './touch-slider.less';

// 拖拽的缓动公式 - easeOutSine
function easing(distance) {
    // t: current time, b: begInnIng value, c: change In value, d: duration
    var t = distance;
    var b = 0;
    var d = screen.availWidth; // 允许拖拽的最大距离
    var c = d / 2.5; // 提示标签最大有效拖拽距离

    return c * Math.sin(t / d * (Math.PI / 2)) + b;
}

export default React.createClass({
    getDefaultProps: function() {
        return {
            loop: true,
            actionDistance: 30// 触发切换动作需要滑动的距离
        };
    },
    getInitialState() {
        return {
            currentIndex: 0,
            transition: 1,// 是否需要缓动
            action: 0,
            x0: 0// x轴滑动偏移量
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

    touchStart(e) {
        this.stopAutoPlay();
        if(this.state.x0) this.transitionEnd();// reset

        // 设置起始触点用于跟踪拖拽
        if(e.touches.length == 1) {
            this._initialTouch = {
                clientX: e.touches[0].clientX
            };

            this.setState({
                transition: 0
            });
        }
    },
    touchMove(e) {
        var x0 = e.touches[0].clientX - this._initialTouch.clientX;
        var realX0;
        var {
            state: { currentIndex },
            props: { imgs, loop }
        } = this;

        if(!loop) {
            var maxIndex = this._maxIndex = imgs.length - 1;
            var minIndex = this._minIndex = 0;

            // 第一张图片向右滑动缓动
            if(currentIndex == minIndex && x0 > 0) realX0 = easing(x0);
            // 最后一张向左滑动缓动
            else if(currentIndex == maxIndex && x0 < 0) realX0 = -easing(-x0);
        }

        // 响应滚动
        if(Math.abs(x0) > 5 && !realX0) realX0 = x0;

        if(realX0) {
            e.preventDefault();
            this.setState({ x0: realX0 });
        }
    },
    touchEnd() {
        var {
            state: { x0, currentIndex },
            props: { loop, actionDistance, onOverSlide },
            _minIndex, _maxIndex, step
        } = this;
        var actionable = Math.abs(x0) > actionDistance;

        if(!loop) {
            // 第一张图片向右滑动缓动
            // 最后一张向左滑动缓动
            if(currentIndex == _minIndex && x0 > 0 || currentIndex == _maxIndex && x0 < 0) {
                if(actionable) onOverSlide && onOverSlide(currentIndex);

                return step(0);
            }
        }

        // 判断拖拽动作
        if(actionable) step(x0 > 0 ? -1 : 1);
        else step(0);
    },


    // 切换动效
    step(action){
        if(this.state.action) this.transitionEnd();// reset

        var nextState = {
            transition: 1
        };
        if(action) nextState.action = action;
        else nextState.x0 = 0;

        this.setState(nextState);
    },
    // 切换动效完成，更新状态
    // 并不能总是触发，需要在引用状态前(自动、手动执行下一个轮播)做检查
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
        const { autoPlayInterval, imgs } = this.props;
        if(autoPlayInterval && imgs && imgs[0]) this.startAutoPlay();
    },
    componentWillUnmount(){
        this.stopAutoPlay();
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

    click(e) {
        const { onClick } = this.props;

        if(onClick) onClick(this.state.currentIndex, e);
    },

    render(){
        var { imgs, className = '', loop } = this.props;
        if(!imgs || !imgs[0]) return null;

        var { currentIndex, action, x0, transition } = this.state;
        var { touchStart, touchMove, touchEnd, transitionEnd, click } = this;

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

        // transform3d 在 safari 滚动时会遮挡 position absolute
        var transitionX = action ? (-action * 33.333 + '%') : (x0 + 'px');

        return (
            <div className={'tslider' + (loop ? ' ' : ' _loopless ') + className}
                onClick={click}
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
