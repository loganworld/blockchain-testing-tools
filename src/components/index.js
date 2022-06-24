
import { useState } from "react";
import { useBlockchainContext } from "../context";
import { ethers } from "ethers";

export const CreatePanel = () => {
    const [wallet, setWallet] = useState({ address: "", GAddress: "", privateKey: "" });
    const createWallet = () => {
        const wallet = ethers.Wallet.createRandom();
        setWallet(wallet);
    }
    return (
        <Panel>
            <Center> create wallet</Center>
            <div >
                <span className="label">Address : </span>
                {wallet.address}
            </div>
            <div className="label">
                <span className="label">Key : </span>
                {wallet.privateKey}
            </div>
            <Center>
                <button onClick={createWallet}>createWallet</button>
            </Center>
        </Panel>
    )
}
export const BalancePanel = () => {
    const [state] = useBlockchainContext();
    const [address, setAddress] = useState("");
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState();

    const getBalance = async () => {
        try {
            const balance = await state.provider.getBalance(address);
            setBalance(ethers.utils.formatUnits(balance));
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Panel>
            <Center>check balance</Center>
            <div >
                <span className="label">Address : </span>
                <input className="AddressInput" value={address} onChange={(e) => setAddress(e.target.value)}></input>
            </div>
            <div>
                <span className="label">Balance : </span>
                {balance}
            </div>
            {error && (<div>
                <span className="label">Error : </span>
                {error}
            </div>)}
            <Center>
                <button onClick={getBalance}>getBalance</button>
            </Center>
        </Panel>
    )
}
export const SignerPanel = () => {
    const [state, { dispatch }] = useBlockchainContext();
    const [privateKey, setPrivateKey] = useState("");
    const [error, setError] = useState();

    const addSigner = async () => {
        try {
            const wallet = new ethers.Wallet(privateKey, state.provider);
            const balance = await state.provider.getBalance(wallet.address);
            dispatch({
                type: "signer",
                payload: wallet
            })
            dispatch({
                type: "balance",
                payload: ethers.utils.formatUnits(balance)
            })
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Panel>
            <Center> Add signer</Center>
            <div >
                <span className="label">current Address : </span>
                {state.signer?.address}
            </div>
            <div >
                <span className="label">balance : </span>
                {state.balance}
            </div>
            <div >
                <span className="label">Input privateKey : </span>
                <input className="AddressInput" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)}></input>
            </div>
            {error && (<div>
                <span className="label">Error : </span>
                {error}
            </div>)}
            <Center>
                <button onClick={addSigner}>addSigner</button>
            </Center>
        </Panel>
    )
}
export const ActionPanel = () => {
    const [state, { dispatch }] = useBlockchainContext();
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState();
    const [tx, setTx] = useState("");

    const sendTransaction = async () => {
        try {
            for (let i = 0; i < 100; i++) {
                let value = ethers.utils.parseUnits(Number(amount).toFixed(18));
                const styledData = { toAddress, value };
                Object.keys(styledData).forEach((key) => styledData[key] == null && delete styledData[key]);
                let tx = await state.signer.sendTransaction(styledData);
                setTx(tx.hash);
                setError(null);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Panel>
            <Center> Actions</Center>
            <div >
                <span className="label">current Address : </span>
                {state.signer?.GAddress}
            </div>
            <div >
                <span className="label">Input receiver address : </span>
                <input className="AddressInput" value={toAddress} onChange={(e) => setToAddress(e.target.value)}></input>
            </div>
            <div >
                <span className="label">Input amount : </span>
                <input className="AddressInput" type={Number} value={amount} onChange={(e) => setAmount(e.target.value)}></input>
            </div>
            {tx && (<div>
                <span className="label">tx hash : </span>
                {tx}
            </div>)}
            {error && (<div>
                <span className="label">Error : </span>
                {error}
            </div>)}
            <Center>
                <button onClick={sendTransaction}>send Transaction</button>
            </Center>
        </Panel>
    )
}

export const Panel = ({ children }) => {
    return (
        <div className="Panel">
            {children}
        </div>
    )

}

export const Center = ({ children }) => {
    return (
        <div className='Center'>
            {children}
        </div>
    )
}