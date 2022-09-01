import './App.css';
import React, { useState, useEffect } from "react";
import { useBlockchainContext } from "./context";
import { ethers } from "ethers";
import { CreatePanel, BalancePanel, SignerPanel, ActionPanel, Gthers, Panel, Center } from "./components";
import { GenerateQrCode, DecordQrCode } from "./components/eip831";

function App() {
    const [state, { dispatch }] = useBlockchainContext();

    return (
        <div className="App">
            <div className='space30'></div>
            <Center> EIP831 encoder </Center>
            <div className='divs'>
                {/*
                    <CreatePanel />
                    <BalancePanel />
                    <SignerPanel />
                    <ActionPanel />
                    <DecordQrCode />
                */}
                <GenerateQrCode />
            </div>
        </div>
    );
}


export default App;
