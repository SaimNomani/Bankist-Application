'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-06-02T21:31:17.178Z',
    '2024-06-01T07:42:02.383Z',
    '2024-05-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// setInterval(function(){
//   const time=new Date()
//   const hr=time.getHours()
//   const min=time.getMinutes()
//   const sec=time.getSeconds()
//   console.log(`${hr}: ${min}: ${sec}`);
// }, 1000)

// functions

const calcFormatDates = function (date) {
  const daysPssed = calcDaysPassed(Date.now(), date);

  if (daysPssed === 0) return `today`;
  if (daysPssed === 1) return `yesterday`;
  if (daysPssed <= 7) return `${daysPssed} days ago`;

  // const year = `${date.getFullYear()}`;
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const day = `${date.getDate()}`.padStart(2, 0);

  // replacing above with date internationalization
  const locale = navigator.language;
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
};

const calcDaysPassed = function (date1, date2) {
  return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
};

//internationalizing currencies
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// logout timer function
const logOutTimer = function () {

  // creating call back function outside to make it work immediately not after 1 sec delay
  const tick = function () {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(Math.floor(time % 60)).padStart(2, 0);

    labelTimer.textContent = `${min}: ${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;
    }

    // time-- after if do timeout at 0 not at 1sec
    time--;

  };
  let time = 100;

  // calling tick( ) before setInterval immediate start timer not aftter 1sec delay
  tick();

  // then after each second setInterval will cal the tick()
  const timer = setInterval(tick, 1000);

  return timer;
};

// -----------display movements------------------

const dispalyMovements = function (acc, sorted = false) {
  // console.log(containerMovements.innerHTML);
  // console.log(containerMovements.textContent);

  // to remove preset movements html
  containerMovements.innerHTML = ``;
  console.log(acc);
  console.log(acc.movements);
  const sortedMovements = acc.movements.slice().sort((a, b) => a - b);
  const movs = sorted ? sortedMovements : acc.movements;
  // console.log(movs);

  movs.forEach(function (mov, ind) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // creating date string for each movement
    const date = new Date(acc.movementsDates[ind]);
    const movementDate = calcFormatDates(date);

    //setting the movement row
    const html = ` <div class="movements__row">
  <div class="movements__type movements__type--${type}">${ind + 1} ${type}</div>
  <div class="movements__date">${movementDate}</div>
  <div class="movements__value">${formatCurrency(
    mov,
    acc.locale,
    acc.currency
  )}</div>
</div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// ------------calculating and displaying current balance--------------------
const calcAndDisplayBalance = function (curAcc) {
  curAcc.balance = curAcc.movements.reduce(function (acc, mov, ind) {
    return acc + mov;
  }, 0);
  // console.log(balance);

  //internationalizing currencies
  labelBalance.textContent = `${formatCurrency(
    curAcc.balance,
    curAcc.locale,
    curAcc.currency
  )}`;
};

// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------
// ----------------------------------------------

// ------------calculating and displaying account summary--------------------

const calcAndDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  //internationalizing currencies
  labelSumIn.textContent = `${formatCurrency(
    incomes,
    account.locale,
    account.currency
  )}`;

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  //internationalizing currencies
  labelSumOut.textContent = `${formatCurrency(
    Math.abs(out),
    account.locale,
    account.currency
  )}`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  //internationalizing currencies
  labelSumInterest.textContent = `${formatCurrency(
    interest,
    account.locale,
    account.currency
  )}`;
};

// ------------computing usernames--------------------

// const name = 'Steven Thomas Williams';
const computeUserInitials = function (userAccounts) {
  userAccounts.forEach(function (account, index) {
    account.userName = account.owner
      .toLowerCase()
      .split(' ')
      .map(function (current, index) {
        return current[0];
      })
      .join('');

    // console.log(account.userName);
  });
};
computeUserInitials(accounts);
// console.log(accounts);

// ---------------------------------------------------
// ------------update ui--------------------
// ---------------------------------------------------

const updateUI = function (acc) {
  // displaying movemnets
  dispalyMovements(acc);

  // displaying currnet account balance
  calcAndDisplayBalance(acc);

  // displaying currnet summary
  calcAndDisplaySummary(acc);
};

// ---------------------------------------------------
// ------------implementing liogin--------------------
// ---------------------------------------------------

// adding eventlistner to login button

let currentAccoount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccoount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  if (currentAccoount?.pin === Number(inputLoginPin.value)) {
    // welcome message for logged in user
    labelWelcome.textContent = `welcome back, ${currentAccoount.owner
      .split(' ')
      .at(0)}`;

    // showing the app screen for user by changing  opacity from main element to 100
    containerApp.style.opacity = 100;

    // create date string for date label under current balance
    const date = new Date();
    // const year = `${date.getFullYear()}`;
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const hour = `${date.getHours()}`.padStart(2, 0);
    // const minutes = `${date.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${year}/${month}/${day}, ${hour}:${minutes}`;

    // replacing above with internationalizing
    const locale = navigator.language;
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hours: 'numeric',
      munutes: 'numeric',
      weekday: 'long',
    };
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      date
    );

    updateUI(currentAccoount);

    // checking if there is any ongoing timer on any other account
    if (timer) clearInterval(timer);

    // starting timer after login
    timer = logOutTimer();

    // clearing user input
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
  }
});
// ---------------------------------------------------
// ------------implementing transfer--------------------
// ---------------------------------------------------

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // console.log('transfer');

  const amount = Number(inputTransferAmount.value);
  // console.log(amount);

  const recieverAccount = accounts.find(
    recAcc => inputTransferTo.value === recAcc.userName
  );
  // console.log(recieverAccount);
  // console.log(currentAccoount);

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    recieverAccount &&
    amount > 0 &&
    currentAccoount.balance >= amount &&
    currentAccoount.userName !== recieverAccount.userName
  ) {
    recieverAccount.movements.push(amount);
    currentAccoount.movements.push(-amount);
    currentAccoount.movementsDates.push(new Date().toISOString());
    recieverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccoount);

    // agter each transfer clearing the ingoing timer and start the new one 
    clearInterval(timer);
    timer = logOutTimer();
  }
});

// ---------------------------------------------------
// ------------implementing close account--------------------
// ---------------------------------------------------

btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  if (
    currentAccoount.userName === inputCloseUsername.value &&
    currentAccoount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currentAccoount.userName
    );
    accounts.splice(index, 1);
  }
  inputCloseUsername.value = inputClosePin.value = '';

  containerApp.style.opacity = 0;
  console.log(accounts);
});

// ---------------------------------------------------
// ------------implementing loan request--------------------
// ---------------------------------------------------

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);
  console.log(loanAmount);

  if (
    loanAmount > 0 &&
    currentAccoount.movements.some(mov => mov >= loanAmount * 0.1) //checking if there is any movement whaich is greater or eqaul to 10% of requested loan amount
  ) {
    //pushing loan amount to movements after 5 sec of timeout

    setTimeout(function () {
      currentAccoount.movements.push(loanAmount);

      currentAccoount.movementsDates.push(new Date().toISOString());

      // updating ui
      updateUI(currentAccoount);

      // after each loan clearing the ongoing timer and start the new one 
      clearInterval(timer);
      timer = logOutTimer();
      
    }, 5000);
  }
  inputLoanAmount.value = '';
});

// ---------------------------------------------------
// ------------sorting movements--------------------
// ---------------------------------------------------

let isSorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  dispalyMovements(currentAccoount, !isSorted);
  isSorted = !isSorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

console.log(new Date());
console.log(new Date('Sat Jun 01'));
console.log(new Date(2011, 5, 23, 23, 4, 2, 4));
console.log(Date.now());
console.log(new Date(Date.now()));
const current = new Date();
console.log(current);
console.log(current.getTime());
console.log(current.toISOString());
