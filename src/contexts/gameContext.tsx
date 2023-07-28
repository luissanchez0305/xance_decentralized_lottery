'use client'
import { createContext, PropsWithChildren, useContext, useState } from "react";

type Number = {
    value: string,
    qty: number
  }

type GameContextType = {
    numbers: Number[],
    editGameContext: (data: any, typeOfUpdate: String) => void;
}

const initalState: GameContextType = {
    numbers: [],
    editGameContext: () => {},
}

const GameContext = createContext(initalState);
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }: PropsWithChildren<{}>) => {
    const [numbers, setNumbers] = useState<Number[]>([]);

    const editGameContext = (data: any, type: String) => {
        switch (type) {
            case 'numbers':
                setNumbers(data);
                break;
            default:
                break;
        }
    }
    return (
        <GameContext.Provider value={{ editGameContext, numbers }}>
            {children}
        </GameContext.Provider>
    );
};