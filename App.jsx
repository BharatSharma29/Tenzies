import React, {useEffect, useState, useRef} from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {

    const [dice, setDice] = useState(allNewDice())
    const [tenzies, setTenzies] = useState(false)
    const count = useRef(0)
    const [value, setValue] = useState(0)
    const intervalId = useRef()
    
    useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            clearInterval(intervalId.current)
            if(localStorage.getItem("time") > value || !localStorage.getItem("time"))
                localStorage.setItem("time", value)
        }
    }, [dice])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            count.current++
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        } else {
            count.current = 0
            setTenzies(false)
            setDice(allNewDice())
            setValue(0)
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    function format(time) {
        if(time === null)
            return null
        let min = Math.floor(time / 60 % 60)
        let sec = Math.floor(time % 60)
        min = min < 10 ? "0" + min : min
        sec = sec < 10 ? "0" + sec : sec
        return min + ":" + sec
    }

    if(!tenzies && value === 0){
        intervalId.current = setInterval(() => {
            setValue(prev => prev + 1)
        }, 1000)
    }

    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <div className="show">
                <span className="timer">{format(value)}</span>
                <button 
                    className="roll-dice" 
                    onClick={rollDice}
                >
                    {tenzies ? "New Game" : `Roll : ${count.current}`}
                </button>
                <span className="best-score">{`Best Score : 
                    ${format(localStorage.getItem("time")) || "00:00"}`}</span>
            </div>
        </main>
    )
}