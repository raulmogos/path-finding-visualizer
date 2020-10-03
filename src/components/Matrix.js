import { min } from 'lodash'
import React, { Component } from 'react'
import _ from 'lodash'

import Cell from './Cell'


const size = {
    width: 55,
    height: 27,
}

const cellSize = {
    height: "25px",
    width: "25px",
}

export class Matrix extends Component {

    constructor(props) {
        super(props)
        this.state = {
            matrix: [],
            start: {i: 5, j: 5},
            end: {i: size.height - 5, j: size.width - 5},
            clicked: false,
        }
    }

    componentDidMount() {
        const matrix = [];
        for (let i = 0; i < size.height; i++) {
            const row = []
            for (let j = 0; j < size.width; j++) {
                row.push(0)
            }
            matrix.push(row)
        }
        this.setState({ ...this.state, matrix })
    }


    createCellId = (i, j) => `${i}-${j}`

    getCoordinates = (id) => {
        const coor = id.split('-')
        return {
            i: parseInt(coor[0]),
            j: parseInt(coor[1]),
        }
    }

    changeColorCell = (e) => {
        if (!this.state.clicked || !e.target.id) {
            return
        }
        const {i, j} = this.getCoordinates(e.target.id)
        if (this.isEnd(i, j) || this.isStart(i, j)) {
            return
        }
        e.target.style.backgroundColor = "black"
    }

    getRndInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    colorMapper = (nr) => {
        switch (nr) {
            case -1:
                return "black"
            default:
                return "white"
        }
    }

    valueMapper = (color) => {
        switch (color) {
            case "black":
                return -1
            default:
                return 0
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { start, end } = this.state
        const elem1 = document.getElementById(this.createCellId(start.i, start.j))
        if (elem1) { elem1.style.backgroundColor = "red" }
        const elem2 = document.getElementById(this.createCellId(end.i, end.j))
        if (elem2) { elem2.style.backgroundColor = "blue" }
    }

    computeMatrix = () => {
        const matrix = JSON.parse(JSON.stringify(this.state.matrix))
        for (var i = 0; i < size.height; i++) {
            for (var j = 0; j < size.width; j++) {
                const elem = document.getElementById(this.createCellId(i, j))
                matrix[i][j] = elem.style.backgroundColor == "black" ? -1 : 0
            }
        }
        this.setState({ ...this.state, matrix })
    }
    
    computeBfs = async () => {
        const START = -99
        const { matrix } = this.state
        const pathMatrix = JSON.parse(JSON.stringify(matrix))
        const steps_i = [0, 1, -1,  0]
        const steps_j = [1, 0,  0, -1]
        const { start } = this.state
        const next = [{ ...start, dist: 1}]
        pathMatrix[start.i][start.j] = START
        var found = false
        while (next.length > 0 && !found) {
            const current = next.shift()
            if (!(current.i === start.i && current.j === start.j)) {
                document.getElementById(this.createCellId(current.i, current.j)).style.backgroundColor = "green"
            }
            await this.sleep(1)
            for (let k = 0; k < 4; k++) {
                const next_i = current.i + steps_i[k]
                const next_j = current.j + steps_j[k]
                const next_dist = current.dist + 1
                if (this.isEnd(next_i, next_j)) {
                    found = true
                    break
                }
                if (next_i >= 0 && next_i < size.height && next_j >= 0 && next_j < size.width) {
                    const isVisited = matrix[next_i][next_j] === 1
                    const isWall = matrix[next_i][next_j] === -1
                    const isStartEnd = this.isEnd(next_i, next_j) || this.isStart(next_i, next_j)
                    if (!isVisited && !isWall && !isStartEnd) {
                        next.push({ i: next_i, j: next_j, dist: next_dist})
                        document.getElementById(this.createCellId(next_i, next_j)).style.backgroundColor = "yellow"
                        // document.getElementById(this.createCellId(next_i, next_j)).innerHTML = next_dist - 1
                        pathMatrix[next_i][next_j] = next_dist - 1
                        matrix[next_i][next_j] = 1
                    }
                }
            }
        }

        if (!found) {
            return
        } 

        // construct path
        var current = { ...this.state.end }
        while (pathMatrix[current.i][current.j] !== START) {
            var mini = pathMatrix[current.i][current.j]
            var mini_i = current.i
            var mini_j = current.j
            for (let k = 0; k < 4; k++) {
                const next_i = current.i + steps_i[k]
                const next_j = current.j + steps_j[k]
                if (next_i >= 0 && next_i < size.height && next_j >= 0 && next_j < size.width) {
                    if (pathMatrix[next_i][next_j] === -1) {}
                    else if (mini === 0 || pathMatrix[next_i][next_j] < mini) {
                        mini = pathMatrix[next_i][next_j]
                        mini_i = next_i
                        mini_j = next_j
                    }
                }
            }
            current = { i: mini_i, j: mini_j }
            if (!(current.i === start.i && current.j === start.j)) {
                document.getElementById(this.createCellId(current.i, current.j)).style.backgroundColor = "grey"
                document.getElementById(this.createCellId(current.i, current.j)).innerHTML = pathMatrix[current.i][current.j]
            }
            await this.sleep(70)
        }
    }

    aStarDistance = (cell1, cell2) => {
        const diff_i = Math.abs(cell1.i -cell2.i)
        const diff_j = Math.abs(cell1.j -cell2.j)
        const diff_min = Math.min(diff_i, diff_j)
        const diff_max = Math.max(diff_i, diff_j)
        return diff_min * 14 + diff_max * 10
    }

    computeAStar = async () => {
        const {matrix} = this.state
        // const steps_i = [0, 1, -1,  0,  1, -1,  1, -1]
        // const steps_j = [1, 0,  0, -1,  1, -1, -1,  1]
        const steps_i = [0, 1, -1,  0]
        const steps_j = [1, 0,  0, -1]
        var openList = [ {...this.state.start, f: 0, h: 0, g: 0, parent: null} ]
        const closedList = []
        while (openList.length !== 0) {
            console.log(openList);
            const q = _.minBy(openList, x => x.f)
            console.log(q)
            
            document.getElementById(this.createCellId(q.i, q.j)).style.backgroundColor = "green"
            await this.sleep(10)
            // debugger
            openList = openList.filter(x => x !== q)
            for (var k = 0; k < 8; k++) {
                const next_i = q.i + steps_i[k]
                const next_j = q.j + steps_j[k]
                const isInClosedList = closedList.find(c => c.i === next_i && c.j === next_j)
                if (!isInClosedList && next_i >= 0 && next_i < size.height && next_j >= 0 && next_j < size.width && !(matrix[next_i][next_j] === -1)) {

                    if (this.isEnd(next_i, next_j)) {
                        console.log('end')
                        return
                    }

                    const succ = { i: next_i, j: next_j, parrent: q }
                    // distance from end node
                    const h = this.aStarDistance(succ, this.state.end)
                    // distance from start node
                    const g = this.aStarDistance(succ, this.state.end)
                    const f = h + g
                    const newOne = { ...succ, h, g, f }
                    // check if the new one is already in the list
                    const openFound = openList.find(o => o.i === newOne.i && o.j == newOne.j)
                    const closedFound = closedList.find(c => c.i === newOne.i && c.j == newOne.j)
                    if (!openFound && !closedFound) {
                        openList.push(newOne)
                        document.getElementById(this.createCellId(newOne.i, newOne.j)).style.backgroundColor = "yellow"
                    }
                }
            }
            closedList.push(q)
        }
    }

    isStart = (i, j) => { return i === this.state.start.i && j === this.state.start.j }
    isEnd = (i, j) => { return i === this.state.end.i && j === this.state.end.j }

    makeStyle = (i, j) => {
        if (this.isStart(i, j)) {
            return "red" 
        } else if (this.isEnd(i, j)) {
            return "blue"
        } else {
            return ""
        }
    }

    renderMatrix = () => {
        const jsx = []
        for (var i = 0; i < size.height; i++) {
            const row = []
            for (var j = 0; j < size.width; j++) {
                const id = this.createCellId(i, j)
                row.push(<Cell id={id} key={id} unselectable={true} />)
            }
            jsx.push(<div key={i} className="row" style={{display: "inline-flex", margin: "-5px" }}>{ row }</div>)
        }
        return <div>{ jsx }</div>
    }

    sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    render() {
        const exists = this.state.matrix.length > 0
        return (
            <div
                style={{
                    textAlign: "center",
                    margin: "auto",
                    marginTop: "40px",
                }}
                onMouseDown={() => this.setState({ ...this.state, clicked: true })}
                onMouseUp={() => this.setState({ ...this.state, clicked: false })}
                onMouseMove={this.changeColorCell}
            >
                {exists && this.renderMatrix()}
                <button onClick={this.computeMatrix}>Start</button>
                <button onClick={this.computeBfs}>Start BFS</button>
                <button onClick={this.computeAStar}>Start A8</button>
            </div>
        )
    }
}

export default Matrix
