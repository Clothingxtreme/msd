const solanaWeb3 = require("@solana/web3.js");

function validateSolAddress(address) {
    try {
        return solanaWeb3.PublicKey.isOnCurve(address);
    } catch (e) {
        return false;
    }
}

function getHostnameFromRegex(url) {
    try {
        if (url.toLowerCase().includes("www.")) url = url.replaceAll('www.', '');

        const urlParts = new URL(url).hostname.split('.')
        return urlParts
            .slice(0)
            .slice(-(urlParts.length === 5 ? 4 : 3))
            .join('.')
    } catch (e) {
        console.error(e);
        return "undefined";
    }
}


module.exports = { getHostnameFromRegex, validateSolAddress }