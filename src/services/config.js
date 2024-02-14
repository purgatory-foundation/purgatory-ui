/*
* General Configuration
*
*/


export const config = {
    // Operators
    operators: [
        {
            name: "OpenSea",
            url: "https://testnets.opensea.io",
            address: "0x1E0049783F008A0085193E00003D00cd54003c71",
            imageUrl: "https://testnets.opensea.io/static/images/logos/opensea.svg",
            network: "Goerli"
        },
        {
            name: "LooksRare",
            url: "https://goerli.looksrare.com",
            address: "0xf8c81f3ae82b6efc9154c69e3db57fd4da57ab6e",
            imageUrl: "'https://stakingcrypto.info/static/assets/coins/looksrare-logo-50.png?v=87",
            network: "Goerli"
        }
    ],
    /// Deafult purgatory times in minutes
    purgatoryTimes: [
        {
            name: "1 minute",
            value: 1
        },
        {
            name: "5 minutes",
            value: 5
        },
        {
            name: "10 minutes",
            value: 10
        },
        {
            name: "30 minutes",
            value: 30
        },
        {
            name: "1 hour",
            value: 60
        },
        {
            name: "24 hours",
            value: 1440
        },
        {
            name: "72 hours",
            value: 4320
        },
        {
            name: "1 week",
            value: 10080
        },
    ]
        
}