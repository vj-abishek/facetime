import React from 'react'

export default function RevievingCall({ RecievingCallClick }) {

    return (
        <div className="App">
            <h1 >Calling...</h1>
            <button className="btn" onClick={RecievingCallClick}>
                <svg className="svg-icon" viewBox="0 0 48 48"><path d="M12.054 24.58C12.52 19.102 24.34 19.002 24.54 19c.202 0 12.024-.1 12.408 5.37.284 4.048-1.092 3.74-1.56 3.778-.41.033-4.823-.767-5.452-1.19-.63-.422-.785-2.703-1.293-3.094-.507-.39-3.092-.51-4.134-.502-1.043.01-3.63.174-4.143.572-.513.4-.702 2.683-1.337 3.117-.636.434-5.062 1.31-5.47 1.283-.47-.03-1.85.3-1.506-3.753"></path></svg>
            </button>
        </div>
    )
}
