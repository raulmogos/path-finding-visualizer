import React, { Component } from 'react'

import './styles.css'

const size = {
    height: "25px",
    width: "25px",
}

export class Cell extends Component {
    render() {
        return (
            <div
                className="col-xs-4 no-copy"
                style={{
                    height: size.height,
                    width: size.width,
                    backgroundColor: "white",
                    color: "white",
                    border: "1px solid black",
                    borderRadius: "15%",
                    margin: "0.4px",
                }}
                { ...this.props }
            />
        )
    }
}

export default Cell
