import contractAbi from "./abi.js";

// Ethereum 스마트 컨트랙트 주소 
const contractAddress = '0x38D00185DC0eBFdd0A0AFb4a229eFb4FaB3Cd7Bc';
// Web3 객체 생성
const web3 = new Web3(window.ethereum);
// 스마트 컨트랙트 객체 생성
const contract = new web3.eth.Contract(contractAbi, contractAddress);


//connetWallet
export const connectWallet = async() => {
	// MetaMask 계정 요청
	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];
	console.log('MetaMask 계정 주소:', account);

	// 버튼 텍스트 업데이트
	document.getElementById('button').textContent = account;

	ethereum.on('accountsChanged', (accounts) => {
		const account = accounts[0];
		console.log('Metamask 계정 주소: ', account);
		document.getElementById('button').textContent = account;
	});
}

export const checkMember = async () => {
	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];
	const membershipId = document.getElementById('membershipid').value;

	const isMember = await contract.methods.checkUser().call({ from: account });
	console.log('Membershp ID: ', membershipId);
	console.log(web3.utils.keccak256(ethers.utils.formatBytes32String(membershipId)));
	
	if (isMember) {
		const isAuthenticated = await contract.methods.authenticateUser(ethers.utils.formatBytes32String(membershipId)).call({ from: account });
		
		if(isAuthenticated) {
			alert('Password is correct!');
			window.location.href = 'service';
		}
		else {
			alert('Incorrect password. Please try again');
		}
	}
	else  {
		const joinConfirmation = confirm('You\'re a not a member. Would you like to join?');
		if(joinConfirmation) {
			window.location.href = 'join';
		}
		else {
			alert('Using the service as a non-member');
			window.location.href = 'service';
		}
	}
}

//join
export const join = async () => {
    const accounts = await ethereum.request({method: 'eth_requestAccounts' });
    const account = accounts[0];
	const joinId = document.getElementById('join_Id').value;
	console.log('Membership Id: ', joinId);

	// 멤버십ID를 keccak256로 변환
    const _hashedPassword = web3.utils.keccak256(ethers.utils.formatBytes32String(joinId));
    console.log('keccak256로 변환된 joinId:', _hashedPassword);

    //스마트 컨트랙트에 회원가입 요청
    const result = await contract.methods.registerUser(_hashedPassword).send({ from: account });
    console.log(result);

    if(result.status) {
        console.log('user registered successfully');
        //가입 성공 ok 누르면 서비스 이용 창으로 이동함.
        const confirmation = confirm('Press OK and you\'ll be taken to the Services page.');

        if (confirmation) {
        	window.location.href = 'service';
        } else {
        	window.location.href = '/';
        }
    }
    else {
        console.log('user registration failed');
    }
};

//inTimestamp
export const inTimestamp = async () => {
	const accounts = await ethereum.request({method: 'eth_requestAccounts' });
	const account = accounts[0];
    //버튼 누르면 타임 저장.
    const transaction = await contract.methods.getEntryTimestamp().send({ from: account });
	alert('Transaction in progress...');
    const showTimestamp = transaction.events.EntryRecorded.returnValues.entryTimestamp;

	//한국시간 변환

	const _showTimestamp = Number(showTimestamp);
	const date = new Date(_showTimestamp * 1000); // Unix timestamp는 초 단위이므로 1000을 곱해 밀리초로 변환

    // Date 객체에서 각 부분을 추출
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth는 0에서 11까지 반환하므로 1을 더해줌
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 변환된 날짜 및 시간을 문자열로 조합
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	//저장
	localStorage.setItem('entryTimestamp', formattedTimestamp);
	document.getElementById('inBtn').textContent = formattedTimestamp;
	console.log(formattedTimestamp);
	
}

//outTimestamp
export const outTimestamp = async () => {
	const accounts = await ethereum.request({method: 'eth_requestAccounts' });
	const account = accounts[0];

	const currentTimestamp = await contract.methods.getExitTimestamp().call();
	
	//한국시간 변환
	const _currentTimestamp = Number(currentTimestamp);
	const date = new Date(_currentTimestamp * 1000); // Unix timestamp는 초 단위이므로 1000을 곱해 밀리초로 변환

    // Date 객체에서 각 부분을 추출
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth는 0에서 11까지 반환하므로 1을 더해줌
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 변환된 날짜 및 시간을 문자열로 조합
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	document.getElementById('outBtn').textContent = formattedTimestamp;

	const exitTransaction = await contract.methods.exitFee().send({ from: account });
	const fee = exitTransaction.events.ExitRecorded.returnValues.fee;
	alert('Transaction in progress...');
	console.log(fee);

	if(exitTransaction.status){
		window.location.href= '/';
		alert('Payment completed. Good bye');
	}

};


