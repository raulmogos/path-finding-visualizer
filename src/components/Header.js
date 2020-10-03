import React, { Component } from 'react'

export class Header extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg" style={{margin: "auto", width: "70%"}}>
                  <div className="navbar-brand" href="#">A*</div>
                  <div className="navbar-brand" href="#">BFS</div>
            </nav>
        )
    }
}

export default Header
