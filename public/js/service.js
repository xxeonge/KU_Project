import { connectWallet, inTimestamp, outTimestamp } from "./common.js";

document.addEventListener("DOMContentLoaded",async(event) =>{
	await connectWallet();
});

const inbtn = document.getElementById('inBtn');
inbtn.addEventListener('click', async () => {
    await inTimestamp();
});

const outbtn = document.getElementById('outBtn');
outbtn.addEventListener('click', async () => {
    await outTimestamp();
});








