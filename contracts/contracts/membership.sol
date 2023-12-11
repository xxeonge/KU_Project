// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import 'hardhat/console.sol';

// 인터페이스: ERC20 토큰 전송 함수 사용
interface IERC20  {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

//사용자 데이터베이스
contract membership {
    // 계정 주소에 대한 비밀번호 해시 매핑
    mapping(address => bytes32) private passwordHashes;
    // 계정 주소에 대한 입차 타임스탬프 매핑
    mapping(address => uint256) private getTimestamps;
    address private permission;
    // 주차비 토큰 주소
    address feeToken; 

     // 이벤트 정의
    event AccountRegistered(address indexed userAddress);
    event AuthenticationResult(address indexed userAddress, bool isAuthenticated);
    event SetPermission(address indexed oldUser, address indexed newUser);
    event EntryRecorded(address indexed userAddress, uint256 entryTimestamp);
    event ExitRecorded(address indexed userAddress, uint256 exitTimestamp, uint256 fee);
    
    // 컨트랙트 생성자: 토큰 주소 초기화
    constructor(address _token) { 
        permission = msg.sender;
        feeToken = _token;
    }

    // 퍼미션 권한 변경 함수
    function setPermission(address newUser) external {
        require(msg.sender == permission,'dont use');
        permission = newUser;
        emit SetPermission(msg.sender, newUser);
    }

    // 멤버 여부 확인 함수, 비밀번호 해시값 0일 경우 멤버 아님
    function checkUser() public view returns(bool){
        return passwordHashes[msg.sender] == 0 ? false : true;
    }

    // 회원가입 함수: 비밀번호를 입력 받아 해시값 저장
    function registerUser(bytes32 _hashedPassword) external {
        passwordHashes[msg.sender] = _hashedPassword;
        emit AccountRegistered(msg.sender);
    } 

    // 멤버 인증 함수: 입력받은 비밀번호와 저장된 해시값 비교, 인증 여부 반환
    function authenticateUser(bytes32 _inputPassword) public view returns (bool) {
        bytes32 hashedInputPassword = keccak256(abi.encodePacked(_inputPassword));
        return hashedInputPassword == passwordHashes[msg.sender];
    }
    
    // 입차 타임스탬프 기록 함수: 프론트에서 버튼을 눌렀을 때, 현재 주소의 입차 타임스탬프 기록
    function getEntryTimestamp() external {
        uint256 timestamp = block.timestamp;
        getTimestamps[msg.sender] = timestamp;
        emit EntryRecorded(msg.sender, timestamp);
    }

    //출차 타임스탬프 반환
    function getExitTimestamp() external view returns(uint256) {
       return block.timestamp;
    }

    //주차비 계산 및 결제 함수
    function exitFee() public payable {
        uint256 parkingDuration = block.timestamp - getTimestamps[msg.sender];
        uint256 fee;
        // 멤버인 경우, 주차 시간 3시간 이하일 경우 주차비 0, 추가 주차 시간 계산
        if(checkUser()){
            if (parkingDuration <= 3 hours) {
                fee = 0;
            } else {   
                uint256 memberTime = (parkingDuration - 3 hours) / 10 minutes;
                fee = memberTime * 1000;
            }
        } 
        // 멤버가 아닐 경우 
        else {
            uint256 notmemberTime = parkingDuration / 10 minutes;
            fee = notmemberTime * 1000;
        }

        // 입차 기록 초기화
        getTimestamps[msg.sender] = 0;

         // 출차 기록 타임스탬프 발생
        emit ExitRecorded(msg.sender, block.timestamp, fee);

        // 주차비 컨트랙트로 전송
        IERC20(feeToken).transferFrom(msg.sender, address(this), fee * 10 ** 18);
    } 

    // 사용자 입차 시간 확인 
    function getEntry() public view returns(uint) {
        return getTimestamps[msg.sender];
    }
}