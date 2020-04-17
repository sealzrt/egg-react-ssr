import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'

function GetInitialProps(WrappedComponent) {
  class GetInitialPropsClass extends Component {
    constructor(props) {
      super(props)
      this.state = {
        extraProps: {},
        getProps: false
      }
    }

    componentDidMount() {
      const props = this.props;
      console.log(`${WrappedComponent.name} >>> componentDidMount() ******************* begin`, Date.now());
      console.log('props.history.action', props.history.action);

      if (window.__USE_SSR__) {
        window.onpopstate = () => {
          console.log('window.onpopstate()', Date.now());
          this.handleOnPopstate()
        }
      }
      const getProps = !window.__USE_SSR__ || (props.history && props.history.action === 'PUSH');
      console.log(`${WrappedComponent.name} >>> 是否需要调用 'getInitialProps' 获取初始化数据: `, getProps);
      if (getProps) {
        this.getInitialProps();
      }

      console.log(`${WrappedComponent.name} >>> componentDidMount() ******************* end`, Date.now());
    }

    handleOnPopstate() {
      console.log(`${WrappedComponent.name} >>> onpopstate() !!!!!!!!!!!!`);
      this.getInitialProps();
    };

    async getInitialProps() {
      console.log(`${WrappedComponent.name} >>> getInitialProps()`);
      // csr首次进入页面以及csr/ssr切换路由时才调用getInitialProps
      const props = this.props;
      const extraProps = WrappedComponent.getInitialProps ? await WrappedComponent.getInitialProps(props) : {};
      this.setState({
        extraProps,
        getProps: true
      })
    }

    render() {
      console.log(`${WrappedComponent.name} >>> render >>>>>>>>>>>>>>>>>>>>> begin`);
      // 只有在首次进入页面需要将window.__INITIAL_DATA__作为props，路由切换时不需要
      const {getProps, extraProps} = this.state;
      // const initData = getProps ? {} : window.__INITIAL_DATA__;
      let initData = {};
      if(!getProps){
        initData = window.__INITIAL_DATA__;
        // 清除初始化数据
        // window.__INITIAL_DATA__ = {};
      }
      console.log(`${WrappedComponent.name} >>> initData`, initData);
      console.log(`${WrappedComponent.name} >>> extraProps`, extraProps);
      console.log(`${WrappedComponent.name} >>> render >>>>>>>>>>>>>>>>>>>>> end`);
      return <WrappedComponent {...Object.assign({}, this.props, initData, extraProps)} />
    }
  }

  return withRouter(GetInitialPropsClass)
}

export default GetInitialProps
