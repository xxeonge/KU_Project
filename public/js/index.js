import { connectWallet, checkMember } from "./common.js";

// 버튼 클릭 이벤트 핸들러
const connectBtn = document.getElementById('button');
connectBtn.addEventListener('click', async () => {
	await connectWallet();
});

const checkMemBtn = document.getElementById('button2');
checkMemBtn.addEventListener('click', async () => {
	await checkMember();
});

document.addEventListener("DOMContentLoaded",async(event) =>{
	await connectWallet();
});