
import { useEffect, useState } from "react";
import { useBlockchainContext } from "../context";
import { ethers, utils } from "ethers";
import { Panel, Center } from "./index";
import QRCode from "react-qr-code";
import { parse, build } from '../utils';

export const GenerateQrCode = () => {
    const [state, { dispatch }] = useBlockchainContext();
    const [toAddress, setToAddress] = useState("0x7c6074Bf441C301131635BBA63717D3d5fea31Ab");
    const [functionName, setFunctionName] = useState("");
    const [params, setParams] = useState([]);
    const [url, setUrl] = useState("");
    const [error, setError] = useState();

    const generateQrCode = async () => {
        try {
            let parameters = {
                // 'value': '1000000000000000', // (in WEI)
                // 'gas': '45000', // can be also gasLimit
                // 'gasPrice': '50000000000', // 50 wei
            }
            const validParams = params.filter((param) => ["value", "gas", "gasPrice", "gasLimit", "number", "ethereum_address", "string"].includes(param.name))
            validParams.forEach((param) => { parameters = { ...parameters, [param.name]: param.value } })
            const url = build({
                scheme: 'ethereum',
                prefix: 'pay',
                chain_id: '4002',
                target_address: toAddress,
                function_name: functionName,
                parameters
            });
            setUrl(url);
        } catch (err) {
            setError(err.message);
        }
    }
    const addParams = async () => {
        try {
            let newParams = [...params];
            newParams.push({ name: "", value: "" });
            setParams(newParams);
        } catch (err) {
            setError(err.message)
        }
    }
    const setParam = async (data, index, type = "name") => {
        try {
            let newParams = [...params];
            newParams[index][type] = data;
            setParams(newParams);
        } catch (err) {
            setError(err.message)
        }
    }
    const deleteParam = (index) => {
        let newParams = [...params];
        newParams.splice(index, 1);
        setParams(newParams);
    }

    useEffect(() => {
        console.log("params", params);
    }, [params])

    return (
        <Panel>
            <Center> EIP 831 encode</Center>
            <div >
                <span className="label">QR code : </span>
                <span className="value"> {url} </span>
            </div>
            <div >
                <span className="label">Input contract address : </span>
                <input className="AddressInput" value={toAddress} onChange={(e) => setToAddress(e.target.value)}></input>
            </div>
            <div >
                <span className="label">Input functionName : </span>
                <input className="AddressInput" value={functionName} onChange={(e) => setFunctionName(e.target.value)}></input>
            </div><div >
                <span className="label">Parameters : </span>
                <button onClick={addParams}> add params</button>
            </div>
            <div >
                <span className="paramInput">type </span>
                <span className="paramInput"> value </span>
            </div>
            {params.map((param, index) => (
                <div >
                    <input className="paramInput" value={param.name} onChange={(e) => setParam(e.target.value, index, "name")}></input>
                    <input className="paramInput" value={param.value} onChange={(e) => setParam(e.target.value, index, "value")}></input>
                    <button onClick={() => deleteParam(index)}>delete</button>
                </div>
            ))}
            <div style={{ background: 'white', padding: '16px' }}>
                <QRCode value={url} />
            </div>
            {error && (<div>
                <span className="label">Error : </span>
                {error}
            </div>)}
            <Center>
                <button onClick={generateQrCode}>generateQrCode</button>
            </Center>
        </Panel>
    )
}

export const DecordQrCode = () => {
    const { ethereum } = window;
    const [parsedUrl, setParsedUrl] = useState({
        scheme: 'ethereum',
        target_address: '', // ENS names are also supported!
        chain_id: '1',
        parameters: {}
    });
    const [url, setUrl] = useState("");
    const [error, setError] = useState();
    const [isConnected, setIsConnected] = useState(false);

    const connectWallet = async () => {
        try {
            if (!ethereum) return
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });
            setIsConnected(true);
        } catch (error) {
            setIsConnected(false);
        }
    };

    const getTypeParams = (parsedUrl) => {
        const { parameters } = parsedUrl;
        let contractParamsKeys = []
        let contractParamsValues = []
        let txParams = {};
        if (!parsedUrl.function_name) txParams = { to: parsedUrl.target_address }

        console.log("parameters", parameters);
        if (parameters)
            Object.keys(parameters).forEach(key => {
                // transaction txParams
                if (["value"].includes(key))
                    txParams = { ...txParams, "value": utils.parseUnits(parameters[key], 0) }
                if (["gas", "gasPrice",].includes(key))
                    txParams = { ...txParams, "gasPrice": utils.parseUnits(parameters[key], 0) }
                if (["gasLimit"].includes(key))
                    txParams = { ...txParams, [key]: parameters[key] }
                // contract params
                if (["number", "ethereum_address", "string"].includes(key)) {
                    contractParamsKeys.push(key);
                    contractParamsValues.push(parameters[key]);
                }
            })
        // generate abi
        let temp = 0;
        let abi = `function ${parsedUrl.function_name}(`

        contractParamsKeys.forEach((key) => {
            const type = {
                "ethereum_address": "address",
                "number": " uint",
                "string": "string"
            }
            abi += `${type[key]} param${temp++},`
        })

        if (contractParamsKeys.length == 0) {
            if (Number(txParams['value']) > 0)
                abi = [abi.slice(0, abi.length) + ") payable"];
            else abi = [abi.slice(0, abi.length) + ")"]
        }
        else if (Number(txParams['value']) > 0)
            abi = [abi.slice(0, abi.length - 1) + ") payable"]
        else abi = [abi.slice(0, abi.length - 1) + ")"]

        return { abi, contractParamsValues, txParams }
    }

    const makeTransaction = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(
                ethereum
            );
            const signer = await provider.getSigner();
            console.log("makeTransaction", parsedUrl);
            let { abi, contractParamsValues, txParams } = getTypeParams(parsedUrl)
            if (parsedUrl.function_name) {
                //call smart contract function

                // paramter format
                // generate abi
                console.log("abi", abi);
                let contract = new ethers.Contract(parsedUrl.target_address, abi, signer);
                console.log("contract", contract);
                console.log("contract", contract);
                let tx = await contract[parsedUrl.function_name](...contractParamsValues, { ...txParams });
                await tx.wait();

            } else {
                //send transaction
                let tx = await signer.sendTransaction(txParams);
                await tx.wait();
            }

            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }
    useEffect(() => {
        console.log("parsedUrl", parsedUrl);
    }, [parsedUrl])

    useEffect(() => {
        try {
            const parsedUrl = parse(url)
            setParsedUrl(parsedUrl);
        } catch (err) {
            console.log(err.message);
        }
    }, [url])

    return (
        <Panel>
            <Center> EIP 831 decode</Center>
            <div >
                <span className="label">QR code : </span>
                <input className="AddressInput" value={url} onChange={(e) => setUrl(e.target.value)}></input>
            </div>
            <div >
                <span className="label">contract address : </span>
                <span>{parsedUrl.target_address}</span>
            </div>
            <div >
                <span className="label">functionName : </span>
                <span>{parsedUrl.function_name}</span>
            </div><div >
                <span className="label">Parameters : </span>
            </div>
            <div >
                <span className="paramInput">type </span>
                <span className="paramInput"> value </span>
            </div>
            {
                parsedUrl.parameters ? Object.keys(parsedUrl.parameters).map((key, index) => {
                    return (
                        <div >
                            <span className="paramInput">{key}</span>
                            <span className="paramInput">{parsedUrl.parameters[key]}</span>
                        </div>
                    )
                }) : ""
            }
            {error && (
                <div className="error">
                    <span className="label">Error : </span>
                    {error}
                </div>
            )}
            <Center>
                <button onClick={isConnected ? makeTransaction : connectWallet}>{isConnected ? "makeTransaction" : "connectWallet"}</button>
            </Center>
        </Panel>
    )
}