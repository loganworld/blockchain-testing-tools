import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useCallback,
    useEffect,
} from "react";

import { ethers } from "ethers";

const BlockchainContext = createContext();
export function useBlockchainContext() {
    return useContext(BlockchainContext);
}

function reducer(state, { type, payload }) {
    return {
        ...state,
        [type]: payload,
    };
}

const INIT_STATE = {
    signer: "",
    provider: new ethers.providers.JsonRpcProvider("https://rpc.testnet.fantom.network/"),
    tokenBalance: 0,
    balance: 0,
    price: 3000,
};

export default function Provider({ children }) {
    const [state, dispatch] = useReducer(reducer, INIT_STATE);

    return (
        <BlockchainContext.Provider
            value={useMemo(
                () => [
                    state, { dispatch }
                ],
                [state]
            )}>
            {children}
        </BlockchainContext.Provider>
    );
}