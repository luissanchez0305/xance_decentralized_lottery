
export const shortenHash = (hash: string) => {
    return hash.substring(0,7) + "..." + hash.substring(38);
}
export const formatDate = (val: Date) => {
    return val.toLocaleDateString('es-ES', 
        { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric' 
        }).toUpperCase()
}