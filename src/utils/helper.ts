
export const shortenHash = (hash: string) => {
    return hash.substring(0,7) + "..." + hash.substring(38);
}
export const formatDate = (val: Date | string) => {
    if(typeof val === 'string') {
        val = new Date(val);
    }

    return val.toUTCString().substring(4,val.toUTCString().length - 7);
}