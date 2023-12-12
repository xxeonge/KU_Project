import contractAbi from "./abi.js";
import tokenAbi from "./tokenabi.js";

// Ethereum 스마트 컨트랙트 주소 
const contractAddress = '0xf777cC2569Cbcf8D31F4ed63641F3c9d13b35841';
const web3 = new Web3(window.ethereum);
let contract = new web3.eth.Contract(contractAbi, contractAddress);
//FEE token 스마트 컨트랙트 주소
const tokenContractAddress = '0xa6Bd8Ab2B991C55A3e8ED521376F7A6B20c3A9A0';


//connetWallet
export const connectWallet = async() => {
	// MetaMask 계정 요청
	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];
	
	// 버튼 텍스트 업데이트
	document.getElementById('button').textContent = account;

	ethereum.on('accountsChanged', (accounts) => {
		const account = accounts[0];
		document.getElementById('button').textContent = account;
	});
}

//checkUser, authenticateUser
export const checkMember = async () => {
	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];
	const carNo =document.getElementById('carnumber').value;

	const isMember = await contract.methods.checkUser().call({ from: account });
	// 가입비를 낸 멤버일 경우
	if (isMember) {
		const isAuthenticated = await contract.methods.authenticateUser(Number(carNo)).call({ from: account });
		// 등록한 주차번호가 맞는지 확인
		if(isAuthenticated) {
			alert('Parking Number is correct! Redirecting to service page.');
			window.location.href = 'service';
		}
		else {
			alert('Incorrect Parking Number. Please try again.');
		}
	}
	// 가입비를 내지 않음.
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

//registerUser
export const join = async () => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    const parkingNumber = document.getElementById('carnumber2').value;
	contract = new web3.eth.Contract(contractAbi, contractAddress, account.signer);
	const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress, account.signer);
    // 가입비
    const membershipFee = await contract.methods.getMembershipFee().call();
	
    // 가입비 승인
    const approvalTransaction = await tokenContract.methods.approve(contractAddress, membershipFee).send({ from: account });
	alert('Transaction in progress...');

    if (approvalTransaction.status) {
        // 회원가입 트랜잭션
        const feeTransaction = await contract.methods.registerUser(parkingNumber).send({ from: account });

        if (feeTransaction.status) {
            const confirmation = confirm('Registration is successful. Press Ok, Go to service page.');
            if (confirmation) {
                window.location.href = 'service';
            } else {
                window.location.href = '/';
            }
        } else {
            alert('User registration failed. Please try again');
        }
    }s
}

//inTimestamp
export const inTimestamp = async () => {
	const accounts = await ethereum.request({method: 'eth_requestAccounts' });
	const account = accounts[0];

    //버튼 누르면 타임 저장.
    const transaction = await contract.methods.entryTimestamp().send({ from: account });
	alert('Transaction in progress...');
    const showTimestamp = transaction.events.EntryRecorded.returnValues.entryTimestamps;

	//한국시간 변환
	const _showTimestamp = Number(showTimestamp);
	const date = new Date(_showTimestamp * 1000); 

    // Date 객체에서 각 부분을 추출
    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 변환된 날짜 및 시간을 문자열로 조합
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	localStorage.setItem('entryTimestamp', formattedTimestamp);
	document.getElementById('inBtn').textContent = formattedTimestamp;
}

//outTimestamp
export const outTimestamp = async () => {
	const accounts = await ethereum.request({method: 'eth_requestAccounts' });
	const account = accounts[0];

	const currentTimestamp = await contract.methods.getExitTimestamp().call();
	
	//한국시간 변환
	const _currentTimestamp = Number(currentTimestamp);
	const date = new Date(_currentTimestamp * 1000);

    // Date 객체에서 각 부분을 추출
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 변환된 날짜 및 시간을 문자열로 조합
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	document.getElementById('outBtn').textContent = formattedTimestamp;

	const exitTransaction = await contract.methods.exitFee().send({ from: account });
	const fee = exitTransaction.events.ExitRecorded.returnValues.fee;
	
	//fee가 0이 아닐 때
	if (fee > 0) {
		alert('Transaction in progress...');
			if (exitTransaction.status) {
				window.location.href ='/';
				alert('Payment completed. Good bye!');
			}
	} else {
		alert('Transaction in progress...');
		window.location.href ='/';
		alert('This exit is free. Have a nice day!');
		
		}

};


