
export const shortenHash = (hash: string) => {
    return hash.substring(0,7) + "..." + hash.substring(38);
}
export const formatDate = (val: Date | string) => {
    if(typeof val === 'string') {
        val = new Date(val);
    }

    return val.toUTCString().substring(4,val.toUTCString().length - 7);
}
export const isUserWinner = (address: `0x${string}` | undefined, dataWinners: []) => {

    if(address && dataWinners) {
        if((dataWinners as []).map((v: any) => v.map((w: any) => w.addr).includes(address.toString())).includes(true)){
          return true;
        }
      }

    return false;
}