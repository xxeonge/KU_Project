import { connectWallet, join } from "./common.js";

//join.html
document.addEventListener("DOMContentLoaded",async(event) =>{
	await connectWallet();
});

//버튼 클릭 이벤트 핸들러
const joinBtn = document.getElementById('button3');
joinBtn.addEventListener('click', async () => {
    await join();
    
});



