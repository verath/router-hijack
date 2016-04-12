/**
 * The IPAddress class represents an IPv4 address.
 */
class IPAddress {
    private bytes:Uint8Array = new Uint8Array(4);

    /**
     * Creates a new IPAddress from the provided address array. The array is
     * assumed to represent an IPv4 address, with the most significant number
     * in the first position.
     *
     * @param address
     */
    constructor(address:number[]) {
        if (address.length !== 4) {
            throw new Error('ipString must be a valid IPv4 address, was: ' + address.join('.'));
        }
        if (!address.every(part => part >= 0 && part <= 255)) {
            throw new Error('ipString must be a valid IPv4 address, was: ' + address.join('.'));
        }
        for (let i = 0; i < 4; i++) {
            this.bytes[i] = address[i];
        }
    }

    /**
     * Creates an IPAddress from a well formed string representation,
     * e.g. '192.168.0.1'.
     *
     * @param ipString
     * @returns {IPAddress}
     */
    public static fromString(ipString:string):IPAddress {
        let parts = ipString.split('.').map(part => parseInt(part, 10));
        return new IPAddress(parts);
    }

    public getAddressBytes():number[] {
        return [].slice.call(this.bytes);
    }

    /**
     * Returns a boolean indicating if the IPAddress represented is part of
     * a private IPv4 address range. These are defined as:
     *  - 10.0.0.0 - 10.255.255.255
     *  - 192.168.0.0 - 192.168.255.255
     *  - 172.16.0.0 - 172.31.255.255
     *
     * @returns {boolean} True if part of a private range.
     */
    public isPrivate():boolean {
        // See https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces

        // 10.0.0.0 - 10.255.255.255
        if (this.bytes[0] === 10) {
            return true;
        }

        // 192.168.0.0 - 192.168.255.255
        if (this.bytes[0] === 192 && this.bytes[1] === 168) {
            return true;
        }

        // 172.16.0.0 - 172.31.255.255
        if (this.bytes[0] === 172) {
            if (this.bytes[1] >= 16 && this.bytes[1] <= 31) {
                return true;
            }
        }

        return false;
    }

    public toString():string {
        return this.bytes.join('.');
    }

    public equals(other:IPAddress) {
        return (
            other != null
            && other.bytes[0] === this.bytes[0]
            && other.bytes[1] === this.bytes[1]
            && other.bytes[2] === this.bytes[2]
            && other.bytes[3] === this.bytes[3]
        )
    }
}

export default IPAddress;
