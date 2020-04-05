import React from 'react';
import './App.css';
import Main from './Main.js';
import Footer from './Footer';
import NavBar from './nav';

function App() {
    return (
        <div className="App">
            <nav className="App-nav">
                <NavBar />
            </nav>
            <header className="App-header">
                <Main />
            </header>
            <footer className="App-footer">
                <Footer />
            </footer>
        </div>
    );
}

export default App;
