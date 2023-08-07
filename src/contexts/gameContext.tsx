'use client'
import { createContext, PropsWithChildren, useContext, useState } from "react";

type Number = {
    value: string,
    qty: number
  }

type GameContextType = {
    numbers: Number[],
    maxInventoryNumber: number,
    expiresAt: number,
    editGameContext: (data: any, typeOfUpdate: String) => void;
}

const initalState: GameContextType = {
    numbers: [],
    maxInventoryNumber: 0,
    expiresAt: 0,
    editGameContext: () => {},
}

const GameContext = createContext(initalState);
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }: PropsWithChildren<{}>) => {
    const [numbers, setNumbers] = useState<Number[]>([]);
    const [expiresAt, setExpiresAt] = useState(0);
    const [maxInventoryNumber, setMaxInventoryNumber] = useState(0);

    const editGameContext = (data: any, type: String) => {
        switch (type) {
            case 'numbers':
                setNumbers(data);
                break;
            case 'expiresAt':
                setExpiresAt(data);
                break;
            case 'maxInventoryNumber':
                setMaxInventoryNumber(data);
                break;
            default:
                break;
        }
    }
    return (
        <GameContext.Provider value={{ editGameContext, maxInventoryNumber, numbers, expiresAt }}>
            {children}
        </GameContext.Provider>
    );
};